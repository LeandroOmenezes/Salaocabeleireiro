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

### Sistema de Gerenciamento Completo de Serviços (2025-07-09)
- **Funcionalidade expandida**: Administradores podem criar novos serviços e remover serviços descontinuados
- **Backend**: Rota POST `/api/admin/services` para criar serviços e DELETE `/api/admin/services/:id` para remover
- **Interface renovada**: Componente `ServiceManagement` substitui `ServiceImageUpload` com funcionalidades completas
- **Formulário de criação**: Interface para adicionar novos serviços com nome, descrição, preços, categoria e ícone
- **Remoção segura**: Confirmação antes de remover serviços para evitar exclusões acidentais
- **Upload de imagens**: Mantida funcionalidade de upload de imagens personalizadas para cada serviço
- **Validação**: Formulários com validação completa usando Zod e React Hook Form
- **UX**: Layout em cards com informações organizadas e botões de ação claramente visíveis
- **Integração**: Atualizações automáticas na página inicial quando serviços são adicionados ou removidos

### Sistema de Gerenciamento Completo de Categorias (2025-07-09)
- **Nova funcionalidade**: Administradores podem criar, editar e remover categorias inteiras de serviços
- **Backend**: Rotas CRUD completas `/api/admin/categories` (POST/PUT/DELETE) para gerenciar categorias
- **Remoção em cascata**: Ao remover uma categoria, todos os serviços e preços relacionados são removidos automaticamente
- **Interface completa**: Componente `CategoryManagement` com formulários de criação e edição inline
- **Contadores inteligentes**: Exibe quantidade de serviços e preços relacionados a cada categoria
- **Confirmação avançada**: Sistema de confirmação que informa exatamente quantos itens serão removidos
- **Validação robusta**: Formulários validados com Zod para criação e edição de categorias
- **UX intuitiva**: Cards organizados com badges indicando conteúdo relacionado e avisos de remoção
- **Integração completa**: Atualizações automáticas em todas as páginas quando categorias são modificadas
- **Menu administrativo**: Nova opção "Categorias" no painel admin para acesso direto

### Sistema de Configuração do Site (2025-07-09)
- **Nova funcionalidade**: Administradores podem personalizar completamente a identidade visual do site
- **Schema**: Tabela `site_config` com campos para nome do site, logo, slogan e cor primária
- **Backend**: Rotas `/api/site-config` (GET/PUT) e `/api/site-config/upload-logo` (POST) para gerenciamento
- **Upload de logo**: Sistema completo de upload de logo personalizada com validação de tipos e tamanho
- **Interface admin**: Página `/admin/site-config` com formulários organizados e preview em tempo real
- **Componente**: `SiteConfigManagement` com upload de arquivos e seletor de cores integrado
- **Hook personalizado**: `useSiteConfig` para buscar configurações em toda a aplicação
- **Cores dinâmicas**: Sistema `useThemeColor` que aplica cores personalizadas automaticamente
- **Integração completa**: Nome e logo personalizados aparecem no header, footer e toda a aplicação
- **Validação**: Formulários com validação Zod para todos os campos de configuração
- **UX**: Botões "Ver na Home" para visualizar alterações instantaneamente
- **Conversão de cores**: Sistema que converte hex para HSL e aplica variações para hover/estados
- **Rodapé personalizado**: Informações do desenvolvedor "Leandro Menezes" integradas no rodapé

### Sistema de Email para Recuperação de Senha (2025-07-09)
- **Sistema multicanal**: Implementação inteligente com 3 níveis de fallback (SendGrid → Gmail → Desenvolvimento)
- **SendGrid integrado**: Suporte completo para envio profissional de emails em produção
- **Gmail fallback**: Opção alternativa usando nodemailer para contas Gmail configuradas
- **Modo desenvolvimento**: Console detalhado com links funcionais para testes locais
- **Email HTML responsivo**: Templates profissionais com design do Salão de Beleza Premium
- **Segurança**: Tokens com expiração de 1 hora e validação robusta
- **UX melhorada**: Mensagens de erro amigáveis e feedback visual claro
- **Configuração flexível**: Suporte a variáveis de ambiente para diferentes ambientes
- **Logging inteligente**: Logs diferenciados por método de envio para debug eficiente
- **Pronto para produção**: Aguardando apenas configuração de SENDGRID_API_KEY para funcionamento completo

### Sistema de Diagnóstico e Correção do Google OAuth (2025-07-10)
- **Problema resolvido**: Google OAuth funcionando completamente após configuração das URLs no Google Cloud Console
- **URL de produção atualizada**: https://salaocabeleireiro-lomenezes.replit.app
- **Configuração dinâmica**: Sistema detecta automaticamente URL do Replit e gera configurações corretas
- **Funcionamento confirmado**: Login Google operacional com criação automática de usuários
- **Logs detalhados**: Sistema de logging para acompanhar processo de autenticação
- **Fallback inteligente**: Mantém autenticação local como alternativa sempre disponível
- **Limpeza do projeto**: Removidos todos os arquivos de teste e diagnóstico desnecessários

### Migração Completa para PostgreSQL e Resolução de Persistência (2025-07-11)
- **Problema crítico resolvido**: Sistema migrado completamente de MemStorage para DatabaseStorage
- **Persistência garantida**: Todas as configurações agora são salvas permanentemente no banco PostgreSQL
- **Dados preservados**: Configurações de banner, footer, preços, categorias e serviços mantidos entre recarregamentos
- **Usuário admin criado**: Credenciais de acesso administrativo configuradas (lleandro.m32@gmail.com / admin)
- **Session store atualizado**: Sessions agora usam PostgreSQL via connect-pg-simple
- **Migração de schema**: Todas as tabelas criadas automaticamente via drizzle-kit push
- **Compatibilidade mantida**: Interface IStorage preservada para manter funcionamento da aplicação
- **Fallback removido**: Sistema não depende mais de dados temporários em memória
- **Produção pronta**: Configuração robusta para ambiente de produção com dados persistentes

### Sistema de Edição Completo de Serviços e Correção de Tabela de Preços (2025-07-11)
- **Edição de serviços finalizada**: Sistema completo com rota PUT `/api/admin/services/:id` funcional
- **Método updateService implementado**: Adicionado tanto no MemStorage quanto DatabaseStorage
- **Interface de edição completa**: Formulário com todos os campos (nome, descrição, preços, categoria, ícone, destaque)
- **Problema da tabela de preços corrigido**: Campos numéricos agora permitem deletar valores zero
- **UX melhorada**: Campos de preço usam strings durante edição, convertendo para números apenas no save
- **Validação aprimorada**: Tratamento correto de valores vazios e conversão de tipos
- **Funcionalidade completa**: Administradores podem criar, editar, deletar e destacar serviços

### Sistema de Agendamentos Corrigido e Funcional (2025-07-11)
- **Problema crítico resolvido**: API de agendamentos agora retorna dados corretamente para administradores
- **Autenticação corrigida**: Rota `/api/appointments` verifica autenticação e permissões admin adequadamente
- **Persistência confirmada**: Agendamentos salvos no PostgreSQL aparecem no painel administrativo
- **Sistema completo**: Administradores podem visualizar, confirmar e gerenciar todos os agendamentos
- **Segurança mantida**: Apenas usuários autenticados e com permissões admin acessam os agendamentos
- **Interface funcional**: Dashboard administrativo exibe agendamentos pendentes e permite alteração de status

### Sistema de Recuperação de Imagens Implementado (2025-07-11)
- **Problema de persistência resolvido**: Imagens quebradas após deploy são automaticamente detectadas e corrigidas
- **Limpeza automática**: Sistema verifica na inicialização se imagens referencidas existem fisicamente
- **Imagens SVG padrão**: Geração automática de imagens elegantes para serviços e banner quando necessário
- **Regeneração manual**: Endpoint `/api/admin/regenerate-images` para administradores forçarem limpeza
- **Detecção inteligente**: Sistema identifica URLs `/uploads/` quebradas e as substitui por padrões funcionais
- **Design profissional**: SVGs com gradientes e elementos visuais adequados ao tema de salão de beleza
- **Fallback robusto**: Garantia de que site sempre terá imagens funcionais, mesmo após problemas de deployment
- **Logs detalhados**: Sistema reporta quantas imagens foram corrigidas e quais serviços foram afetados

### Sistema de Validação de Conflito de Horários (2025-07-11)
- **Problema crítico resolvido**: Impossível criar dois agendamentos para o mesmo horário
- **Validação robusta**: Sistema verifica conflitos antes de criar novos agendamentos
- **Mensagens claras**: Erro 409 com explicação em português sobre horário ocupado
- **Informações do conflito**: Mostra nome do cliente e horário já agendado
- **Tratamento no frontend**: Interface exibe mensagem amigável quando horário está ocupado
- **Exclusão de cancelados**: Apenas agendamentos ativos (não cancelados) geram conflito
- **Integridade garantida**: Sistema mantém organização perfeita da agenda do salão

### Correção do Sistema de Limpeza de Imagens (2025-07-11)
- **Problema identificado**: Limpeza automática removendo imagens personalizadas válidas na inicialização
- **Solução implementada**: Limpeza automática desabilitada para preservar uploads do usuário
- **Imagens restauradas**: Imagens personalizadas mantidas no banco de dados
- **Limpeza manual**: Endpoint `/api/admin/regenerate-images` disponível quando necessário
- **Persistência garantida**: Imagens carregadas pelo usuário não são mais removidas automaticamente
- **Logs preservados**: Sistema ainda detecta e reporta estado das imagens sem alterá-las

### Sistema de Armazenamento de Imagens em Base64 no PostgreSQL (2025-07-11)
- **Problema resolvido definitivamente**: Migração completa do filesystem para armazenamento no banco PostgreSQL
- **Causa raiz identificada**: Filesystem efêmero em produção causava perda de imagens após deployments
- **Solução implementada**: Armazenamento de imagens como dados base64 diretamente no banco de dados
- **Schema atualizado**: Adicionados campos `image_data_base64` e `image_mime_type` nas tabelas services e banner
- **Rotas de upload atualizadas**: Sistema agora salva imagens como base64 em vez de arquivos físicos
- **Rotas de servir imagens**: Criadas `/api/images/service/:id` e `/api/images/banner` que convertem base64 para imagens
- **Migração automática**: Script desenvolvido que migrou todas as imagens existentes do filesystem para o banco
- **Resultado**: 4 imagens migradas com sucesso (3 serviços + 1 banner)
- **Persistência garantida**: Imagens agora sobrevivem a qualquer redeploy ou reinicialização
- **Performance otimizada**: Cache de 24 horas nas rotas de imagens
- **Compatibilidade total**: Sistema mantém URLs amigáveis (/api/images/...) para o frontend