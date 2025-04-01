import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as UserType } from "@shared/schema";
import createMemoryStore from "memorystore";
import nodemailer from "nodemailer";

const MemoryStore = createMemoryStore(session);

// Armazenamento temporário para tokens de recuperação de senha
// Na produção, isso deve ser armazenado em um banco de dados
const passwordResetTokens = new Map<string, { userId: number; expires: Date }>();

declare global {
  namespace Express {
    // Estendendo a interface User do Express para incluir nossos campos personalizados
    interface User {
      id: number;
      username: string;
      password: string;
      name: string;
      phone?: string;
      email?: string;
      isAdmin?: boolean;
    }
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Função para enviar e-mail de recuperação de senha
async function sendPasswordResetEmail(email: string, resetToken: string) {
  // Verificar se as credenciais de e-mail estão configuradas
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("Email credentials not configured. Would send reset email to:", email);
    console.log("With reset token:", resetToken);
    console.log("Reset link:", `${process.env.APP_URL || 'http://localhost:5000'}/reset-password/${resetToken}`);
    return;
  }

  // Configurar o transportador de e-mail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Configurar o e-mail
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Recuperação de Senha - Salão de Beleza',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d6436e;">Recuperação de Senha</h2>
        <p>Você solicitou a recuperação de senha para sua conta no Salão de Beleza.</p>
        <p>Clique no botão abaixo para redefinir sua senha:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.APP_URL || 'http://localhost:5000'}/reset-password/${resetToken}" 
             style="background-color: #d6436e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Redefinir Senha
          </a>
        </div>
        <p>Se você não solicitou esta recuperação, ignore este e-mail.</p>
        <p>Este link expira em 1 hora.</p>
      </div>
    `
  };

  // Enviar o e-mail
  await transporter.sendMail(mailOptions);
}

// Função para gerar um token de recuperação de senha
function generatePasswordResetToken(userId: number): string {
  const token = randomBytes(32).toString('hex');
  const expires = new Date();
  expires.setHours(expires.getHours() + 1); // Token expira em 1 hora
  
  passwordResetTokens.set(token, { userId, expires });
  return token;
}

export function setupAuth(app: Express) {
  const sessionStore = new MemoryStore({
    checkPeriod: 86400000, // prune expired entries every 24h
  });
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "salon-beauty-secret-key",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Estratégia de autenticação local
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );
  
  // Estratégia de autenticação do Google (configurada se as credenciais estiverem disponíveis)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log("Google auth configured with CLIENT_ID:", process.env.GOOGLE_CLIENT_ID.substring(0, 5) + "...");
    
    // Obter o domínio do Replit em execução
    const appUrl = process.env.REPL_SLUG ? 
      `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 
      (process.env.APP_URL || 'http://localhost:5000');
    
    const callbackUrl = `${appUrl}/api/auth/google/callback`;
    console.log("Google callback URL:", callbackUrl);
    
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: callbackUrl,
          scope: ['profile', 'email']
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Verificar se o usuário já existe no sistema
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error("No email found in Google profile"));
            }
            
            let user = await storage.getUserByUsername(email);
            
            // Se o usuário não existir, criar um novo
            if (!user) {
              user = await storage.createUser({
                username: email,
                password: await hashPassword(randomBytes(16).toString('hex')), // Senha aleatória
                name: profile.displayName,
                email: email
              });
            }
            
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, name, phone } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
        name,
        phone
      });

      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send the password hash to the client
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid username or password" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send the password hash to the client
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Don't send the password hash to the client
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
  
  // Rotas de autenticação do Google
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    // Rota para iniciar o processo de autenticação do Google
    app.get("/api/auth/google", passport.authenticate("google"));
    
    // Rota para callback do Google após autenticação
    app.get(
      "/api/auth/google/callback",
      (req, res, next) => {
        passport.authenticate("google", (err, user, info) => {
          if (err) {
            console.error("Google auth error:", err);
            return res.redirect("/auth?error=" + encodeURIComponent("Erro na autenticação: " + err.message));
          }
          
          if (!user) {
            console.error("Google auth failed - no user");
            return res.redirect("/auth?error=Falha na autenticação com o Google");
          }
          
          req.login(user, (err) => {
            if (err) {
              console.error("Login error:", err);
              return res.redirect("/auth?error=" + encodeURIComponent("Erro ao fazer login: " + err.message));
            }
            
            // Sucesso - redirecionar para a página inicial
            return res.redirect("/");
          });
        })(req, res, next);
      }
    );
  }
  
  // Rota para solicitar recuperação de senha
  app.post("/api/forgot-password", async (req, res, next) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Verificar se o usuário existe
      const user = await storage.getUserByUsername(email);
      if (!user) {
        // Por razões de segurança, não informamos ao cliente se o usuário existe ou não
        return res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
      }
      
      // Gerar token de recuperação de senha
      const resetToken = generatePasswordResetToken(user.id);
      
      // Enviar e-mail de recuperação
      await sendPasswordResetEmail(email, resetToken);
      
      res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
    } catch (error) {
      next(error);
    }
  });
  
  // Rota para verificar a validade do token de redefinição
  app.get("/api/reset-password/:token", (req, res) => {
    const { token } = req.params;
    const tokenData = passwordResetTokens.get(token);
    
    if (!tokenData || tokenData.expires < new Date()) {
      return res.status(400).json({ valid: false, message: "Invalid or expired token" });
    }
    
    res.json({ valid: true });
  });
  
  // Rota para redefinir a senha com um token válido
  app.post("/api/reset-password/:token", async (req, res, next) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }
      
      const tokenData = passwordResetTokens.get(token);
      
      if (!tokenData || tokenData.expires < new Date()) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      
      // Obter usuário pelo ID
      const user = await storage.getUser(tokenData.userId);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      
      // Atualizar a senha do usuário com a senha criptografada
      const hashedPassword = await hashPassword(password);
      await storage.updateUserPassword(user.id, hashedPassword);
      
      // Remover o token usado
      passwordResetTokens.delete(token);
      
      res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
      next(error);
    }
  });
}
