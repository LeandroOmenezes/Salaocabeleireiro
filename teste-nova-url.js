// Teste da nova URL de produção

import https from 'https';

const newUrl = 'https://workspace.lomenezes.replit.app';
const authUrl = 'https://workspace.lomenezes.replit.app/api/auth/google';

console.log('🧪 TESTANDO NOVA URL DE PRODUÇÃO\n');

function testUrl(url, description) {
  return new Promise((resolve) => {
    console.log(`🎯 Testando ${description}: ${url}`);
    
    const req = https.get(url, (res) => {
      console.log(`✅ ${description} - Status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        console.log(`🎉 ${description} - FUNCIONANDO PERFEITAMENTE!`);
      } else if (res.statusCode === 302 && description.includes('OAuth')) {
        console.log(`🔐 ${description} - REDIRECIONAMENTO OAuth OK!`);
      } else {
        console.log(`ℹ️  ${description} - Status ${res.statusCode}`);
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
  console.log('🔍 VERIFICANDO NOVA URL:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const mainStatus = await testUrl(newUrl, 'Aplicação Principal');
  const oauthStatus = await testUrl(authUrl, 'Rota Google OAuth');

  console.log('\n📊 RESULTADO DOS TESTES:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (mainStatus === 200 && (oauthStatus === 302 || oauthStatus === 200)) {
    console.log('🎉 SUCESSO TOTAL!');
    console.log('✅ Aplicação funcionando em produção');
    console.log('✅ Google OAuth configurado corretamente');
    console.log('🔗 URL acessível: ' + newUrl);
    console.log('🔐 Rota OAuth operacional');
    
    console.log('\n✅ URLs CORRETAS PARA GOOGLE CLOUD CONSOLE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔗 JavaScript Origins:');
    console.log('   • https://074180d3-6593-4975-b6e8-b8a879923e7e-00-22oylhbt1l0da.janeway.replit.dev');
    console.log('   • https://workspace.lomenezes.replit.app');
    console.log('🔗 Authorized Redirect URIs:');
    console.log('   • https://074180d3-6593-4975-b6e8-b8a879923e7e-00-22oylhbt1l0da.janeway.replit.dev/api/auth/google/callback');
    console.log('   • https://workspace.lomenezes.replit.app/api/auth/google/callback');
    
  } else if (mainStatus === 200) {
    console.log('⚠️  Aplicação funcionando, mas OAuth pode ter problemas');
    console.log('✅ URL principal acessível');
    console.log('🔧 Verifique configuração OAuth no Google Cloud');
    
  } else {
    console.log('❌ Problemas detectados');
    console.log('🔧 Verifique se o deploy está ativo');
  }

  console.log('\n🎯 PRÓXIMOS PASSOS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (mainStatus === 200) {
    console.log('1. ✅ Confirme que as URLs estão corretas no Google Cloud Console');
    console.log('2. 🧪 Teste o login Google manualmente: ' + newUrl);
    console.log('3. 🔐 Clique em "Fazer Login com Google"');
    console.log('4. 🎉 Deve funcionar sem erros!');
  } else {
    console.log('1. 🔄 Verifique se o deploy está ativo');
    console.log('2. ⏳ Aguarde alguns minutos e teste novamente');
    console.log('3. 🔧 Verifique logs do servidor se necessário');
  }
}

runTests().catch(console.error);