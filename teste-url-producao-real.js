// Teste da URL de produção real

import https from 'https';

const prodUrl = 'https://salaocabeleireiro-LeandroOlivei50.replit.app';
const authUrl = 'https://salaocabeleireiro-LeandroOlivei50.replit.app/api/auth/google';

console.log('🧪 TESTANDO URL DE PRODUÇÃO REAL\n');

function testUrl(url, description) {
  return new Promise((resolve) => {
    console.log(`🎯 Testando ${description}: ${url}`);
    
    const req = https.get(url, (res) => {
      console.log(`✅ ${description} - Status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        console.log(`🎉 ${description} - FUNCIONANDO!`);
      } else if (res.statusCode === 302 && description.includes('OAuth')) {
        console.log(`🔐 ${description} - REDIRECIONAMENTO OAuth OK!`);
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
  console.log('🔍 VERIFICANDO URL REAL DE PRODUÇÃO:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const mainStatus = await testUrl(prodUrl, 'Aplicação Principal');
  const oauthStatus = await testUrl(authUrl, 'Rota Google OAuth');

  console.log('\n📊 RESULTADO:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (mainStatus === 200) {
    console.log('🎉 APLICAÇÃO FUNCIONANDO EM PRODUÇÃO!');
    console.log('🔗 URL acessível: ' + prodUrl);
    
    console.log('\n🎯 URLS CORRETAS PARA GOOGLE CLOUD CONSOLE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 JavaScript Origins (adicionar ambas):');
    console.log('   1. https://074180d3-6593-4975-b6e8-b8a879923e7e-00-22oylhbt1l0da.janeway.replit.dev');
    console.log('   2. https://salaocabeleireiro-LeandroOlivei50.replit.app');
    console.log('');
    console.log('📍 Authorized Redirect URIs (adicionar ambas):');
    console.log('   1. https://074180d3-6593-4975-b6e8-b8a879923e7e-00-22oylhbt1l0da.janeway.replit.dev/api/auth/google/callback');
    console.log('   2. https://salaocabeleireiro-LeandroOlivei50.replit.app/api/auth/google/callback');
    
    console.log('\n✅ SUBSTITUA no Google Cloud Console:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ REMOVER: https://workspace.lomenezes.replit.app');
    console.log('❌ REMOVER: https://workspace.lomenezes.replit.app/api/auth/google/callback');
    console.log('✅ ADICIONAR: https://salaocabeleireiro-LeandroOlivei50.replit.app');
    console.log('✅ ADICIONAR: https://salaocabeleireiro-LeandroOlivei50.replit.app/api/auth/google/callback');
    
  } else {
    console.log('❌ Aplicação não está acessível');
    console.log('🔧 Verifique se o deploy está ativo');
  }

  console.log('\n🚀 PRÓXIMOS PASSOS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. 🔧 Atualize URLs no Google Cloud Console (conforme indicado acima)');
  console.log('2. 💾 Clique em "Salvar" no Google Cloud Console');
  console.log('3. ⏳ Aguarde 2-3 minutos para propagação');
  console.log('4. 🧪 Teste o login Google em: ' + prodUrl);
  console.log('5. 🎉 Google OAuth deve funcionar perfeitamente!');
}

runTests().catch(console.error);