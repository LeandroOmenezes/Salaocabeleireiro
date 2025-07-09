// Script para corrigir Google OAuth automaticamente
console.log('🔧 CORREÇÃO AUTOMÁTICA DO GOOGLE OAUTH\n');

// Detectar URL atual
const replitDomains = process.env.REPLIT_DOMAINS;
if (!replitDomains) {
  console.log('❌ ERRO: Variável REPLIT_DOMAINS não encontrada');
  process.exit(1);
}

const currentUrl = `https://${replitDomains.split(',')[0]}`;
const callbackUrl = `${currentUrl}/api/auth/google/callback`;

console.log('🎯 URLs DETECTADAS:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📍 URL Base: ${currentUrl}`);
console.log(`📍 Callback: ${callbackUrl}`);

console.log('\n🔑 CONFIGURAÇÃO NO GOOGLE CLOUD CONSOLE:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. Acesse: https://console.cloud.google.com');
console.log('2. Vá em: APIs & Services → Credentials');
console.log('3. Clique na sua aplicação OAuth');
console.log('4. Na seção "Authorized JavaScript origins", adicione:');
console.log(`   ${currentUrl}`);
console.log('5. Na seção "Authorized redirect URIs", adicione:');
console.log(`   ${callbackUrl}`);
console.log('6. Clique em "Save"');
console.log('7. Aguarde alguns minutos para propagação');

// Verificar credenciais
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

console.log('\n🔍 VERIFICANDO CREDENCIAIS:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (!clientId || !clientSecret) {
  console.log('❌ ERRO: Credenciais do Google não configuradas');
  console.log('   Configure no Replit:');
  console.log('   • GOOGLE_CLIENT_ID');
  console.log('   • GOOGLE_CLIENT_SECRET');
} else {
  console.log('✅ Credenciais configuradas');
}

console.log('\n📱 INSTRUÇÕES PARA MOBILE:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. Abra o Google Cloud Console no navegador do desktop');
console.log('2. Configure as URLs acima');
console.log('3. Teste novamente no mobile após alguns minutos');

console.log('\n🧪 TESTE APÓS CONFIGURAÇÃO:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. Aguarde 5-10 minutos após salvar no Google Cloud');
console.log('2. Limpe o cache do navegador');
console.log('3. Teste o login com Google');
console.log('4. Verifique os logs do servidor se houver problemas');

// Criar instruções específicas para copy/paste
console.log('\n📋 COPIE E COLE NO GOOGLE CLOUD:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('JavaScript Origins:');
console.log(currentUrl);
console.log('\nAuthorized Redirect URIs:');
console.log(callbackUrl);

console.log('\n💡 DICA IMPORTANTE:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Se a URL do Replit mudar, você precisará atualizar');
console.log('novamente no Google Cloud Console.');
console.log('Considere usar um domínio personalizado para evitar isso.');

console.log('\n✅ PRONTO! Siga as instruções acima para corrigir o OAuth.');