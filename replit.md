# Replit.md

## Overview

This is a full-stack web application for a beauty salon (Salão de Beleza) built with a modern tech stack. The application provides a comprehensive management system for beauty salon operations including client management, appointment scheduling, service management, sales tracking, and review systems.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with custom theme configuration
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **State Management**: TanStack React Query for server state
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom plugins including theme support

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with Express routes
- **Authentication**: Passport.js with local and Google OAuth strategies
- **Session Management**: Express session with memory store
- **Password Handling**: Built-in crypto module with scrypt hashing

### Database Architecture
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: @neondatabase/serverless connector

## Key Components

### Authentication System
- Local authentication with username/password
- Google OAuth integration
- Password reset functionality with email tokens
- Role-based access control (admin/user)
- Session-based authentication with secure cookies

### Client Management
- User registration and profile management
- Client listing and search functionality
- CRUD operations for client data
- Separate client entities from system users

### Appointment System
- Service-based appointment booking
- Category and service selection
- Date and time scheduling
- Status management (pending, confirmed, completed, cancelled)
- Admin oversight of all appointments

### Sales Management
- Transaction recording with service association
- Multiple payment methods support
- Sales history and filtering
- Revenue tracking and reporting

### Review System
- Client review submission with ratings
- Like functionality for reviews
- Public review display
- Admin moderation capabilities

### Service Management
- Categorized service offerings
- Featured services highlighting
- Price range management
- Service descriptions and imagery

## Data Flow

1. **User Authentication**: Users authenticate through local login or Google OAuth, establishing sessions
2. **Client Operations**: Authenticated users can view services, make appointments, and submit reviews
3. **Admin Operations**: Admin users can manage clients, view appointments, record sales, and moderate content
4. **Data Persistence**: All operations are persisted through the Drizzle ORM to PostgreSQL
5. **Real-time Updates**: React Query handles caching and real-time data synchronization

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **passport**: Authentication middleware
- **nodemailer**: Email functionality for password resets

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **react-hook-form**: Form management
- **zod**: Schema validation

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking
- **tsx**: TypeScript execution
- **esbuild**: Production bundling

## Deployment Strategy

### Development Environment
- Vite development server for frontend hot reloading
- TSX for running TypeScript server code directly
- Memory-based session storage
- Environment variable configuration for database and external services

### Production Build
- Vite builds optimized frontend bundle to `dist/public`
- ESBuild bundles server code to `dist/index.js`
- Static file serving through Express
- PostgreSQL connection via environment variables

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string (required)
- `EMAIL_USER`/`EMAIL_PASS`: SMTP credentials for password reset emails
- `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`: OAuth configuration
- `SESSION_SECRET`: Session encryption key

### File Structure
- `/client`: React frontend application
- `/server`: Express backend with routes and authentication
- `/shared`: Shared TypeScript schemas and types
- `/migrations`: Database migration files
- `/uploads`: Directory for uploaded service images (created automatically)
- Configuration files in root for build tools and TypeScript

## Recent Changes

### Sistema de Upload de Imagens para Serviços (2025-07-09)
- **Nova funcionalidade**: Administradores podem fazer upload de imagens personalizadas para cada serviço
- **Backend**: Configuração do multer para upload seguro de imagens (JPEG, PNG, WebP até 5MB)
- **Rota nova**: `/api/services/:id/upload-image` (POST) para upload de imagens
- **Método storage**: `updateServiceImage()` para atualizar URL da imagem do serviço
- **Interface admin**: Nova página `/admin/services` para gerenciar imagens dos serviços
- **Componente**: `ServiceImageUpload` para interface de upload com preview
- **Navegação**: Menu hambúrguer administrativo implementado para organizar opções
- **Armazenamento**: Imagens salvas em `/uploads` e servidas estaticamente
- **Validação**: Tipos de arquivo e tamanho máximo validados no backend e frontend

### Menu Hambúrguer Administrativo (2025-07-09)
- **Interface melhorada**: Menu lateral deslizante para administradores
- **Organização**: Consolidação de todas as funções admin em um painel
- **Componente**: `AdminMenu` com design responsivo e animações suaves
- **UX**: Redução da poluição visual no header principal
- **Funcionalidades**: Dashboard, Clientes/Vendas, e Gerenciamento de Imagens organizados

### Sistema de Gerenciamento de Banner (2025-07-09)
- **Nova funcionalidade**: Administradores podem personalizar o banner principal da home
- **Schema**: Tabela `banner` com campos para título, subtítulo, texto/link do botão e imagem de fundo
- **Backend**: Rotas `/api/banner` (GET/PUT) e `/api/banner/upload-image` (POST)
- **Interface admin**: Página `/admin/banner` com formulário e upload de imagem
- **Componente**: `BannerManagement` com preview em tempo real
- **UX**: Botões "Ver na Home" para visualizar alterações instantaneamente
- **Integração**: Página inicial usa dados dinâmicos do banner configurado
- **Fallback**: Gradiente padrão quando não há imagem de fundo

### Sistema de Gerenciamento de Rodapé (2025-07-09)
- **Nova funcionalidade**: Administradores podem personalizar completamente o rodapé
- **Schema**: Tabela `footer` com campos para dados do negócio, contato e redes sociais
- **Backend**: Rotas `/api/footer` (GET/PUT) para gerenciar configurações
- **Interface admin**: Página `/admin/footer` com formulário completo e preview em tempo real
- **Componente**: `FooterManagement` com validação e preview do rodapé
- **Validação**: URLs das redes sociais opcionais com validação de formato
- **UX**: Botões "Ver na Home" para visualizar mudanças instantaneamente
- **Integração**: Componente Footer atualizado para usar dados dinâmicos da configuração
- **Fallback**: Dados padrão quando configuração não disponível

### Sistema de Gerenciamento de Preços (2025-07-09)
- **Nova funcionalidade**: Administradores podem gerenciar completamente a tabela de preços
- **Backend**: Rotas CRUD `/api/admin/prices` (POST/PUT/DELETE) para gerenciar preços
- **Interface admin**: Página `/admin/prices` com funcionalidades completas de CRUD
- **Funcionalidades**: Criar, editar, remover e visualizar itens de preço por categoria
- **Edição inline**: Sistema de edição direta na tabela para agilizar alterações
- **Validação**: Formulários com validação de campos obrigatórios e tipos de dados
- **UX**: Organização por categorias e botão "Ver na Home" para preview
- **Integração**: Tabela de preços na home atualizada automaticamente com mudanças
- **Storage**: Métodos CRUD implementados no sistema de armazenamento em memória