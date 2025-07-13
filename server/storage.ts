import { 
  users, categories, services, priceItems, appointments, reviews, sales,
  banner, footer, siteConfig, reviewComments, commentLikes,
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Service, type InsertService,
  type PriceItem, type InsertPriceItem,
  type Appointment, type InsertAppointment,
  type Review, type InsertReview,
  type ReviewComment, type InsertReviewComment,
  type CommentLike,
  type Sale, type InsertSale,
  type Banner, type InsertBanner,
  type Footer, type InsertFooter,
  type SiteConfig, type InsertSiteConfig
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import createMemoryStore from "memorystore";
import { pool } from "./db";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: number, password: string): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Clients
  getClients(): Promise<User[]>;
  getClientById(id: number): Promise<User | undefined>;
  createClient(client: {
    name: string;
    phone: string;
    email: string;
  }): Promise<User>;
  updateClient(
    id: number,
    client: { name?: string; phone?: string; email?: string },
  ): Promise<User | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(
    id: number,
    category: Partial<InsertCategory>,
  ): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Services
  getServices(): Promise<Service[]>;
  getFeaturedServices(): Promise<Service[]>;
  getServiceById(id: number): Promise<Service | undefined>;
  getServicesByCategory(categoryId: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateServiceImage(
    id: number,
    imageUrl: string,
  ): Promise<Service | undefined>;
  updateServiceImageData(
    id: number,
    imageDataBase64: string,
    mimeType: string,
  ): Promise<Service | undefined>;
  updateServiceFeatured(
    id: number,
    featured: boolean,
  ): Promise<Service | undefined>;
  updateService(
    id: number,
    service: InsertService,
  ): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;

  // Price Items
  getPriceItems(): Promise<PriceItem[]>;
  getPriceItemsByCategory(categoryId: number): Promise<PriceItem[]>;
  getPriceItemById(id: number): Promise<PriceItem | undefined>;
  createPriceItem(priceItem: InsertPriceItem): Promise<PriceItem>;
  updatePriceItem(
    id: number,
    priceItem: Partial<InsertPriceItem>,
  ): Promise<PriceItem | undefined>;
  deletePriceItem(id: number): Promise<boolean>;

  // Appointments
  getAppointments(): Promise<Appointment[]>;
  getAppointmentById(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(
    id: number,
    status: string,
  ): Promise<Appointment | undefined>;

  // Reviews
  getReviews(): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  toggleLikeReview(
    reviewId: number,
    userId: number,
  ): Promise<{ review: Review; userLiked: boolean } | undefined>;
  getUserLikes(userId: number): Promise<number[]>;

  // Review Comments
  getReviewComments(reviewId: number): Promise<ReviewComment[]>;
  createReviewComment(comment: InsertReviewComment & { userId: number; userName: string }): Promise<ReviewComment>;
  toggleLikeComment(
    commentId: number,
    userId: number,
  ): Promise<{ comment: ReviewComment; userLiked: boolean } | undefined>;
  getUserCommentLikes(userId: number): Promise<number[]>;

  // Sales
  getSales(): Promise<Sale[]>;
  getSalesByDate(startDate: Date, endDate: Date): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;

  // Banner
  getBanner(): Promise<Banner | undefined>;
  updateBanner(banner: InsertBanner): Promise<Banner>;
  updateBannerImage(backgroundImage: string): Promise<Banner | undefined>;
  updateBannerImageData(imageDataBase64: string, mimeType: string): Promise<Banner | undefined>;

  // Footer
  getFooter(): Promise<Footer | undefined>;
  updateFooter(footer: InsertFooter): Promise<Footer>;

  // Site Configuration
  getSiteConfig(): Promise<SiteConfig | undefined>;
  updateSiteConfig(config: InsertSiteConfig): Promise<SiteConfig>;
  updateSiteLogo(logoUrl: string): Promise<SiteConfig | undefined>;

  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  sessionStore: session.Store;
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private services: Map<number, Service>;
  private priceItems: Map<number, PriceItem>;
  private appointments: Map<number, Appointment>;
  private reviews: Map<number, Review>;
  private sales: Map<number, Sale>;
  private userLikes: Map<number, Set<number>>; // userId -> Set of reviewIds they liked
  private bannerConfig: Banner | null = null;
  private footerConfig: Footer | null = null;
  private siteConfig: SiteConfig | null = null;

  private currentUserId: number;
  private currentCategoryId: number;
  private currentServiceId: number;
  private currentPriceItemId: number;
  private currentAppointmentId: number;
  private currentReviewId: number;
  private currentSaleId: number;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    this.users = new Map();
    this.categories = new Map();
    this.services = new Map();
    this.priceItems = new Map();
    this.appointments = new Map();
    this.reviews = new Map();
    this.sales = new Map();
    this.userLikes = new Map();

    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentServiceId = 1;
    this.currentPriceItemId = 1;
    this.currentAppointmentId = 1;
    this.currentReviewId = 1;
    this.currentSaleId = 1;

    // Seed initial data
    this.seedInitialData();
  }

  private async seedInitialData() {
    // Seed admin user (if not exists)
    try {
      // Import the hashPassword function
      const { hashPassword } = await import("./auth");

      // Check if admin user already exists
      const existingAdmin = await this.getUserByUsername(
        "lleandro.m32@gmail.com",
      );

      if (!existingAdmin) {
        // Create admin user
        await this.createUser({
          username: "lleandro.m32@gmail.com",
          password: await hashPassword("admin"),
          name: "Leandro Menezes",
          phone: "11900000000",
          email: "lleandro.m32@gmail.com",
          isAdmin: true,
        });
        console.log("Admin user created successfully");
      }
    } catch (error) {
      console.error("Error creating admin user:", error);
    }

    // Seed categories
    const categories: InsertCategory[] = [
      { name: "Serviços de Cabelo", icon: "fas fa-cut" },
      { name: "Serviços de Unhas", icon: "fas fa-hand-sparkles" },
      { name: "Tratamentos de Pele", icon: "fas fa-spa" },
      { name: "Outros Serviços", icon: "fas fa-magic" },
    ];

    categories.forEach((category) => this.createCategory(category));

    // Seed services
    const services: InsertService[] = [
      {
        name: "Corte de Cabelo",
        description:
          "Cortes modernos e clássicos para todos os estilos e tipos de cabelo, feitos por profissionais experientes.",
        minPrice: 50,
        maxPrice: 80,
        categoryId: 1,
        icon: "fas fa-cut",
        featured: true,
      },
      {
        name: "Manicure",
        description:
          "Cuidados completos para suas unhas, com uma grande variedade de cores e designs para escolher.",
        minPrice: 30,
        maxPrice: 50,
        categoryId: 2,
        icon: "fas fa-hand-sparkles",
        featured: true,
      },
      {
        name: "Tratamento de Pele",
        description:
          "Tratamentos especializados para uma pele saudável e radiante, adaptados às suas necessidades.",
        minPrice: 80,
        maxPrice: 130,
        categoryId: 3,
        icon: "fas fa-spa",
        featured: true,
      },
    ];

    services.forEach((service) => this.createService(service));

    // Seed price items
    const priceItems: InsertPriceItem[] = [
      { name: "Corte Feminino", minPrice: 50, maxPrice: 80, categoryId: 1 },
      { name: "Corte Masculino", minPrice: 35, maxPrice: 60, categoryId: 1 },
      { name: "Coloração", minPrice: 90, maxPrice: 150, categoryId: 1 },
      { name: "Mechas/Luzes", minPrice: 120, maxPrice: 200, categoryId: 1 },
      {
        name: "Tratamento Capilar",
        minPrice: 70,
        maxPrice: 120,
        categoryId: 1,
      },

      { name: "Manicure Simples", minPrice: 30, maxPrice: 30, categoryId: 2 },
      { name: "Pedicure Simples", minPrice: 40, maxPrice: 40, categoryId: 2 },
      {
        name: "Manicure e Pedicure",
        minPrice: 65,
        maxPrice: 65,
        categoryId: 2,
      },
      { name: "Esmaltação em Gel", minPrice: 50, maxPrice: 50, categoryId: 2 },
      {
        name: "Unhas em Gel/Acrílico",
        minPrice: 90,
        maxPrice: 120,
        categoryId: 2,
      },

      { name: "Limpeza de Pele", minPrice: 80, maxPrice: 80, categoryId: 3 },
      { name: "Hidratação Facial", minPrice: 70, maxPrice: 70, categoryId: 3 },
      { name: "Peeling", minPrice: 90, maxPrice: 130, categoryId: 3 },
      { name: "Microagulhamento", minPrice: 150, maxPrice: 150, categoryId: 3 },
      { name: "Massagem Facial", minPrice: 60, maxPrice: 60, categoryId: 3 },

      {
        name: "Depilação (pequenas áreas)",
        minPrice: 25,
        maxPrice: 40,
        categoryId: 4,
      },
      {
        name: "Depilação (grandes áreas)",
        minPrice: 50,
        maxPrice: 80,
        categoryId: 4,
      },
      {
        name: "Design de Sobrancelhas",
        minPrice: 35,
        maxPrice: 35,
        categoryId: 4,
      },
      { name: "Maquiagem Social", minPrice: 90, maxPrice: 90, categoryId: 4 },
      {
        name: "Maquiagem para Eventos",
        minPrice: 120,
        maxPrice: 150,
        categoryId: 4,
      },
    ];

    priceItems.forEach((priceItem) => this.createPriceItem(priceItem));

    // Seed default banner
    this.bannerConfig = {
      id: 1,
      title: "Bem-vindo ao Nosso Salão de Beleza",
      subtitle:
        "Transformamos sua beleza com cuidado, estilo e profissionalismo. Venha descobrir o que há de melhor em tratamentos personalizados.",
      ctaText: "Agendar Horário",
      ctaLink: "#appointments",
      backgroundImage: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Seed default footer
    this.footerConfig = {
      id: 1,
      businessName: "Salão de Beleza Premium",
      address: "Rua das Flores, 123 - Centro, São Paulo - SP, 01234-567",
      phone: "(11) 3456-7890",
      email: "contato@salaopremium.com.br",
      whatsapp: "11900000000",
      workingHours: "Segunda a Sexta: 9h às 18h | Sábado: 8h às 17h",
      facebookUrl: "https://facebook.com/salaopremium",
      instagramUrl: "https://instagram.com/salaopremium",
      tiktokUrl: "",
      youtubeUrl: "",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Seed default site configuration
    this.siteConfig = {
      id: 1,
      siteName: "Salão de Beleza Premium",
      siteSlogan: "Transformando sua beleza com carinho e qualidade",
      logoUrl: "",
      primaryColor: "#3b82f6",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Seed reviews
    const reviews: InsertReview[] = [
      {
        clientName: "Maria Silva",
        rating: 4.5,
        comment:
          "O ambiente é super acolhedor e os profissionais são muito atenciosos. Meu corte ficou exatamente como eu queria! Voltarei com certeza.",
        likes: 1,
      },
      {
        clientName: "João Pereira",
        rating: 5,
        comment:
          "Sempre fui muito exigente com meu cabelo, mas aqui encontrei profissionais que realmente entendem o que eu quero. Recomendo a todos!",
        likes: 1,
      },
      {
        clientName: "Ana Costa",
        rating: 4.5,
        comment:
          "A manicure é excelente! Minhas unhas nunca ficaram tão bonitas e a esmaltação em gel durou muito mais do que em outros lugares. Super recomendo!",
        likes: 1,
      },
    ];

    reviews.forEach((review) => this.createReview(review));

    // Seed appointments
    const appointments: InsertAppointment[] = [
      {
        name: "Leandro Oliveira",
        email: "lleandro.m32@gmail.com",
        phone: "11964027914",
        serviceId: 1,
        categoryId: 1,
        date: "2025-04-10",
        time: "14:00",
        notes: "Corte masculino",
      },
      {
        name: "Maria Silva",
        email: "maria@example.com",
        phone: "11987654321",
        serviceId: 3,
        categoryId: 3,
        date: "2025-04-15",
        time: "10:30",
        notes: "Tratamento de pele para evento",
      },
    ];

    appointments.forEach((appointment) => this.createAppointment(appointment));
    console.log("Agendamentos iniciais criados com sucesso");
  }

  // === Users ===
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      // Usar o valor fornecido ou false como padrão
      isAdmin: insertUser.isAdmin ?? false,
      createdAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserPassword(
    id: number,
    password: string,
  ): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, password };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // === Clients ===
  async getClients(): Promise<User[]> {
    return Array.from(this.users.values()).filter((user) => !user.isAdmin);
  }

  async getClientById(id: number): Promise<User | undefined> {
    const user = this.users.get(id);
    return user && !user.isAdmin ? user : undefined;
  }

  async createClient(client: {
    name: string;
    phone: string;
    email: string;
  }): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    // Gera um username aleatório baseado no nome (para clientes que não fazem login)
    const username = `${client.name.toLowerCase().replace(/\s+/g, ".")}.${Date.now()}@client.local`;
    // Senha aleatória (já que esses clientes não fazem login)
    const password = Math.random().toString(36).substring(2, 15);

    const user: User = {
      id,
      username,
      password,
      name: client.name,
      phone: client.phone,
      email: client.email,
      isAdmin: false,
      createdAt: now,
    };

    this.users.set(id, user);
    return user;
  }

  async updateClient(
    id: number,
    client: { name?: string; phone?: string; email?: string },
  ): Promise<User | undefined> {
    const existingUser = this.users.get(id);

    if (existingUser && !existingUser.isAdmin) {
      const updatedUser = {
        ...existingUser,
        ...client,
      };

      this.users.set(id, updatedUser);
      return updatedUser;
    }

    return undefined;
  }

  async deleteClient(id: number): Promise<boolean> {
    const user = this.users.get(id);

    if (user && !user.isAdmin) {
      return this.users.delete(id);
    }

    return false;
  }

  // === Categories ===
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(
    id: number,
    updates: Partial<InsertCategory>,
  ): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (category) {
      const updatedCategory = { ...category, ...updates };
      this.categories.set(id, updatedCategory);
      return updatedCategory;
    }
    return undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    // Remove all services in this category first
    const servicesToDelete = Array.from(this.services.values()).filter(
      (service) => service.categoryId === id,
    );
    servicesToDelete.forEach((service) => this.services.delete(service.id));

    // Remove all price items in this category
    const priceItemsToDelete = Array.from(this.priceItems.values()).filter(
      (item) => item.categoryId === id,
    );
    priceItemsToDelete.forEach((item) => this.priceItems.delete(item.id));

    // Remove the category
    return this.categories.delete(id);
  }

  // === Services ===
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async getFeaturedServices(): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      (service) => service.featured,
    );
  }

  async getServiceById(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async getServicesByCategory(categoryId: number): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      (service) => service.categoryId === categoryId,
    );
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.currentServiceId++;
    const service: Service = { ...insertService, id };
    this.services.set(id, service);
    return service;
  }

  async updateServiceImage(
    id: number,
    imageUrl: string,
  ): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (service) {
      const updatedService = { ...service, imageUrl };
      this.services.set(id, updatedService);
      return updatedService;
    }
    return undefined;
  }

  async updateServiceImageData(
    id: number,
    imageDataBase64: string,
    mimeType: string,
  ): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (service) {
      const updatedService = { 
        ...service, 
        imageDataBase64,
        imageMimeType: mimeType,
        imageUrl: `/api/images/service/${id}`
      };
      this.services.set(id, updatedService);
      return updatedService;
    }
    return undefined;
  }

  async updateServiceFeatured(
    id: number,
    featured: boolean,
  ): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (service) {
      const updatedService = { ...service, featured };
      this.services.set(id, updatedService);
      return updatedService;
    }
    return undefined;
  }

  async updateService(
    id: number,
    serviceData: InsertService,
  ): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (service) {
      const updatedService = { ...service, ...serviceData, id };
      this.services.set(id, updatedService);
      return updatedService;
    }
    return undefined;
  }

  async deleteService(id: number): Promise<boolean> {
    return this.services.delete(id);
  }

  // === Price Items ===
  async getPriceItems(): Promise<PriceItem[]> {
    return Array.from(this.priceItems.values());
  }

  async getPriceItemsByCategory(categoryId: number): Promise<PriceItem[]> {
    return Array.from(this.priceItems.values()).filter(
      (item) => item.categoryId === categoryId,
    );
  }

  async getPriceItemById(id: number): Promise<PriceItem | undefined> {
    return this.priceItems.get(id);
  }

  async createPriceItem(insertPriceItem: InsertPriceItem): Promise<PriceItem> {
    const id = this.currentPriceItemId++;
    const priceItem: PriceItem = { ...insertPriceItem, id };
    this.priceItems.set(id, priceItem);
    return priceItem;
  }

  async updatePriceItem(
    id: number,
    updates: Partial<InsertPriceItem>,
  ): Promise<PriceItem | undefined> {
    const existingPriceItem = this.priceItems.get(id);
    if (existingPriceItem) {
      const updatedPriceItem = { ...existingPriceItem, ...updates };
      this.priceItems.set(id, updatedPriceItem);
      return updatedPriceItem;
    }
    return undefined;
  }

  async deletePriceItem(id: number): Promise<boolean> {
    return this.priceItems.delete(id);
  }

  // === Appointments ===
  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(
    insertAppointment: InsertAppointment,
  ): Promise<Appointment> {
    const id = this.currentAppointmentId++;
    const now = new Date();
    const appointment: Appointment = {
      ...insertAppointment,
      id,
      status: "pending",
      createdAt: now,
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointmentStatus(
    id: number,
    status: string,
  ): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (appointment) {
      const updatedAppointment = { ...appointment, status };
      this.appointments.set(id, updatedAppointment);
      return updatedAppointment;
    }
    return undefined;
  }

  // === Reviews ===
  async getReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values());
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const now = new Date();
    const review: Review = {
      ...insertReview,
      id,
      createdAt: now,
      likes: insertReview.likes || 0,
    };
    this.reviews.set(id, review);
    return review;
  }

  async toggleLikeReview(
    reviewId: number,
    userId: number,
  ): Promise<{ review: Review; userLiked: boolean } | undefined> {
    const review = this.reviews.get(reviewId);
    if (!review) return undefined;

    // Get user's current likes
    if (!this.userLikes.has(userId)) {
      this.userLikes.set(userId, new Set());
    }

    const userLikeSet = this.userLikes.get(userId)!;
    const userAlreadyLiked = userLikeSet.has(reviewId);

    let updatedReview: Review;

    if (userAlreadyLiked) {
      // Remove like
      userLikeSet.delete(reviewId);
      updatedReview = { ...review, likes: Math.max(0, review.likes - 1) };
    } else {
      // Add like
      userLikeSet.add(reviewId);
      updatedReview = { ...review, likes: review.likes + 1 };
    }

    this.reviews.set(reviewId, updatedReview);
    return { review: updatedReview, userLiked: !userAlreadyLiked };
  }

  async getUserLikes(userId: number): Promise<number[]> {
    const userLikeSet = this.userLikes.get(userId);
    return userLikeSet ? Array.from(userLikeSet) : [];
  }

  // === Sales ===
  async getSales(): Promise<Sale[]> {
    return Array.from(this.sales.values());
  }

  async getSalesByDate(startDate: Date, endDate: Date): Promise<Sale[]> {
    return Array.from(this.sales.values()).filter((sale) => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDate && saleDate <= endDate;
    });
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const id = this.currentSaleId++;
    const service = await this.getServiceById(parseInt(insertSale.serviceId));
    const now = new Date();

    const sale: Sale = {
      ...insertSale,
      id,
      serviceName: service ? service.name : "Unknown Service",
      serviceId: parseInt(insertSale.serviceId),
      createdAt: now,
    };

    this.sales.set(id, sale);
    return sale;
  }

  // === Banner ===
  async getBanner(): Promise<Banner | undefined> {
    return this.bannerConfig || undefined;
  }

  async updateBanner(banner: InsertBanner): Promise<Banner> {
    const now = new Date();
    this.bannerConfig = {
      id: 1,
      ...banner,
      isActive: true,
      createdAt: this.bannerConfig?.createdAt || now,
      updatedAt: now,
    };
    return this.bannerConfig;
  }

  async updateBannerImage(
    backgroundImage: string,
  ): Promise<Banner | undefined> {
    if (this.bannerConfig) {
      this.bannerConfig = {
        ...this.bannerConfig,
        backgroundImage,
        updatedAt: new Date(),
      };
      return this.bannerConfig;
    }
    return undefined;
  }

  async updateBannerImageData(
    imageDataBase64: string,
    mimeType: string,
  ): Promise<Banner | undefined> {
    if (this.bannerConfig) {
      this.bannerConfig = {
        ...this.bannerConfig,
        backgroundImageDataBase64: imageDataBase64,
        backgroundImageMimeType: mimeType,
        backgroundImage: "/api/images/banner",
        updatedAt: new Date(),
      };
      return this.bannerConfig;
    }
    return undefined;
  }

  // === Footer ===
  async getFooter(): Promise<Footer | undefined> {
    return this.footerConfig || undefined;
  }

  async updateFooter(footer: InsertFooter): Promise<Footer> {
    const now = new Date();
    this.footerConfig = {
      id: 1,
      ...footer,
      isActive: true,
      createdAt: this.footerConfig?.createdAt || now,
      updatedAt: now,
    };
    return this.footerConfig;
  }

  // === Site Configuration ===
  async getSiteConfig(): Promise<SiteConfig | undefined> {
    return this.siteConfig || undefined;
  }

  async updateSiteConfig(config: InsertSiteConfig): Promise<SiteConfig> {
    const now = new Date();
    this.siteConfig = {
      id: 1,
      ...config,
      createdAt: this.siteConfig?.createdAt || now,
      updatedAt: now,
    };
    return this.siteConfig;
  }

  async updateSiteLogo(logoUrl: string): Promise<SiteConfig | undefined> {
    if (this.siteConfig) {
      this.siteConfig = {
        ...this.siteConfig,
        logoUrl,
        updatedAt: new Date(),
      };
      return this.siteConfig;
    }
    return undefined;
  }
}

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserPassword(id: number, password: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ password })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Clients
  async getClients(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isAdmin, false));
  }

  async getClientById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users)
      .where(and(eq(users.id, id), eq(users.isAdmin, false)));
    return user || undefined;
  }

  async createClient(client: { name: string; phone: string; email: string }): Promise<User> {
    const [user] = await db.insert(users).values({
      username: client.email,
      password: '',
      name: client.name,
      phone: client.phone,
      email: client.email,
      isAdmin: false
    }).returning();
    return user;
  }

  async updateClient(id: number, client: { name?: string; phone?: string; email?: string }): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set(client)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteClient(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db.update(categories)
      .set(updates)
      .where(eq(categories.id, id))
      .returning();
    return category || undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    // Delete related services and price items first
    await db.delete(services).where(eq(services.categoryId, id));
    await db.delete(priceItems).where(eq(priceItems.categoryId, id));
    
    const result = await db.delete(categories).where(eq(categories.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Services
  async getServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async getFeaturedServices(): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.featured, true));
  }

  async getServiceById(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async getServicesByCategory(categoryId: number): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.categoryId, categoryId));
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(insertService).returning();
    return service;
  }

  async updateServiceImage(id: number, imageUrl: string): Promise<Service | undefined> {
    const [service] = await db.update(services)
      .set({ imageUrl })
      .where(eq(services.id, id))
      .returning();
    return service || undefined;
  }

  async updateServiceImageData(id: number, imageDataBase64: string, mimeType: string): Promise<Service | undefined> {
    try {
      const [service] = await db
        .update(services)
        .set({ 
          imageDataBase64,
          imageMimeType: mimeType,
          imageUrl: `/api/images/service/${id}` // Update URL to point to our API
        })
        .where(eq(services.id, id))
        .returning();
      return service || undefined;
    } catch (error) {
      console.error("Error updating service image data:", error);
      return undefined;
    }
  }

  async updateServiceFeatured(id: number, featured: boolean): Promise<Service | undefined> {
    const [service] = await db.update(services)
      .set({ featured })
      .where(eq(services.id, id))
      .returning();
    return service || undefined;
  }

  async updateService(id: number, serviceData: InsertService): Promise<Service | undefined> {
    const [service] = await db.update(services)
      .set(serviceData)
      .where(eq(services.id, id))
      .returning();
    return service || undefined;
  }

  async deleteService(id: number): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Price Items
  async getPriceItems(): Promise<PriceItem[]> {
    return await db.select().from(priceItems);
  }

  async getPriceItemsByCategory(categoryId: number): Promise<PriceItem[]> {
    return await db.select().from(priceItems).where(eq(priceItems.categoryId, categoryId));
  }

  async getPriceItemById(id: number): Promise<PriceItem | undefined> {
    const [priceItem] = await db.select().from(priceItems).where(eq(priceItems.id, id));
    return priceItem || undefined;
  }

  async createPriceItem(insertPriceItem: InsertPriceItem): Promise<PriceItem> {
    const [priceItem] = await db.insert(priceItems).values(insertPriceItem).returning();
    return priceItem;
  }

  async updatePriceItem(id: number, updates: Partial<InsertPriceItem>): Promise<PriceItem | undefined> {
    const [priceItem] = await db.update(priceItems)
      .set(updates)
      .where(eq(priceItems.id, id))
      .returning();
    return priceItem || undefined;
  }

  async deletePriceItem(id: number): Promise<boolean> {
    const result = await db.delete(priceItems).where(eq(priceItems.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments).orderBy(desc(appointments.createdAt));
  }

  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment || undefined;
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    return appointment;
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const [appointment] = await db.update(appointments)
      .set({ status })
      .where(eq(appointments.id, id))
      .returning();
    return appointment || undefined;
  }

  // Reviews
  async getReviews(): Promise<Review[]> {
    return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }

  async toggleLikeReview(reviewId: number, userId: number): Promise<{ review: Review; userLiked: boolean } | undefined> {
    // This would need a separate likes table for proper implementation
    // For now, we'll just return the review without like functionality
    const [review] = await db.select().from(reviews).where(eq(reviews.id, reviewId));
    if (!review) return undefined;
    
    return { review, userLiked: false };
  }

  async getUserLikes(userId: number): Promise<number[]> {
    // Would need a separate likes table
    return [];
  }

  // Review Comments
  async getReviewComments(reviewId: number): Promise<ReviewComment[]> {
    return await db.select().from(reviewComments)
      .where(eq(reviewComments.reviewId, reviewId))
      .orderBy(desc(reviewComments.createdAt));
  }

  async createReviewComment(comment: InsertReviewComment & { userId: number; userName: string }): Promise<ReviewComment> {
    const [newComment] = await db.insert(reviewComments).values(comment).returning();
    return newComment;
  }

  async toggleLikeComment(commentId: number, userId: number): Promise<{ comment: ReviewComment; userLiked: boolean } | undefined> {
    // Check if user already liked this comment
    const existingLike = await db.select().from(commentLikes)
      .where(and(
        eq(commentLikes.commentId, commentId),
        eq(commentLikes.userId, userId)
      ));

    let userLiked: boolean;

    if (existingLike.length > 0) {
      // User already liked, remove like
      await db.delete(commentLikes)
        .where(and(
          eq(commentLikes.commentId, commentId),
          eq(commentLikes.userId, userId)
        ));
      
      // Decrease likes count
      await db.update(reviewComments)
        .set({ likes: sql`${reviewComments.likes} - 1` })
        .where(eq(reviewComments.id, commentId));
      
      userLiked = false;
    } else {
      // User hasn't liked, add like
      await db.insert(commentLikes).values({
        commentId,
        userId,
      });
      
      // Increase likes count
      await db.update(reviewComments)
        .set({ likes: sql`${reviewComments.likes} + 1` })
        .where(eq(reviewComments.id, commentId));
      
      userLiked = true;
    }

    // Get updated comment
    const [comment] = await db.select().from(reviewComments)
      .where(eq(reviewComments.id, commentId));

    if (!comment) return undefined;

    return { comment, userLiked };
  }

  async getUserCommentLikes(userId: number): Promise<number[]> {
    const likes = await db.select({ commentId: commentLikes.commentId })
      .from(commentLikes)
      .where(eq(commentLikes.userId, userId));
    
    return likes.map(like => like.commentId);
  }

  // Sales
  async getSales(): Promise<Sale[]> {
    return await db.select().from(sales).orderBy(desc(sales.createdAt));
  }

  async getSalesByDate(startDate: Date, endDate: Date): Promise<Sale[]> {
    return await db.select().from(sales)
      .where(and(
        gte(sales.createdAt, startDate),
        lte(sales.createdAt, endDate)
      ))
      .orderBy(desc(sales.createdAt));
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const [sale] = await db.insert(sales).values(insertSale).returning();
    return sale;
  }

  // Banner
  async getBanner(): Promise<Banner | undefined> {
    const [bannerData] = await db.select().from(banner).limit(1);
    return bannerData || undefined;
  }

  async updateBanner(insertBanner: InsertBanner): Promise<Banner> {
    // Try to update first, if no rows affected, insert
    const [updated] = await db.update(banner)
      .set(insertBanner)
      .returning();
    
    if (updated) {
      return updated;
    }
    
    const [created] = await db.insert(banner).values(insertBanner).returning();
    return created;
  }

  async updateBannerImage(backgroundImage: string): Promise<Banner | undefined> {
    const [updated] = await db.update(banner)
      .set({ backgroundImage })
      .returning();
    return updated || undefined;
  }

  async updateBannerImageData(imageDataBase64: string, mimeType: string): Promise<Banner | undefined> {
    try {
      const [updated] = await db
        .update(banner)
        .set({ 
          backgroundImageDataBase64: imageDataBase64,
          backgroundImageMimeType: mimeType,
          backgroundImage: "/api/images/banner", // Update URL to point to our API
          updatedAt: new Date()
        })
        .returning();
      return updated || undefined;
    } catch (error) {
      console.error("Error updating banner image data:", error);
      return undefined;
    }
  }

  // Footer
  async getFooter(): Promise<Footer | undefined> {
    const [footerData] = await db.select().from(footer).limit(1);
    return footerData || undefined;
  }

  async updateFooter(insertFooter: InsertFooter): Promise<Footer> {
    // Try to update first, if no rows affected, insert
    const [updated] = await db.update(footer)
      .set(insertFooter)
      .returning();
    
    if (updated) {
      return updated;
    }
    
    const [created] = await db.insert(footer).values(insertFooter).returning();
    return created;
  }

  // Site Configuration
  async getSiteConfig(): Promise<SiteConfig | undefined> {
    const [config] = await db.select().from(siteConfig).limit(1);
    return config || undefined;
  }

  async updateSiteConfig(insertConfig: InsertSiteConfig): Promise<SiteConfig> {
    // Try to update first, if no rows affected, insert
    const [updated] = await db.update(siteConfig)
      .set(insertConfig)
      .returning();
    
    if (updated) {
      return updated;
    }
    
    const [created] = await db.insert(siteConfig).values(insertConfig).returning();
    return created;
  }

  async updateSiteLogo(logoUrl: string): Promise<SiteConfig | undefined> {
    const [updated] = await db.update(siteConfig)
      .set({ logoUrl })
      .returning();
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
