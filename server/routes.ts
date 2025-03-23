import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertAppointmentSchema, insertSaleSchema, insertReviewSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
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
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating appointment" });
      }
    }
  });
  
  app.get("/api/appointments", async (req: Request, res: Response) => {
    try {
      // Only allow authenticated users
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
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
  
  // Rota para dar like (coração) em uma avaliação
  app.post("/api/reviews/:id/like", async (req: Request, res: Response) => {
    try {
      const reviewId = parseInt(req.params.id);
      
      // Buscar a avaliação atual
      const review = await storage.likeReview(reviewId);
      
      if (!review) {
        return res.status(404).json({ message: "Avaliação não encontrada" });
      }
      
      res.status(200).json(review);
    } catch (error) {
      res.status(500).json({ message: "Erro ao adicionar like na avaliação" });
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

  const httpServer = createServer(app);
  return httpServer;
}
