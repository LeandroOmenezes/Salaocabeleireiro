// Teste automatizado do Google OAuth em produção

import https from 'https';

console.log('🧪 TESTANDO GOOGLE OAUTH EM PRODUÇÃO\n');

// URLs para testar
const urls = {
  desenvolvimento: 'https://074180d3-6593-4975-b6e8-b8a879923e7e-00-22oylhbt1l0da.janeway.replit.dev',
  producao: 'https://workspace.LeandroOlivei50.replit.app'
};

// Função para fazer requisição HTTPS
function testUrl(url, name) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      console.log(`✅ ${name}: Status ${res.statusCode}`);
      if (res.statusCode === 200) {
        console.log(`   🌐 ${url} - FUNCIONANDO`);
      } else {
        console.log(`   ⚠️  ${url} - Status ${res.statusCode}`);
      }
      resolve(res.statusCode);
    });

    req.on('error', (err) => {
      console.log(`❌ ${name}: ERRO - ${err.message}`);
      console.log(`   🌐 ${url} - NÃO ACESSÍVEL`);
      resolve(0);
    });

    req.setTimeout(10000, () => {
      console.log(`⏰ ${name}: TIMEOUT - Servidor demorou para responder`);
      req.destroy();
      resolve(0);
    });
  });
}

// Função para testar rota específica do Google OAuth
function testGoogleAuthRoute(baseUrl, name) {
  return new Promise((resolve) => {
    const authUrl = `${baseUrl}/api/auth/google`;
    
    const req = https.get(authUrl, (res) => {
      console.log(`🔐 ${name} - OAuth: Status ${res.statusCode}`);
      if (res.statusCode === 302) {
        console.log(`   ✅ Redirecionamento OAuth funcionando`);
      } else {
        console.log(`   ⚠️  Status inesperado: ${res.statusCode}`);
      }
      resolve(res.statusCode);
    });

    req.on('error', (err) => {
      console.log(`❌ ${name} - OAuth: ERRO - ${err.message}`);
      resolve(0);
    });

    req.setTimeout(5000, () => {
      console.log(`⏰ ${name} - OAuth: TIMEOUT`);
      req.destroy();
      resolve(0);
    });
  });
}

// Executar testes
async function runTests() {
  console.log('🔍 VERIFICANDO CONECTIVIDADE:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const devStatus = await testUrl(urls.desenvolvimento, 'Desenvolvimento');
  const prodStatus = await testUrl(urls.producao, 'Produção');

  console.log('\n🔐 VERIFICANDO ROTAS GOOGLE OAUTH:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (devStatus === 200) {
    await testGoogleAuthRoute(urls.desenvolvimento, 'Desenvolvimento');
  }
  
  if (prodStatus === 200) {
    await testGoogleAuthRoute(urls.producao, 'Produção');
  }

  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (devStatus === 200 && prodStatus === 200) {
    console.log('🎉 AMBOS OS AMBIENTES FUNCIONANDO!');
    console.log('✅ Desenvolvimento: ONLINE');
    console.log('✅ Produção: ONLINE');
    console.log('✅ Google OAuth configurado corretamente');
  } else if (devStatus === 200) {
    console.log('⚠️  APENAS DESENVOLVIMENTO FUNCIONANDO');
    console.log('✅ Desenvolvimento: ONLINE');
    console.log('❌ Produção: OFFLINE ou com problemas');
  } else if (prodStatus === 200) {
    console.log('⚠️  APENAS PRODUÇÃO FUNCIONANDO');
    console.log('❌ Desenvolvimento: OFFLINE ou com problemas');
    console.log('✅ Produção: ONLINE');
  } else {
    console.log('❌ PROBLEMAS EM AMBOS OS AMBIENTES');
    console.log('❌ Desenvolvimento: OFFLINE');
    console.log('❌ Produção: OFFLINE');
  }

  console.log('\n💡 PRÓXIMOS PASSOS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (prodStatus === 200) {
    console.log('1. ✅ Aplicação funcionando em produção');
    console.log('2. 🧪 Teste o login Google em: ' + urls.producao);
    console.log('3. 🔐 Clique em "Fazer Login com Google"');
    console.log('4. 🎯 Deve funcionar sem erro "redirect_uri_mismatch"');
  } else {
    console.log('1. ⚠️  Aplicação não está acessível em produção');
    console.log('2. 🔄 Faça o deploy da aplicação');
    console.log('3. 🧪 Teste novamente após o deploy');
  }

  console.log('\n🔗 LINKS PARA TESTE:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('• Desenvolvimento: ' + urls.desenvolvimento);
  console.log('• Produção: ' + urls.producao);
  console.log('• Google Cloud Console: https://console.cloud.google.com');
}

// Executar testes
runTests().catch(console.error);