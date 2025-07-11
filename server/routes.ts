import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword, generatePasswordResetToken, verifyPasswordResetToken, removePasswordResetToken, sendPasswordResetEmail } from "./auth";
import { insertAppointmentSchema, insertSaleSchema, insertReviewSchema, insertBannerSchema, insertFooterSchema, insertPriceItemSchema, insertServiceSchema, insertCategorySchema, insertSiteConfigSchema } from "@shared/schema";
import { ZodError } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // Configure multer for file uploads
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const storage_config = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'service-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  
  const upload = multer({
    storage: storage_config,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Apenas imagens JPEG, PNG e WebP são permitidas'));
      }
    }
  });
  
  // Serve uploaded images
  app.use('/uploads', express.static(uploadsDir));
  
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

  // Upload image for service
  app.post("/api/services/:id/upload-image", upload.single('image'), async (req: Request, res: Response) => {
    try {
      // Only allow authenticated admin users
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem fazer upload de imagens." });
      }

      const serviceId = parseInt(req.params.id);
      if (isNaN(serviceId)) {
        return res.status(400).json({ message: "ID de serviço inválido" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Nenhuma imagem foi enviada" });
      }

      // Create the image URL
      const imageUrl = `/uploads/${req.file.filename}`;
      
      // Update service with new image URL
      const updatedService = await storage.updateServiceImage(serviceId, imageUrl);
      
      if (!updatedService) {
        // If service doesn't exist, remove the uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: "Serviço não encontrado" });
      }

      res.json({
        message: "Imagem enviada com sucesso",
        service: updatedService,
        imageUrl
      });
    } catch (error) {
      console.error("Error uploading service image:", error);
      // Remove the uploaded file if an error occurred
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error("Error removing uploaded file:", unlinkError);
        }
      }
      res.status(500).json({ message: "Erro ao fazer upload da imagem" });
    }
  });

  // === Service Management (Admin Only) ===
  app.post("/api/admin/services", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem criar serviços." });
      }

      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      
      res.status(201).json({
        message: "Serviço criado com sucesso",
        service
      });
    } catch (error) {
      console.error("Error creating service:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Dados do serviço inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao criar serviço" });
      }
    }
  });

  app.delete("/api/admin/services/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem remover serviços." });
      }

      const id = parseInt(req.params.id);
      const deleted = await storage.deleteService(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Serviço não encontrado" });
      }

      res.json({ message: "Serviço removido com sucesso" });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Erro ao remover serviço" });
    }
  });

  app.patch("/api/admin/services/:id/featured", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem alterar destaque de serviços." });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de serviço inválido" });
      }

      const { featured } = req.body;
      if (typeof featured !== 'boolean') {
        return res.status(400).json({ message: "O campo featured deve ser um valor booleano" });
      }

      const updated = await storage.updateServiceFeatured(id, featured);
      
      if (!updated) {
        return res.status(404).json({ message: "Serviço não encontrado" });
      }

      res.json({ message: "Status de destaque atualizado com sucesso" });
    } catch (error) {
      console.error("Error updating service featured status:", error);
      res.status(500).json({ message: "Erro ao atualizar status de destaque" });
    }
  });

  app.put("/api/admin/services/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem editar serviços." });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de serviço inválido" });
      }

      const validatedData = insertServiceSchema.parse(req.body);
      const updated = await storage.updateService(id, validatedData);
      
      if (!updated) {
        return res.status(404).json({ message: "Serviço não encontrado" });
      }

      res.json({ message: "Serviço atualizado com sucesso", service: updated });
    } catch (error) {
      console.error("Error updating service:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Dados do serviço inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao atualizar serviço" });
      }
    }
  });

  // === Category Management (Admin Only) ===
  app.post("/api/admin/categories", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem criar categorias." });
      }

      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      
      res.status(201).json({
        message: "Categoria criada com sucesso",
        category
      });
    } catch (error) {
      console.error("Error creating category:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Dados da categoria inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao criar categoria" });
      }
    }
  });

  app.put("/api/admin/categories/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem editar categorias." });
      }

      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      
      if (!category) {
        return res.status(404).json({ message: "Categoria não encontrada" });
      }

      res.json({
        message: "Categoria atualizada com sucesso",
        category
      });
    } catch (error) {
      console.error("Error updating category:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Dados da categoria inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao atualizar categoria" });
      }
    }
  });

  app.delete("/api/admin/categories/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem remover categorias." });
      }

      const id = parseInt(req.params.id);
      
      // Check if there are services or price items in this category
      const services = await storage.getServicesByCategory(id);
      const priceItems = await storage.getPriceItemsByCategory(id);
      
      const deleted = await storage.deleteCategory(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Categoria não encontrada" });
      }

      const deletedCount = services.length + priceItems.length;
      res.json({ 
        message: `Categoria removida com sucesso. ${deletedCount} itens relacionados também foram removidos.`,
        deletedServices: services.length,
        deletedPriceItems: priceItems.length
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Erro ao remover categoria" });
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

  // === Price Management (Admin Only) ===
  app.post("/api/admin/prices", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem criar preços." });
      }

      const priceData = insertPriceItemSchema.parse(req.body);
      const priceItem = await storage.createPriceItem(priceData);
      
      res.status(201).json({
        message: "Item de preço criado com sucesso",
        priceItem
      });
    } catch (error) {
      console.error("Error creating price item:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Dados do preço inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao criar item de preço" });
      }
    }
  });

  app.put("/api/admin/prices/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem editar preços." });
      }

      const id = parseInt(req.params.id);
      const priceData = insertPriceItemSchema.partial().parse(req.body);
      const updatedPriceItem = await storage.updatePriceItem(id, priceData);
      
      if (!updatedPriceItem) {
        return res.status(404).json({ message: "Item de preço não encontrado" });
      }

      res.json({
        message: "Item de preço atualizado com sucesso",
        priceItem: updatedPriceItem
      });
    } catch (error) {
      console.error("Error updating price item:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Dados do preço inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao atualizar item de preço" });
      }
    }
  });

  app.delete("/api/admin/prices/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem remover preços." });
      }

      const id = parseInt(req.params.id);
      const deleted = await storage.deletePriceItem(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Item de preço não encontrado" });
      }

      res.json({ message: "Item de preço removido com sucesso" });
    } catch (error) {
      console.error("Error deleting price item:", error);
      res.status(500).json({ message: "Erro ao remover item de preço" });
    }
  });
  
  // === Appointments ===
  app.post("/api/appointments", async (req: Request, res: Response) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      console.log("[appointments] Creating appointment with data:", appointmentData);
      
      // Verificar se já existe um agendamento no mesmo horário
      const existingAppointments = await storage.getAppointments();
      const conflictingAppointment = existingAppointments.find(existing => 
        existing.date === appointmentData.date && 
        existing.time === appointmentData.time &&
        existing.status !== 'cancelled'
      );
      
      if (conflictingAppointment) {
        return res.status(409).json({ 
          message: "Este horário já está ocupado. Por favor, escolha outro horário disponível."
        });
      }
      
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
      // Verificar se o usuário está autenticado e é admin
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        console.log("[appointments] Unauthorized access attempt");
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const appointments = await storage.getAppointments();
      console.log(`[appointments] Returning ${appointments.length} appointments for admin`);
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

  app.get("/api/reset-password/:token", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({ message: "Token é obrigatório" });
      }
      
      const userId = verifyPasswordResetToken(token);
      const valid = userId !== null;
      res.status(200).json({ valid });
    } catch (error) {
      res.status(500).json({ message: "Erro ao verificar token" });
    }
  });

  app.post("/api/reset-password/:token", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
      
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

  // === Banner Management ===
  app.get("/api/banner", async (req: Request, res: Response) => {
    try {
      const banner = await storage.getBanner();
      res.json(banner);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar configuração do banner" });
    }
  });

  app.put("/api/banner", async (req: Request, res: Response) => {
    try {
      // Only allow authenticated admin users
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem editar o banner." });
      }

      const bannerData = insertBannerSchema.parse(req.body);
      const banner = await storage.updateBanner(bannerData);
      
      res.json({
        message: "Banner atualizado com sucesso",
        banner
      });
    } catch (error) {
      console.error("Error updating banner:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Dados do banner inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao atualizar banner" });
      }
    }
  });

  // Upload background image for banner
  app.post("/api/banner/upload-image", upload.single('image'), async (req: Request, res: Response) => {
    try {
      // Only allow authenticated admin users
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem fazer upload de imagens." });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Nenhuma imagem foi enviada" });
      }

      // Create the image URL
      const imageUrl = `/uploads/${req.file.filename}`;
      
      // Update banner with new background image
      const updatedBanner = await storage.updateBannerImage(imageUrl);
      
      if (!updatedBanner) {
        // If banner doesn't exist, remove the uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: "Configuração de banner não encontrada" });
      }

      res.json({
        message: "Imagem de fundo do banner atualizada com sucesso",
        banner: updatedBanner,
        imageUrl
      });
    } catch (error) {
      console.error("Error uploading banner image:", error);
      // Remove the uploaded file if an error occurred
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error("Error removing uploaded file:", unlinkError);
        }
      }
      res.status(500).json({ message: "Erro ao fazer upload da imagem do banner" });
    }
  });

  // === Footer Management ===
  app.get("/api/footer", async (req: Request, res: Response) => {
    try {
      const footer = await storage.getFooter();
      res.json(footer);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar configuração do rodapé" });
    }
  });

  app.put("/api/footer", async (req: Request, res: Response) => {
    try {
      // Only allow authenticated admin users
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem editar o rodapé." });
      }

      const footerData = insertFooterSchema.parse(req.body);
      const footer = await storage.updateFooter(footerData);
      
      res.json({
        message: "Rodapé atualizado com sucesso",
        footer
      });
    } catch (error) {
      console.error("Error updating footer:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Dados do rodapé inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao atualizar rodapé" });
      }
    }
  });

  // === Site Configuration ===
  app.get("/api/site-config", async (req: Request, res: Response) => {
    try {
      const config = await storage.getSiteConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar configuração do site" });
    }
  });

  app.put("/api/site-config", async (req: Request, res: Response) => {
    try {
      // Only allow authenticated admin users
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem editar as configurações do site." });
      }

      const configData = insertSiteConfigSchema.parse(req.body);
      const config = await storage.updateSiteConfig(configData);
      
      res.json({
        message: "Configuração do site atualizada com sucesso",
        config
      });
    } catch (error) {
      console.error("Error updating site config:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Dados da configuração inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao atualizar configuração do site" });
      }
    }
  });

  app.post("/api/site-config/upload-logo", upload.single('logo'), async (req: Request, res: Response) => {
    try {
      // Only allow authenticated admin users
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem fazer upload da logo." });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Nenhuma imagem foi enviada" });
      }

      // Create the logo URL
      const logoUrl = `/uploads/${req.file.filename}`;
      
      // Update site config with new logo
      const updatedConfig = await storage.updateSiteLogo(logoUrl);
      
      if (!updatedConfig) {
        // If site config doesn't exist, remove the uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: "Configuração do site não encontrada" });
      }

      res.json({
        message: "Logo do site atualizada com sucesso",
        config: updatedConfig,
        logoUrl
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      // Remove the uploaded file if an error occurred
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error("Error removing uploaded file:", unlinkError);
        }
      }
      res.status(500).json({ message: "Erro ao fazer upload da logo" });
    }
  });

  // === Regeneração de Imagens ===
  app.post("/api/admin/regenerate-images", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // LIMPEZA DESABILITADA PARA PROTEGER IMAGENS PERSONALIZADAS
      console.log("🔒 Regeneração de imagens desabilitada para preservar uploads do usuário");
      
      res.json({ 
        message: "Regeneração de imagens desabilitada para proteger suas imagens personalizadas",
        success: false,
        note: "Suas imagens estão protegidas e não serão removidas"
      });
    } catch (error) {
      console.error("Error in regenerate images endpoint:", error);
      res.status(500).json({ message: "Erro ao processar regeneração de imagens" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
