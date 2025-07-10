// Diagnóstico do erro redirect_uri_mismatch

console.log('🚨 DIAGNÓSTICO: ERRO redirect_uri_mismatch\n');

console.log('❌ PROBLEMA IDENTIFICADO:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('O Google Cloud Console ainda não foi atualizado com a nova URL');
console.log('A aplicação está tentando usar a URL nova, mas o Google só aceita as URLs antigas\n');

console.log('🔍 URL ATUAL DA APLICAÇÃO:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Nova URL funcionando: https://salaocabeleireiro-lomenezes.replit.app');
console.log('✅ Callback esperado: https://salaocabeleireiro-lomenezes.replit.app/api/auth/google/callback\n');

console.log('🔧 CONFIGURAÇÃO ATUAL NO GOOGLE CLOUD CONSOLE:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('❌ Provavelmente ainda configurado com URL antiga');
console.log('❌ Pode estar assim: https://salaocabeleireiro-LeandroOlivei50.replit.app\n');

console.log('✅ SOLUÇÃO IMEDIATA:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. 🌐 Acesse: https://console.cloud.google.com/');
console.log('2. 🔍 Navegue: APIs & Services > Credentials');
console.log('3. ✏️  Edite seu OAuth 2.0 Client ID');
console.log('4. 🗑️  REMOVA completamente todas as URLs antigas');
console.log('5. ➕ ADICIONE apenas estas 4 URLs:\n');

console.log('📍 JavaScript Origins:');
console.log('   • https://074180d3-6593-4975-b6e8-b8a879923e7e-00-22oylhbt1l0da.janeway.replit.dev');
console.log('   • https://salaocabeleireiro-lomenezes.replit.app\n');

console.log('📍 Authorized Redirect URIs:');
console.log('   • https://074180d3-6593-4975-b6e8-b8a879923e7e-00-22oylhbt1l0da.janeway.replit.dev/api/auth/google/callback');
console.log('   • https://salaocabeleireiro-lomenezes.replit.app/api/auth/google/callback\n');

console.log('💾 6. Clique em "SAVE"');
console.log('⏳ 7. Aguarde 2-3 minutos para propagação');
console.log('🧪 8. Teste novamente o login Google\n');

console.log('🎯 RESULTADO ESPERADO:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Erro redirect_uri_mismatch resolvido');
console.log('✅ Login Google funcionando perfeitamente');
console.log('✅ Redirecionamento correto após autenticação\n');

console.log('⚠️  IMPORTANTE:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('• Certifique-se de REMOVER todas as URLs antigas primeiro');
console.log('• Use EXATAMENTE as URLs listadas acima (copie e cole)');
console.log('• Não deixe URLs duplicadas ou similares');
console.log('• Aguarde alguns minutos após salvar antes de testar');