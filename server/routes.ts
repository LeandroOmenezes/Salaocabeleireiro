import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword, generatePasswordResetToken, verifyPasswordResetToken, removePasswordResetToken, sendPasswordResetEmail } from "./auth";
import { insertAppointmentSchema, insertSaleSchema, insertReviewSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // === Clients ===
  app.get("/api/clients", async (req: Request, res: Response) => {
    try {
      // Only allow authenticated users
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Error fetching clients" });
    }
  });
  
  app.get("/api/clients/:id", async (req: Request, res: Response) => {
    try {
      // Only allow authenticated users
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const client = await storage.getClientById(id);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Error fetching client" });
    }
  });
  
  app.post("/api/clients", async (req: Request, res: Response) => {
    try {
      // Only allow authenticated users
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { name, phone, email } = req.body;
      
      if (!name || !phone) {
        return res.status(400).json({ message: "Name and phone are required" });
      }
      
      const client = await storage.createClient({ name, phone, email });
      res.status(201).json(client);
    } catch (error) {
      res.status(500).json({ message: "Error creating client" });
    }
  });
  
  app.patch("/api/clients/:id", async (req: Request, res: Response) => {
    try {
      // Only allow authenticated users
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const { name, phone, email } = req.body;
      const client = await storage.updateClient(id, { name, phone, email });
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Error updating client" });
    }
  });
  
  app.delete("/api/clients/:id", async (req: Request, res: Response) => {
    try {
      // Only allow authenticated users
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const success = await storage.deleteClient(id);
      
      if (!success) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting client" });
    }
  });
  
  // === Categories ===
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories" });
    }
  });
  
  // === Services ===
  app.get("/api/services/all", async (req: Request, res: Response) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Error fetching services" });
    }
  });
  
  app.get("/api/services/featured", async (req: Request, res: Response) => {
    try {
      const services = await storage.getFeaturedServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Error fetching featured services" });
    }
  });
  
  app.get("/api/services/:categoryId", async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const services = await storage.getServicesByCategory(categoryId);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Error fetching services by category" });
    }
  });
  
  // === Price Items ===
  app.get("/api/prices", async (req: Request, res: Response) => {
    try {
      const priceItems = await storage.getPriceItems();
      res.json(priceItems);
    } catch (error) {
      res.status(500).json({ message: "Error fetching price items" });
    }
  });
  
  app.get("/api/prices/:categoryId", async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const priceItems = await storage.getPriceItemsByCategory(categoryId);
      res.json(priceItems);
    } catch (error) {
      res.status(500).json({ message: "Error fetching price items by category" });
    }
  });
  
  // === Appointments ===
  app.post("/api/appointments", async (req: Request, res: Response) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      console.log("[appointments] Creating appointment with data:", appointmentData);
      const appointment = await storage.createAppointment(appointmentData);
      console.log("[appointments] Created appointment:", appointment);
      
      // Verificar quantos agendamentos existem após criar este
      const appointments = await storage.getAppointments();
      console.log(`[appointments] Total appointments after creation: ${appointments.length}`);
      
      res.status(201).json(appointment);
    } catch (error) {
      console.error("[appointments] Error creating appointment:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating appointment" });
      }
    }
  });
  
  app.get("/api/appointments", async (req: Request, res: Response) => {
    try {
      // Mesmo para usuários não autenticados, retornar uma lista vazia
      // para evitar o erro 401 que poderia causar problemas na interface
      if (!req.isAuthenticated()) {
        console.log("[appointments] User not authenticated, returning empty array");
        return res.json([]);
      }
      
      const appointments = await storage.getAppointments();
      console.log(`[appointments] Returning ${appointments.length} appointments:`, appointments);
      res.json(appointments);
    } catch (error) {
      console.error("[appointments] Error fetching appointments:", error);
      res.status(500).json({ message: "Error fetching appointments" });
    }
  });
  
  app.patch("/api/appointments/:id/status", async (req: Request, res: Response) => {
    try {
      // Only allow authenticated users
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(id) || !status) {
        return res.status(400).json({ message: "Invalid request data" });
      }
      
      const appointment = await storage.updateAppointmentStatus(id, status);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Error updating appointment status" });
    }
  });
  
  // === Reviews ===
  app.get("/api/reviews", async (req: Request, res: Response) => {
    try {
      const reviews = await storage.getReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reviews" });
    }
  });
  
  app.post("/api/reviews", async (req: Request, res: Response) => {
    try {
      // Verificar se o usuário está autenticado
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "É necessário estar logado para enviar avaliações" });
      }
      
      // Se o nome do cliente não for fornecido, usar o nome do usuário logado
      if (!req.body.clientName && req.user) {
        req.body.clientName = req.user.name || req.user.username;
      }
      
      // Validar os dados da avaliação
      const reviewData = insertReviewSchema.parse(req.body);
      
      // Criar a avaliação
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Dados de avaliação inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao criar avaliação" });
      }
    }
  });
  
  // Rota para dar/remover like (coração) em uma avaliação
  app.post("/api/reviews/:id/like", async (req: Request, res: Response) => {
    try {
      const reviewId = parseInt(req.params.id);
      
      // Verificar se o usuário está autenticado
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "É necessário estar logado para curtir avaliações" });
      }
      
      const result = await storage.toggleLikeReview(reviewId, req.user.id);
      
      if (!result) {
        return res.status(404).json({ message: "Avaliação não encontrada" });
      }
      
      res.status(200).json({
        review: result.review,
        userLiked: result.userLiked
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao processar like na avaliação" });
    }
  });

  // Rota para obter os likes do usuário
  app.get("/api/user/likes", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "É necessário estar logado" });
      }
      
      const userLikes = await storage.getUserLikes(req.user.id);
      res.status(200).json(userLikes);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar likes do usuário" });
    }
  });
  
  // === Admin Users Management ===
  app.get("/api/admin/users", async (req: Request, res: Response) => {
    try {
      // Only allow authenticated admin users
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const users = await storage.getUsers();
      // Remove passwords from response
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.post("/api/admin/users", async (req: Request, res: Response) => {
    try {
      // Only allow authenticated admin users
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { username, password, name, phone, isAdmin } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        name,
        phone,
        isAdmin: isAdmin || false
      });
      
      // Remove password from response
      const { password: _, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.delete("/api/admin/users/:id", async (req: Request, res: Response) => {
    try {
      // Only allow authenticated admin users
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Prevent deleting own account
      if (req.user?.id === id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting user" });
    }
  });

  // === Sales ===
  app.post("/api/sales", async (req: Request, res: Response) => {
    try {
      // Only allow authenticated users
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const saleData = insertSaleSchema.parse(req.body);
      const sale = await storage.createSale(saleData);
      res.status(201).json(sale);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid sale data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating sale" });
      }
    }
  });
  
  app.get("/api/sales", async (req: Request, res: Response) => {
    try {
      // Only allow authenticated users
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const sales = await storage.getSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Error fetching sales" });
    }
  });
  
  app.get("/api/sales/filter", async (req: Request, res: Response) => {
    try {
      // Only allow authenticated users
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const sales = await storage.getSalesByDate(start, end);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Error fetching filtered sales" });
    }
  });

  // === Password Reset Routes ===
  app.post("/api/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email é obrigatório" });
      }
      
      // Verificar se o usuário existe
      const user = await storage.getUserByUsername(email);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado com este email" });
      }
      
      // Gerar token de reset
      const resetToken = generatePasswordResetToken(user.id);
      
      try {
        // Tentar enviar email
        await sendPasswordResetEmail(email, resetToken);
        res.status(200).json({ 
          message: "Email de recuperação enviado com sucesso. Verifique sua caixa de entrada." 
        });
      } catch (emailError: any) {
        console.error("Email error:", emailError.message);
        
        // Se o erro contém um link de reset, enviar para o cliente
        if (emailError.message.includes('EMAIL_NOT_CONFIGURED:') || emailError.message.includes('EMAIL_CONFIG_ERROR:')) {
          const resetLink = emailError.message.split(':')[1];
          res.status(200).json({ 
            message: "Sistema de email temporariamente indisponível. Use este link para redefinir sua senha:",
            resetLink: resetLink
          });
        } else {
          res.status(500).json({ message: "Erro ao enviar email de recuperação" });
        }
      }
    } catch (error) {
      console.error("Erro ao processar recuperação de senha:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/verify-reset-token", async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Token é obrigatório" });
      }
      
      const valid = verifyPasswordResetToken(token);
      res.status(200).json({ valid });
    } catch (error) {
      res.status(500).json({ message: "Erro ao verificar token" });
    }
  });

  app.post("/api/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token e senha são obrigatórios" });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ message: "Senha deve ter no mínimo 6 caracteres" });
      }
      
      const userId = verifyPasswordResetToken(token);
      if (!userId) {
        return res.status(400).json({ message: "Token inválido ou expirado" });
      }
      
      // Hash da nova senha
      const hashedPassword = await hashPassword(password);
      
      // Atualizar senha do usuário
      const user = await storage.updateUserPassword(userId, hashedPassword);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Remover token usado
      removePasswordResetToken(token);
      
      res.status(200).json({ message: "Senha redefinida com sucesso" });
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
