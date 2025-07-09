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
    interface User extends UserType {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
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
  const baseUrl = process.env.REPLIT_DEV_DOMAIN || 'https://074180d3-6593-4975-b6e8-b8a879923e7e-00-22oylhbt1l0da.janeway.replit.dev';
  const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
  
  // Para desenvolvimento, vamos simular o envio do email e mostrar o link no console
  // Em produção, aqui seria configurado um serviço de email real
  console.log('\n=== EMAIL DE RECUPERAÇÃO DE SENHA ===');
  console.log(`Para: ${email}`);
  console.log(`Link de recuperação: ${resetLink}`);
  console.log('=====================================\n');
  
  // Simular sucesso do email
  return Promise.resolve();
}

// Função para gerar um token de recuperação de senha
function generatePasswordResetToken(userId: number): string {
  const token = randomBytes(32).toString('hex');
  const expires = new Date();
  expires.setHours(expires.getHours() + 1); // Token expira em 1 hora
  
  passwordResetTokens.set(token, { userId, expires });
  return token;
}

// Função para verificar um token de recuperação de senha
function verifyPasswordResetToken(token: string): number | null {
  const tokenData = passwordResetTokens.get(token);
  
  if (!tokenData) {
    return null;
  }
  
  if (new Date() > tokenData.expires) {
    passwordResetTokens.delete(token);
    return null;
  }
  
  return tokenData.userId;
}

// Função para remover um token usado
function removePasswordResetToken(token: string): void {
  passwordResetTokens.delete(token);
}

export { hashPassword, generatePasswordResetToken, verifyPasswordResetToken, removePasswordResetToken, sendPasswordResetEmail };

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
    
    // Detectar automaticamente a URL do ambiente
    const getBaseUrl = () => {
      // Em produção no Replit, usar a URL do ambiente
      if (process.env.REPLIT_DOMAINS) {
        return `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`;
      }
      
      // Fallback para desenvolvimento local
      return process.env.APP_URL || "http://localhost:5000";
    };
    
    const baseUrl = getBaseUrl();
    const callbackUrl = `${baseUrl}/api/auth/google/callback`;
    
    console.log("Base URL:", baseUrl);
    console.log("Google callback URL:", callbackUrl);
    
    // Verificar se as credenciais do Google são válidas
    if (!process.env.GOOGLE_CLIENT_ID.includes('.googleusercontent.com')) {
      console.warn("ATENÇÃO: As credenciais do Google podem estar incorretas ou expiradas");
    }
    
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
            console.log("Google profile received:", profile.displayName, profile.emails?.[0]?.value);
            
            // Verificar se o usuário já existe no sistema
            const email = profile.emails?.[0]?.value;
            if (!email) {
              console.error("No email found in Google profile");
              return done(new Error("No email found in Google profile"));
            }
            
            let user = await storage.getUserByUsername(email);
            
            // Se o usuário não existir, criar um novo automaticamente
            if (!user) {
              console.log("Creating new user from Google profile:", email);
              user = await storage.createUser({
                username: email,
                password: await hashPassword(randomBytes(16).toString('hex')), // Senha aleatória
                name: profile.displayName || email.split('@')[0],
                phone: "", // Campo obrigatório, mas pode ser vazio para usuários do Google
                isAdmin: false
              });
              console.log("New user created successfully:", user.username);
            } else {
              console.log("Existing user found:", user.username);
            }
            
            return done(null, user);
          } catch (error) {
            console.error("Error in Google OAuth callback:", error);
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
      
      // Validar campos obrigatórios
      if (!username || !password || !name || !phone) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
      }
      
      // Validar formato de email
      if (!username.includes('@') || !username.includes('.')) {
        return res.status(400).json({ message: "Email inválido" });
      }
      
      // Validar tamanho da senha
      if (password.length < 6) {
        return res.status(400).json({ message: "Senha deve ter no mínimo 6 caracteres" });
      }
      
      // Validar nome
      if (name.length < 3) {
        return res.status(400).json({ message: "Nome deve ter pelo menos 3 caracteres" });
      }
      
      // Validar telefone
      if (phone.length < 10) {
        return res.status(400).json({ message: "Telefone inválido" });
      }
      
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Já existe uma conta com este email" });
      }

      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
        name,
        phone,
        isAdmin: false // Novos usuários não são admin por padrão
      });

      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send the password hash to the client
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Erro no registro:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false | null, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Email ou senha inválidos" });
      
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
    app.get("/api/auth/google", (req, res, next) => {
      console.log("Iniciando autenticação Google...");
      console.log("URL atual:", req.get('host'));
      passport.authenticate("google", {
        scope: ['profile', 'email']
      })(req, res, next);
    });
    
    // Rota para callback do Google após autenticação
    app.get(
      "/api/auth/google/callback",
      (req, res, next) => {
        console.log("Google callback recebido");
        
        passport.authenticate("google", (err: Error | null, user: Express.User | false | null, info: any) => {
          console.log("Google auth callback result:", { err: err?.message, user: user ? 'User found' : 'No user', info });
          
          if (err) {
            console.error("Google auth error:", err);
            return res.redirect("/auth?error=" + encodeURIComponent("Erro na autenticação: " + err.message));
          }
          
          if (!user) {
            console.error("Google auth failed - no user returned from strategy");
            return res.redirect("/auth?error=Falha+na+autenticação+com+o+Google");
          }
          
          console.log("Attempting to login user:", user);
          
          req.login(user, (loginErr) => {
            if (loginErr) {
              console.error("Login error:", loginErr);
              return res.redirect("/auth?error=" + encodeURIComponent("Erro ao fazer login: " + loginErr.message));
            }
            
            console.log("Login com Google bem-sucedido para:", user.username);
            console.log("Session after login:", req.session);
            console.log("User authenticated:", req.isAuthenticated());
            
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