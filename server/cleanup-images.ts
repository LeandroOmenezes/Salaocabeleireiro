import { storage } from "./storage";
import fs from "fs";
import path from "path";
import { seedDefaultImages } from "./seed-default-images";

export async function cleanupBrokenImageReferences() {
  console.log("🧹 Iniciando limpeza de referências de imagens quebradas...");
  
  try {
    // Verificar serviços com imagens
    const services = await storage.getServices();
    let cleanedServices = 0;
    
    for (const service of services) {
      if (service.imageUrl && service.imageUrl.startsWith('/uploads/')) {
        const imagePath = path.join(process.cwd(), service.imageUrl);
        if (!fs.existsSync(imagePath)) {
          console.log(`❌ Removendo referência quebrada: ${service.imageUrl} (Serviço: ${service.name})`);
          await storage.updateServiceImage(service.id, null);
          cleanedServices++;
        } else {
          console.log(`✅ Imagem válida: ${service.imageUrl} (Serviço: ${service.name})`);
        }
      }
    }
    
    // Verificar banner
    const banner = await storage.getBanner();
    let cleanedBanners = 0;
    
    if (banner?.backgroundImage && banner.backgroundImage.startsWith('/uploads/')) {
      const imagePath = path.join(process.cwd(), banner.backgroundImage);
      if (!fs.existsSync(imagePath)) {
        console.log(`❌ Removendo referência quebrada do banner: ${banner.backgroundImage}`);
        await storage.updateBannerImage(null);
        cleanedBanners++;
      } else {
        console.log(`✅ Imagem do banner válida: ${banner.backgroundImage}`);
      }
    }
    
    console.log(`🧹 Limpeza concluída: ${cleanedServices} serviços e ${cleanedBanners} banners corrigidos`);
    
    // Após limpeza, configurar imagens padrão se necessário
    await seedDefaultImages();
    
  } catch (error) {
    console.error("❌ Erro durante limpeza de imagens:", error);
  }
}