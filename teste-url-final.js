// Teste da URL final de produção

import https from 'https';

const finalUrl = 'https://salaocabeleireiro-lomenezes.replit.app';
const authUrl = 'https://salaocabeleireiro-lomenezes.replit.app/api/auth/google';

console.log('🎯 TESTANDO URL FINAL DE PRODUÇÃO\n');

function testUrl(url, description) {
  return new Promise((resolve) => {
    console.log(`🔍 ${description}: ${url}`);
    
    const req = https.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ ${description} - FUNCIONANDO!`);
      } else if (res.statusCode === 302 && description.includes('OAuth')) {
        console.log(`✅ ${description} - REDIRECIONAMENTO OAuth OK!`);
      } else {
        console.log(`ℹ️  ${description} - Status: ${res.statusCode}`);
      }
      
      resolve(res.statusCode);
    });

    req.on('error', (err) => {
      console.log(`❌ ${description} - ERRO: ${err.message}`);
      resolve(0);
    });

    req.setTimeout(10000, () => {
      console.log(`⏰ ${description} - TIMEOUT`);
      req.destroy();
      resolve(0);
    });
  });
}

async function runTests() {
  console.log('🔍 VERIFICANDO URL FINAL:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const mainStatus = await testUrl(finalUrl, 'Aplicação Principal');
  const oauthStatus = await testUrl(authUrl, 'Google OAuth');

  console.log('\n📊 RESULTADO:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (mainStatus === 200) {
    console.log('🎉 APLICAÇÃO ATIVA EM PRODUÇÃO!');
    
    console.log('\n🔧 CONFIGURAÇÃO GOOGLE CLOUD CONSOLE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 JavaScript Origins:');
    console.log('   • https://074180d3-6593-4975-b6e8-b8a879923e7e-00-22oylhbt1l0da.janeway.replit.dev');
    console.log('   • https://salaocabeleireiro-lomenezes.replit.app');
    console.log('');
    console.log('📍 Authorized Redirect URIs:');
    console.log('   • https://074180d3-6593-4975-b6e8-b8a879923e7e-00-22oylhbt1l0da.janeway.replit.dev/api/auth/google/callback');
    console.log('   • https://salaocabeleireiro-lomenezes.replit.app/api/auth/google/callback');
    
    console.log('\n✅ SUBSTITUIR URLs ANTIGAS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ Remover todas as URLs antigas (workspace.lomenezes, LeandroOlivei50, etc.)');
    console.log('✅ Manter apenas as 2 URLs acima');
    
  } else {
    console.log('❌ URL não está acessível');
    console.log('🔧 Verifique se o deploy está ativo com a URL correta');
  }

  console.log('\n🚀 AÇÃO NECESSÁRIA:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. 🌐 Acesse Google Cloud Console');
  console.log('2. 🔧 Atualize com as URLs corretas (listadas acima)');
  console.log('3. 💾 Salve as alterações');
  console.log('4. ⏳ Aguarde 2-3 minutos');
  console.log('5. 🧪 Teste em: ' + finalUrl);
}

runTests().catch(console.error);