// Teste da URL atualizada após redeploy

import https from 'https';

const novaUrl = 'https://salaocabeleireiro-lomenezes.replit.app';
const authUrl = 'https://salaocabeleireiro-lomenezes.replit.app/api/auth/google';

console.log('🎯 TESTANDO URL APÓS REDEPLOY\n');

function testUrl(url, description) {
  return new Promise((resolve) => {
    console.log(`🔍 ${description}: ${url}`);
    
    const req = https.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ ${description} - FUNCIONANDO!`);
      } else if (res.statusCode === 302) {
        console.log(`✅ ${description} - REDIRECIONAMENTO OK!`);
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
  console.log('🔍 VERIFICANDO URL APÓS REDEPLOY:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const mainStatus = await testUrl(novaUrl, 'Aplicação Principal');
  const oauthStatus = await testUrl(authUrl, 'Google OAuth');

  console.log('\n📊 RESULTADO:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (mainStatus === 200) {
    console.log('🎉 NOVA URL FUNCIONANDO!');
    
    console.log('\n🔧 CONFIGURAÇÃO GOOGLE CLOUD CONSOLE ATUALIZADA:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 JavaScript Origins:');
    console.log('   • https://074180d3-6593-4975-b6e8-b8a879923e7e-00-22oylhbt1l0da.janeway.replit.dev');
    console.log('   • https://salaocabeleireiro-lomenezes.replit.app');
    console.log('');
    console.log('📍 Authorized Redirect URIs:');
    console.log('   • https://074180d3-6593-4975-b6e8-b8a879923e7e-00-22oylhbt1l0da.janeway.replit.dev/api/auth/google/callback');
    console.log('   • https://salaocabeleireiro-lomenezes.replit.app/api/auth/google/callback');
    
    console.log('\n✅ SUBSTITUIR NO GOOGLE CLOUD CONSOLE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ REMOVER: https://salaocabeleireiro-LeandroOlivei50.replit.app');
    console.log('❌ REMOVER: https://salaocabeleireiro-LeandroOlivei50.replit.app/api/auth/google/callback');
    console.log('✅ ADICIONAR: https://salaocabeleireiro-lomenezes.replit.app');
    console.log('✅ ADICIONAR: https://salaocabeleireiro-lomenezes.replit.app/api/auth/google/callback');
    
  } else {
    console.log('❌ Nova URL ainda não está acessível');
    console.log('🔧 Aguarde alguns minutos após o redeploy');
  }

  console.log('\n🚀 PRÓXIMOS PASSOS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. 🔧 Atualize URLs no Google Cloud Console');
  console.log('2. 💾 Salve as alterações');
  console.log('3. ⏳ Aguarde 2-3 minutos');
  console.log('4. 🧪 Teste o login Google');
  console.log('5. 🎉 Sistema completo funcionando!');
}

runTests().catch(console.error);