// Teste da URL correta de produção

import https from 'https';

const correctUrl = 'https://workspace.leandroolivei50.replit.app';

console.log('🧪 TESTANDO URL CORRETA DE PRODUÇÃO\n');
console.log(`🎯 Testando: ${correctUrl}`);

function testUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      console.log(`✅ Status: ${res.statusCode}`);
      if (res.statusCode === 200) {
        console.log(`✅ ${url} - FUNCIONANDO PERFEITAMENTE!`);
        console.log(`🎉 A aplicação está acessível em produção`);
      } else {
        console.log(`⚠️  Status ${res.statusCode} - Pode estar redirecionando ou carregando`);
      }
      resolve(res.statusCode);
    });

    req.on('error', (err) => {
      console.log(`❌ ERRO: ${err.message}`);
      if (err.message.includes('certificate')) {
        console.log(`🔧 Ainda há problema de certificado SSL`);
      } else {
        console.log(`🔧 Problema de conectividade`);
      }
      resolve(0);
    });

    req.setTimeout(10000, () => {
      console.log(`⏰ TIMEOUT - Servidor demorou para responder`);
      req.destroy();
      resolve(0);
    });
  });
}

// Executar teste
testUrl(correctUrl).then(status => {
  console.log('\n📊 RESULTADO:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (status === 200) {
    console.log('🎉 SUCESSO! Aplicação funcionando em produção');
    console.log('✅ Agora você pode testar o Google OAuth');
    console.log('🔗 Acesse: ' + correctUrl);
    console.log('🔐 Clique em "Fazer Login com Google"');
  } else if (status > 0) {
    console.log('⚠️  Aplicação responde mas com status diferente de 200');
    console.log('💡 Isso pode ser normal para redirecionamentos');
    console.log('🧪 Teste manualmente: ' + correctUrl);
  } else {
    console.log('❌ Aplicação não está acessível');
    console.log('🔄 Verifique se o deploy foi feito corretamente');
  }
  
  console.log('\n🎯 PRÓXIMO PASSO:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 Atualize no Google Cloud Console:');
  console.log('❌ REMOVA: https://workspace.LeandroOlivei50.replit.app');
  console.log('✅ ADICIONE: https://workspace.leandroolivei50.replit.app');
  console.log('🔗 E as respectivas URLs de callback');
});