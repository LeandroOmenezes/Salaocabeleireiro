// Script para detectar a URL correta de produção

console.log('🔍 DETECTANDO URL CORRETA DE PRODUÇÃO\n');

// Informações do ambiente
const replId = process.env.REPL_ID;
const replOwner = process.env.REPL_OWNER;
const replSlug = process.env.REPL_SLUG;

console.log('📋 INFORMAÇÕES DO REPLIT:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`REPL_ID: ${replId}`);
console.log(`REPL_OWNER: ${replOwner}`);
console.log(`REPL_SLUG: ${replSlug}`);

// URLs possíveis para produção
const possibleUrls = [
  `https://${replSlug}.${replOwner}.replit.app`,
  `https://${replSlug}.${replOwner.toLowerCase()}.replit.app`,
  `https://${replId}.replit.app`,
  `https://${replSlug}-${replOwner.toLowerCase()}.replit.app`
];

console.log('\n🌐 URLS POSSÍVEIS PARA PRODUÇÃO:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

possibleUrls.forEach((url, index) => {
  console.log(`${index + 1}. ${url}`);
});

// URL mais provável (com username em minúsculas)
const correctUrl = `https://${replSlug}.${replOwner.toLowerCase()}.replit.app`;

console.log('\n✅ URL MAIS PROVÁVEL:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(correctUrl);

console.log('\n📍 URLS CORRETAS PARA GOOGLE CLOUD CONSOLE:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log('\n🔗 JavaScript Origins:');
console.log('https://074180d3-6593-4975-b6e8-b8a879923e7e-00-22oylhbt1l0da.janeway.replit.dev');
console.log(correctUrl);

console.log('\n🔗 Authorized Redirect URIs:');
console.log('https://074180d3-6593-4975-b6e8-b8a879923e7e-00-22oylhbt1l0da.janeway.replit.dev/api/auth/google/callback');
console.log(`${correctUrl}/api/auth/google/callback`);

console.log('\n⚠️  CORREÇÃO NECESSÁRIA:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('❌ URL incorreta: https://workspace.LeandroOlivei50.replit.app');
console.log('✅ URL correta: ' + correctUrl);
console.log('💡 O Replit usa usernames em minúsculas nas URLs');

console.log('\n📋 PASSO A PASSO PARA CORRIGIR:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. 🌐 Acesse: https://console.cloud.google.com');
console.log('2. 🔍 Vá em: APIs & Services → Credentials');
console.log('3. ⚙️  Clique na sua aplicação OAuth');
console.log('4. 🔄 SUBSTITUA a URL incorreta pela correta:');
console.log('   ❌ REMOVA: https://workspace.LeandroOlivei50.replit.app');
console.log('   ✅ ADICIONE: ' + correctUrl);
console.log('5. 🔄 SUBSTITUA também na redirect URI:');
console.log('   ❌ REMOVA: https://workspace.LeandroOlivei50.replit.app/api/auth/google/callback');
console.log('   ✅ ADICIONE: ' + correctUrl + '/api/auth/google/callback');
console.log('6. 💾 Clique em "Save"');
console.log('7. ⏳ Aguarde alguns minutos');
console.log('8. 🧪 Teste novamente');

console.log('\n🎯 RESULTADO ESPERADO:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Login Google funcionará em produção');
console.log('✅ Não haverá mais erro de certificado SSL');
console.log('✅ Ambos os ambientes funcionarão perfeitamente');