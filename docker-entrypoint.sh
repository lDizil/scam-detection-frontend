#!/bin/sh
set -e

cat > /usr/share/nginx/html/env-config.js << EOF
window.ENV = {
  VITE_API_URL: "${VITE_API_URL:-/api/v1}"
};
EOF

exec nginx -g "daemon off;"
