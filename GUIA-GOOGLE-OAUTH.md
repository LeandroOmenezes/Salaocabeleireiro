# 🔐 Guia para Corrigir Google OAuth em Produção

## 🚨 Problema Identificado
O Google OAuth não funciona em produção porque a URL do Replit não está autorizada no console do Google Cloud.

## ✅ Solução Passo a Passo

### 1. Identificar a URL Atual
**URL do seu app:** `https://074180d3-6593-4975-b6e8-b8a879923e7e-00-22oylhbt1l0da.janeway.replit.dev`

### 2. Configurar no Google Cloud Console
1. Acesse: https://console.cloud.google.com
2. Selecione seu projeto (ou crie um se não existir)
3. Vá em **"APIs & Services"** → **"Credentials"**
4. Clique na sua aplicação OAuth (cliente da web)

### 3. Adicionar URLs Autorizadas
Na seção **"Authorized redirect URIs"**, adicione EXATAMENTE:
```
https://074180d3-6593-4975-b6e8-b8a879923e7e-00-22oylhbt1l0da.janeway.replit.dev/api/auth/google/callback
```

Na seção **"Authorized JavaScript origins"**, adicione:
```
https://074180d3-6593-4975-b6e8-b8a879923e7e-00-22oylhbt1l0da.janeway.replit.dev
```

### 4. Verificar Credenciais no Replit
No Replit, verifique se estas secrets estão configuradas:
- `GOOGLE_CLIENT_ID`: Seu Client ID do Google
- `GOOGLE_CLIENT_SECRET`: Seu Client Secret do Google

### 5. Como Encontrar as Credenciais no Google Cloud
1. No Google Cloud Console → APIs & Services → Credentials
2. Clique no nome da sua aplicação OAuth
3. Copie o **"Client ID"** e **"Client secret"**
4. Cole no Replit Secrets

## 🔄 Problema: URL Muda Sempre no Replit
A URL do Replit muda frequentemente. Para resolver permanentemente:

### Opção 1: Domínio Personalizado (Recomendado)
1. Configure um domínio personalizado no Replit
2. Use esse domínio fixo no Google Cloud

### Opção 2: URLs Dinâmicas
Adicione múltiplas URLs no Google Cloud:
- Padrão Replit: `https://*-00-*.janeway.replit.dev/api/auth/google/callback`
- Ou adicione várias URLs específicas conforme necessário

## 🧪 Teste Após Configuração
1. Salve as configurações no Google Cloud
2. Aguarde alguns minutos (pode demorar para propagar)
3. Teste o login com Google no seu app
4. Verifique os logs do servidor no Replit

## 📋 Checklist de Verificação
- [ ] Projeto criado no Google Cloud Console
- [ ] OAuth configurado com URLs corretas
- [ ] GOOGLE_CLIENT_ID configurado no Replit
- [ ] GOOGLE_CLIENT_SECRET configurado no Replit
- [ ] URLs de callback adicionadas
- [ ] JavaScript origins configurados
- [ ] Testado após aguardar propagação

## 🔧 Resolução de Problemas Comuns

### Erro: "redirect_uri_mismatch"
- Verifique se a URL está EXATA no Google Cloud
- Inclua /api/auth/google/callback no final
- Use https://, não http://

### Erro: "unauthorized_client"
- Verifique as credenciais Client ID e Secret
- Confirme se o projeto está ativo no Google Cloud

### Login não funciona após configurar
- Aguarde 5-10 minutos para propagação
- Limpe cache do navegador
- Verifique logs no console do Replit

## 📞 Precisa de Ajuda?
Se continuar com problemas:
1. Verifique os logs do servidor no Replit
2. Teste com conta do desenvolvedor primeiro
3. Confirme se todas as URLs estão corretas