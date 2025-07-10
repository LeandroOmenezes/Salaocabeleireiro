// Script para detectar URLs de produção e desenvolvimento para Google OAuth

console.log('🔍 DETECTANDO URLS PARA GOOGLE OAUTH\n');

// 1. Verificar variáveis de ambiente
console.log('📋 VERIFICANDO CONFIGURAÇÕES:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const replitDomains = process.env.REPLIT_DOMAINS;

console.log(`✅ GOOGLE_CLIENT_ID: ${clientId ? clientId.substring(0, 20) + '...' : '❌ NÃO CONFIGURADO'}`);
console.log(`✅ GOOGLE_CLIENT_SECRET: ${clientSecret ? '***configurado***' : '❌ NÃO CONFIGURADO'}`);
console.log(`✅ REPLIT_DOMAINS: ${replitDomains || '❌ NÃO ENCONTRADO'}`);

// 2. Detectar URLs de desenvolvimento e produção
console.log('\n🌐 URLS DETECTADAS:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const urls = [];

// URL de desenvolvimento (janeway.replit.dev)
if (replitDomains) {
  const devDomains = replitDomains.split(',');
  devDomains.forEach(domain => {
    if (domain.includes('janeway.replit.dev')) {
      urls.push({
        type: 'desenvolvimento',
        origin: `https://${domain}`,
        callback: `https://${domain}/api/auth/google/callback`
      });
    }
  });
}

// URL de produção (replit.app)
if (replitDomains) {
  const prodDomains = replitDomains.split(',');
  prodDomains.forEach(domain => {
    if (domain.includes('replit.app')) {
      urls.push({
        type: 'produção',
        origin: `https://${domain}`,
        callback: `https://${domain}/api/auth/google/callback`
      });
    }
  });
}

// Se não encontrou URLs automáticas, tentar detectar manualmente
if (urls.length === 0) {
  console.log('⚠️  URLs automáticas não detectadas, tentando detectar manualmente...');
  
  // Tentar detectar baseado em variáveis conhecidas
  const replId = process.env.REPL_ID;
  const replOwner = process.env.REPL_OWNER;
  const replSlug = process.env.REPL_SLUG;
  
  if (replId && replOwner && replSlug) {
    // URL de produção padrão
    const prodUrl = `https://${replSlug}.${replOwner}.replit.app`;
    urls.push({
      type: 'produção (detectada)',
      origin: prodUrl,
      callback: `${prodUrl}/api/auth/google/callback`
    });
    
    // URL de desenvolvimento pode variar, mas vamos tentar um padrão
    const devUrl = `https://${replId}-00-xxxx.janeway.replit.dev`;
    console.log(`📍 URL de desenvolvimento varia, padrão: ${devUrl}`);
  }
}

// 3. Mostrar todas as URLs encontradas
console.log('\n📍 TODAS AS URLS NECESSÁRIAS NO GOOGLE CLOUD CONSOLE:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log('\n🔗 JavaScript Origins:');
urls.forEach((url, index) => {
  console.log(`${index + 1}. ${url.origin} (${url.type})`);
});

console.log('\n🔗 Authorized Redirect URIs:');
urls.forEach((url, index) => {
  console.log(`${index + 1}. ${url.callback} (${url.type})`);
});

// 4. Instruções específicas para configurar
console.log('\n📋 PASSO A PASSO PARA CONFIGURAR NO GOOGLE CLOUD:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. Acesse: https://console.cloud.google.com');
console.log('2. Vá em: APIs & Services → Credentials');
console.log('3. Clique na sua aplicação OAuth');
console.log('4. Em "Authorized JavaScript origins", adicione TODAS as URLs acima');
console.log('5. Em "Authorized redirect URIs", adicione TODAS as URLs de callback acima');
console.log('6. Clique em "Save"');
console.log('7. Aguarde alguns minutos para propagação');

console.log('\n⚠️  IMPORTANTE:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('• Você precisa adicionar AMBAS as URLs (desenvolvimento E produção)');
console.log('• O erro "redirect_uri_mismatch" significa que a URL atual não está na lista');
console.log('• URLs de desenvolvimento do Replit podem mudar, então monitore regularmente');
console.log('• Para uso em produção, considere usar um domínio personalizado');

console.log('\n💡 SOLUÇÕES RÁPIDAS:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('• Se estiver testando em desenvolvimento, use a URL janeway.replit.dev');
console.log('• Se estiver em produção, use a URL replit.app');
console.log('• Adicione AMBAS as URLs no Google Cloud Console para funcionar em ambos ambientes');

// 5. Status final
console.log('\n📊 STATUS FINAL:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (urls.length > 0) {
  console.log(`✅ ${urls.length} URLs detectadas para configurar no Google Cloud`);
  console.log('✅ Copie as URLs acima e adicione no Google Cloud Console');
} else {
  console.log('❌ Nenhuma URL detectada automaticamente');
  console.log('💡 Configure manualmente usando as URLs do seu Replit');
}

if (!clientId || !clientSecret) {
  console.log('⚠️  Credenciais do Google não configuradas');
  console.log('💡 Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET nas secrets do Replit');
}

console.log('\n🎯 PRÓXIMOS PASSOS:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. Copie as URLs listadas acima');
console.log('2. Adicione no Google Cloud Console');
console.log('3. Aguarde alguns minutos');
console.log('4. Teste o login Google novamente');
console.log('5. Se o erro persistir, verifique se as URLs estão exatas');