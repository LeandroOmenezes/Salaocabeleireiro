import { storage } from "./storage";
import fs from "fs";
import path from "path";
import { seedDefaultImages } from "./seed-default-images";

export async function cleanupBrokenImageReferences() {
  console.log("🔒 Limpeza automática DESABILITADA para preservar imagens personalizadas");
  console.log("📸 Suas imagens estão protegidas e não serão removidas automaticamente");
  
  // LIMPEZA COMPLETAMENTE DESABILITADA PARA PROTEGER IMAGENS DO USUÁRIO
  // Só executar verificação sem modificar nada
  try {
    const services = await storage.getServices();
    console.log(`📊 Status atual: ${services.length} serviços encontrados`);
    
    for (const service of services) {
      if (service.imageUrl && service.imageUrl.startsWith('/uploads/')) {
        const imagePath = path.join(process.cwd(), service.imageUrl);
        if (!fs.existsSync(imagePath)) {
          console.log(`⚠️  Imagem não encontrada (mas preservada no banco): ${service.imageUrl} (Serviço: ${service.name})`);
        } else {
          console.log(`✅ Imagem válida: ${service.imageUrl} (Serviço: ${service.name})`);
        }
      }
    }
    
    const banner = await storage.getBanner();
    if (banner?.backgroundImage && banner.backgroundImage.startsWith('/uploads/')) {
      const imagePath = path.join(process.cwd(), banner.backgroundImage);
      if (!fs.existsSync(imagePath)) {
        console.log(`⚠️  Imagem do banner não encontrada (mas preservada no banco): ${banner.backgroundImage}`);
      } else {
        console.log(`✅ Imagem do banner válida: ${banner.backgroundImage}`);
      }
    }
    
    console.log("🔒 Verificação concluída SEM MODIFICAÇÕES - imagens preservadas");
    
    // SEED TAMBÉM DESABILITADO PARA PROTEGER IMAGENS PERSONALIZADAS
    // await seedDefaultImages();
    
  } catch (error) {
    console.error("❌ Erro durante verificação de imagens:", error);
  }
}