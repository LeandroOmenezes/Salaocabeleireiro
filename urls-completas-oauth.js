// URLs completas para configurar Google OAuth no projeto

console.log('🔍 URLS COMPLETAS PARA GOOGLE OAUTH - SALÃO DE BELEZA\n');

// URLs baseadas nas informações do Replit
const replId = '074180d3-6593-4975-b6e8-b8a879923e7e';
const replOwner = 'LeandroOlivei50';
const replSlug = 'workspace';

// URLs de desenvolvimento e produção
const devUrl = 'https://074180d3-6593-4975-b6e8-b8a879923e7e-00-22oylhbt1l0da.janeway.replit.dev';
const prodUrl = `https://${replSlug}.${replOwner}.replit.app`;

console.log('📍 TODAS AS URLS NECESSÁRIAS NO GOOGLE CLOUD CONSOLE:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log('\n🔗 JavaScript Origins (adicione TODAS):');
console.log('1. ' + devUrl + ' (desenvolvimento)');
console.log('2. ' + prodUrl + ' (produção)');

console.log('\n🔗 Authorized Redirect URIs (adicione TODAS):');
console.log('1. ' + devUrl + '/api/auth/google/callback (desenvolvimento)');
console.log('2. ' + prodUrl + '/api/auth/google/callback (produção)');

console.log('\n📋 PASSO A PASSO PARA CORRIGIR O ERRO:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. 🌐 Acesse: https://console.cloud.google.com');
console.log('2. 🔍 Vá em: APIs & Services → Credentials');
console.log('3. ⚙️  Clique na sua aplicação OAuth');
console.log('4. 📝 Em "Authorized JavaScript origins", adicione:');
console.log('   • ' + devUrl);
console.log('   • ' + prodUrl);
console.log('5. 📝 Em "Authorized redirect URIs", adicione:');
console.log('   • ' + devUrl + '/api/auth/google/callback');
console.log('   • ' + prodUrl + '/api/auth/google/callback');
console.log('6. 💾 Clique em "Save"');
console.log('7. ⏳ Aguarde alguns minutos para propagação');
console.log('8. 🧪 Teste o login Google novamente');

console.log('\n⚠️  PROBLEMA ATUAL:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('❌ Erro: redirect_uri_mismatch');
console.log('❌ O Google está tentando redirecionar para uma URL não autorizada');
console.log('❌ Você está tentando fazer login em produção, mas não configurou a URL de produção');

console.log('\n✅ SOLUÇÃO:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Adicione AMBAS as URLs no Google Cloud Console');
console.log('✅ Isso permitirá login tanto em desenvolvimento quanto em produção');
console.log('✅ O erro será resolvido após a configuração');

console.log('\n🎯 URLS PARA COPIAR E COLAR NO GOOGLE CLOUD:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n📍 JavaScript Origins:');
console.log(devUrl);
console.log(prodUrl);
console.log('\n📍 Authorized Redirect URIs:');
console.log(devUrl + '/api/auth/google/callback');
console.log(prodUrl + '/api/auth/google/callback');

console.log('\n💡 DICAS IMPORTANTES:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('• As URLs devem ser exatamente como mostrado acima');
console.log('• Não adicione barras extras no final das URLs');
console.log('• Certifique-se de adicionar AMBAS as URLs (dev e prod)');
console.log('• Aguarde alguns minutos após salvar no Google Cloud');
console.log('• Se o erro persistir, limpe o cache do navegador');

console.log('\n🔗 LINKS ÚTEIS:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('• Google Cloud Console: https://console.cloud.google.com');
console.log('• Sua aplicação (desenvolvimento): ' + devUrl);
console.log('• Sua aplicação (produção): ' + prodUrl);

console.log('\n📊 STATUS:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔧 Configuração necessária no Google Cloud Console');
console.log('⏳ Aguardando você adicionar as URLs listadas acima');
console.log('🎯 Após configurar, o login Google funcionará em ambos os ambientes');