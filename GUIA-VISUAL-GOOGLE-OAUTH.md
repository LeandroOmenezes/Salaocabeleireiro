# 🔧 Guia Visual: Configurar Google OAuth para Produção

## ⚠️ Problema Atual
Você está recebendo o erro **"redirect_uri_mismatch"** porque tentou fazer login Google em produção, mas não configurou a URL de produção no Google Cloud Console.

## 🎯 Solução Completa

### 1. URLs que você precisa adicionar

**📍 JavaScript Origins (adicione as 2 URLs):**
```
https://074180d3-6593-4975-b6e8-b8a879923e7e-00-22oylhbt1l0da.janeway.replit.dev
https://workspace.LeandroOlivei50.replit.app
```

**📍 Authorized Redirect URIs (adicione as 2 URLs):**
```
https://074180d3-6593-4975-b6e8-b8a879923e7e-00-22oylhbt1l0da.janeway.replit.dev/api/auth/google/callback
https://workspace.LeandroOlivei50.replit.app/api/auth/google/callback
```

### 2. Passo a Passo no Google Cloud Console

1. **Acesse o Google Cloud Console:**
   - Vá para: https://console.cloud.google.com

2. **Navegue até as credenciais:**
   - Clique em "APIs & Services" (APIs e serviços)
   - Clique em "Credentials" (Credenciais)

3. **Encontre sua aplicação OAuth:**
   - Procure por "OAuth 2.0 Client IDs"
   - Clique na sua aplicação (provavelmente tem um nome como "Web client")

4. **Adicione as URLs de origem:**
   - Na seção "Authorized JavaScript origins"
   - Clique em "ADD URI"
   - Adicione: `https://074180d3-6593-4975-b6e8-b8a879923e7e-00-22oylhbt1l0da.janeway.replit.dev`
   - Clique em "ADD URI" novamente
   - Adicione: `https://workspace.LeandroOlivei50.replit.app`

5. **Adicione as URLs de callback:**
   - Na seção "Authorized redirect URIs"
   - Clique em "ADD URI"
   - Adicione: `https://074180d3-6593-4975-b6e8-b8a879923e7e-00-22oylhbt1l0da.janeway.replit.dev/api/auth/google/callback`
   - Clique em "ADD URI" novamente
   - Adicione: `https://workspace.LeandroOlivei50.replit.app/api/auth/google/callback`

6. **Salve as alterações:**
   - Clique em "SAVE" (Salvar)
   - Aguarde alguns minutos para a propagação

### 3. Testando a configuração

1. **Aguarde 5-10 minutos** após salvar no Google Cloud
2. **Limpe o cache do navegador** (Ctrl+Shift+Delete)
3. **Teste o login Google** novamente
4. **Verifique se funciona tanto em:**
   - Desenvolvimento: `https://074180d3-6593-4975-b6e8-b8a879923e7e-00-22oylhbt1l0da.janeway.replit.dev`
   - Produção: `https://workspace.LeandroOlivei50.replit.app`

## 📋 Checklist de Verificação

- [ ] Adicionei as 2 URLs em "JavaScript Origins"
- [ ] Adicionei as 2 URLs em "Authorized Redirect URIs"
- [ ] Cliquei em "SAVE" no Google Cloud Console
- [ ] Aguardei alguns minutos para propagação
- [ ] Limpei o cache do navegador
- [ ] Testei o login Google

## 🔍 Verificação Visual

**Se configurado corretamente, você deve ver no Google Cloud Console:**

```
Authorized JavaScript origins:
✅ https://074180d3-6593-4975-b6e8-b8a879923e7e-00-22oylhbt1l0da.janeway.replit.dev
✅ https://workspace.LeandroOlivei50.replit.app

Authorized redirect URIs:
✅ https://074180d3-6593-4975-b6e8-b8a879923e7e-00-22oylhbt1l0da.janeway.replit.dev/api/auth/google/callback
✅ https://workspace.LeandroOlivei50.replit.app/api/auth/google/callback
```

## 💡 Dicas Importantes

- **URLs devem ser exatamente iguais** - sem barras extras no final
- **Não confunda** "JavaScript Origins" com "Redirect URIs" - são diferentes
- **Aguarde alguns minutos** após salvar para a propagação
- **Limpe o cache** do navegador após configurar
- **Teste em ambos os ambientes** (desenvolvimento e produção)

## 🚨 Problemas Comuns

### "Erro ainda aparece após configurar"
- Aguarde mais alguns minutos
- Limpe completamente o cache do navegador
- Verifique se as URLs estão exatamente como mostrado acima

### "Não encontro onde adicionar as URLs"
- Certifique-se de estar na seção "Credentials" (Credenciais)
- Clique na sua aplicação OAuth (não em "API Key")
- Procure por "Authorized JavaScript origins" e "Authorized redirect URIs"

### "Tela de verificação do Google aparece"
- Isso é normal para apps não verificados
- Clique em "Avançado" → "Ir para [seu app] (não seguro)"
- Continue o login normalmente

## 📞 Próximos Passos

1. **Configure as URLs no Google Cloud Console** usando as informações acima
2. **Teste o login Google** em ambos os ambientes
3. **Relate o resultado** - funcionou ou ainda há erro?

---

**🎯 Resultado esperado:** Após configurar, o login Google funcionará tanto em desenvolvimento quanto em produção, resolvendo o erro "redirect_uri_mismatch".