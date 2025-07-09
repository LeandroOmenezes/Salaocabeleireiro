// Script de diagnóstico para Google OAuth

console.log('🔍 DIAGNÓSTICO GOOGLE OAUTH\n');

// 1. Verificar variáveis de ambiente
console.log('📋 VERIFICANDO CONFIGURAÇÕES:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const replitDomains = process.env.REPLIT_DOMAINS;

console.log(`✅ GOOGLE_CLIENT_ID: ${clientId ? clientId.substring(0, 20) + '...' : '❌ NÃO CONFIGURADO'}`);
console.log(`✅ GOOGLE_CLIENT_SECRET: ${clientSecret ? '***configurado***' : '❌ NÃO CONFIGURADO'}`);
console.log(`✅ REPLIT_DOMAINS: ${replitDomains || '❌ NÃO ENCONTRADO'}`);

// 2. Gerar URLs necessárias
if (replitDomains) {
  const baseUrl = `https://${replitDomains.split(',')[0]}`;
  const callbackUrl = `${baseUrl}/api/auth/google/callback`;
  
  console.log('\n🌐 URLS PARA CONFIGURAR NO GOOGLE CLOUD:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 JavaScript Origins:`);
  console.log(`   ${baseUrl}`);
  console.log(`📍 Authorized Redirect URIs:`);
  console.log(`   ${callbackUrl}`);
  
  // 3. Instruções específicas
  console.log('\n📋 PASSO A PASSO PARA RESOLVER:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Acesse: https://console.cloud.google.com');
  console.log('2. Vá em: APIs & Services → Credentials');
  console.log('3. Clique na sua aplicação OAuth');
  console.log('4. Em "Authorized JavaScript origins", adicione:');
  console.log(`   ${baseUrl}`);
  console.log('5. Em "Authorized redirect URIs", adicione:');
  console.log(`   ${callbackUrl}`);
  console.log('6. Clique em "Save"');
  console.log('7. Aguarde alguns minutos e teste novamente');
}

// 4. Verificar formato das credenciais
console.log('\n🔍 VERIFICANDO FORMATO DAS CREDENCIAIS:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (clientId) {
  if (clientId.endsWith('.googleusercontent.com')) {
    console.log('✅ Client ID tem formato correto');
  } else {
    console.log('⚠️  Client ID pode estar incorreto (deve terminar com .googleusercontent.com)');
  }
} else {
  console.log('❌ Client ID não configurado');
}

if (clientSecret) {
  if (clientSecret.length >= 20) {
    console.log('✅ Client Secret parece válido');
  } else {
    console.log('⚠️  Client Secret muito curto, pode estar incorreto');
  }
} else {
  console.log('❌ Client Secret não configurado');
}

// 5. Status geral
console.log('\n📊 STATUS GERAL:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const problemasEncontrados = [];

if (!clientId) problemasEncontrados.push('Client ID não configurado');
if (!clientSecret) problemasEncontrados.push('Client Secret não configurado');
if (!replitDomains) problemasEncontrados.push('URL do Replit não detectada');
if (clientId && !clientId.endsWith('.googleusercontent.com')) problemasEncontrados.push('Client ID com formato suspeito');

if (problemasEncontrados.length === 0) {
  console.log('🎉 CONFIGURAÇÃO BÁSICA OK!');
  console.log('   Se ainda assim não funciona, o problema é no Google Cloud Console.');
  console.log('   Siga as instruções acima para adicionar as URLs.');
} else {
  console.log('❌ PROBLEMAS ENCONTRADOS:');
  problemasEncontrados.forEach(problema => {
    console.log(`   • ${problema}`);
  });
}

console.log('\n💡 PRÓXIMOS PASSOS:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. Configure as secrets no Replit (se não estiverem)');
console.log('2. Adicione as URLs no Google Cloud Console');
console.log('3. Aguarde alguns minutos para propagação');
console.log('4. Teste o login com Google');
console.log('5. Verifique os logs do servidor se houver erro');

console.log('\n🔗 LINKS ÚTEIS:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('• Google Cloud Console: https://console.cloud.google.com');
console.log('• OAuth Setup Guide: https://developers.google.com/identity/protocols/oauth2');
console.log('• Replit Secrets: https://replit.com/~/settings');