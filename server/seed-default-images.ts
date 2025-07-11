import { storage } from "./storage";
import fs from "fs";
import path from "path";

export async function seedDefaultImages() {
  console.log("🌱 Verificando necessidade de imagens padrão...");
  
  try {
    // Verificar se o diretório uploads existe
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log("📁 Diretório uploads criado");
    }
    
    // Verificar serviços sem imagem e que ainda referenciam arquivos inexistentes
    const services = await storage.getServices();
    const banner = await storage.getBanner();
    
    let needsDefault = false;
    
    // Verificar se algum serviço precisa de imagem padrão
    for (const service of services) {
      if (!service.imageUrl || (service.imageUrl.startsWith('/uploads/') && !fs.existsSync(path.join(process.cwd(), service.imageUrl)))) {
        needsDefault = true;
        break;
      }
    }
    
    // Verificar se o banner precisa de imagem padrão
    if (banner?.backgroundImage && banner.backgroundImage.startsWith('/uploads/') && !fs.existsSync(path.join(process.cwd(), banner.backgroundImage))) {
      needsDefault = true;
    }
    
    if (needsDefault) {
      console.log("🎨 Configurando imagens padrão SVG...");
      
      // Gerar SVG padrão para serviços (ícone de beleza)
      const defaultServiceSvg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad1)"/>
        <circle cx="200" cy="150" r="60" fill="white" opacity="0.9"/>
        <path d="M170 130 Q200 110 230 130 Q225 140 220 150 Q210 160 200 165 Q190 160 180 150 Q175 140 170 130 Z" fill="#8B5CF6"/>
        <circle cx="185" cy="140" r="3" fill="white"/>
        <circle cx="215" cy="140" r="3" fill="white"/>
        <path d="M190 155 Q200 165 210 155" stroke="white" stroke-width="2" fill="none"/>
        <text x="200" y="250" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">Serviço de Beleza</text>
      </svg>`;
      
      // Gerar SVG padrão para banner (fundo elegante)
      const defaultBannerSvg = `<svg width="1200" height="400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bannerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#764ba2;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f093fb;stop-opacity:1" />
          </linearGradient>
          <pattern id="dots" patternUnits="userSpaceOnUse" width="40" height="40">
            <circle cx="20" cy="20" r="2" fill="white" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="1200" height="400" fill="url(#bannerGrad)"/>
        <rect width="1200" height="400" fill="url(#dots)"/>
        <circle cx="100" cy="100" r="30" fill="white" opacity="0.1"/>
        <circle cx="1100" cy="300" r="50" fill="white" opacity="0.1"/>
        <circle cx="900" cy="80" r="20" fill="white" opacity="0.1"/>
        <text x="600" y="220" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="48" font-weight="bold">Salão de Beleza Premium</text>
      </svg>`;
      
      // Salvar SVGs como arquivos
      const defaultServicePath = path.join(uploadsDir, 'default-service.svg');
      const defaultBannerPath = path.join(uploadsDir, 'default-banner.svg');
      
      fs.writeFileSync(defaultServicePath, defaultServiceSvg);
      fs.writeFileSync(defaultBannerPath, defaultBannerSvg);
      
      console.log("✅ Imagens SVG padrão criadas");
      
      // Atualizar serviços sem imagem
      for (const service of services) {
        if (!service.imageUrl || (service.imageUrl.startsWith('/uploads/') && !fs.existsSync(path.join(process.cwd(), service.imageUrl)))) {
          await storage.updateServiceImage(service.id, '/uploads/default-service.svg');
          console.log(`🔄 Serviço "${service.name}" atualizado com imagem padrão`);
        }
      }
      
      // Atualizar banner se necessário
      if (!banner?.backgroundImage || (banner.backgroundImage && banner.backgroundImage.startsWith('/uploads/') && !fs.existsSync(path.join(process.cwd(), banner.backgroundImage)))) {
        await storage.updateBannerImage('/uploads/default-banner.svg');
        console.log("🔄 Banner atualizado com imagem padrão");
      }
    } else {
      console.log("✅ Todas as imagens estão funcionando corretamente");
    }
    
  } catch (error) {
    console.error("❌ Erro durante configuração de imagens padrão:", error);
  }
}