#!/bin/bash

if [[ -z "$RENDER_EXTERNAL_URL" ]]; then
  BASE_URL="http://localhost:5000"
  CALLBACK_URL="$BASE_URL/api/auth/google/callback"

  cat <<EOF > .env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=$CALLBACK_URL
SESSION_SECRET=$(openssl rand -hex 32)
EOF

  echo "✅ Ambiente local configurado!"
else
  echo "🔒 Ambiente de produção detectado — variáveis já estão no Render."
fi
