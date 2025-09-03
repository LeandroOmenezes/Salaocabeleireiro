#!/bin/bash

# Detecta ambiente e monta callback
BASE_URL=${RENDER_EXTERNAL_URL:-http://localhost:5000}
CALLBACK_URL="$BASE_URL/api/auth/google/callback"

# Cria .env
cat <<EOF > .env
GOOGLE_CLIENT_ID=coloque-aqui
GOOGLE_CLIENT_SECRET=coloque-aqui
GOOGLE_REDIRECT_URI=$CALLBACK_URL
SESSION_SECRET=$(openssl rand -hex 32)
EOF

echo "✅ Ambiente pronto para deploy!"
