import { users, type User, type InsertUser } from "@shared/schema";
import { type Category, type InsertCategory } from "@shared/schema";
import { type Service, type InsertService } from "@shared/schema";
import { type PriceItem, type InsertPriceItem } from "@shared/schema";
import { type Appointment, type InsertAppointment } from "@shared/schema";
import { type Review, type InsertReview } from "@shared/schema";
import { type Sale, type InsertSale } from "@shared/schema";
import { type Banner, type InsertBanner } from "@shared/schema";
import { type Footer, type InsertFooter } from "@shared/schema";
import { type SiteConfig, type InsertSiteConfig } from "@shared/schema";

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

  // Sales
  getSales(): Promise<Sale[]>;
  getSalesByDate(startDate: Date, endDate: Date): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;

  // Banner
  getBanner(): Promise<Banner | undefined>;
  updateBanner(banner: InsertBanner): Promise<Banner>;
  updateBannerImage(backgroundImage: string): Promise<Banner | undefined>;

  // Footer
  getFooter(): Promise<Footer | undefined>;
  updateFooter(footer: InsertFooter): Promise<Footer>;

  // Site Configuration
  getSiteConfig(): Promise<SiteConfig | undefined>;
  updateSiteConfig(config: InsertSiteConfig): Promise<SiteConfig>;
  updateSiteLogo(logoUrl: string): Promise<SiteConfig | undefined>;
}

export class MemStorage implements IStorage {
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
          password: await hashPassword("Isa2018#"),
          name: "Administrador",
          phone: "11964027914",
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
      whatsapp: "11964027914",
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

export const storage = new MemStorage();
