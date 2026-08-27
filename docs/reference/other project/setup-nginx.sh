#!/bin/bash

# Script de configuração do Nginx para thiagobahlsportfolio.com
# Execute com: sudo bash setup-nginx.sh

set -e

echo "🚀 Configurando Nginx para thiagobahlsportfolio.com"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Por favor, execute com sudo${NC}"
    exit 1
fi

# 1. Verificar se Nginx está instalado
echo -e "${YELLOW}📦 Verificando instalação do Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    echo "Nginx não encontrado. Instalando..."
    apt update
    apt install nginx -y
    echo -e "${GREEN}✅ Nginx instalado${NC}"
else
    echo -e "${GREEN}✅ Nginx já está instalado${NC}"
fi

# 2. Verificar firewall
echo ""
echo -e "${YELLOW}🔥 Verificando firewall...${NC}"
if command -v ufw &> /dev/null; then
    if ufw status | grep -q "Status: active"; then
        echo "Firewall ativo. Verificando portas 80 e 443..."
        if ! ufw status | grep -q "80/tcp"; then
            echo "Abrindo porta 80..."
            ufw allow 80/tcp
        fi
        if ! ufw status | grep -q "443/tcp"; then
            echo "Abrindo porta 443..."
            ufw allow 443/tcp
        fi
        echo -e "${GREEN}✅ Firewall configurado${NC}"
    else
        echo -e "${YELLOW}⚠️  Firewall não está ativo. Certifique-se de que as portas 80 e 443 estão abertas${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  UFW não encontrado. Verifique manualmente se as portas 80 e 443 estão abertas${NC}"
fi

# 3. Verificar se Docker está rodando na porta 8080
echo ""
echo -e "${YELLOW}🐳 Verificando Docker na porta 8080...${NC}"
if ss -tlnp | grep -q ":8080 "; then
    echo -e "${GREEN}✅ Porta 8080 está em uso (Docker provavelmente rodando)${NC}"
else
    echo -e "${RED}⚠️  Porta 8080 não está em uso. Certifique-se de que o Docker está rodando!${NC}"
    read -p "Continuar mesmo assim? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

# 4. Verificar se Docker está rodando na porta 3001 (API)
echo ""
echo -e "${YELLOW}🔌 Verificando API na porta 3001...${NC}"
if ss -tlnp | grep -q ":3001 "; then
    echo -e "${GREEN}✅ Porta 3001 está em uso (API provavelmente rodando)${NC}"
else
    echo -e "${RED}⚠️  Porta 3001 não está em uso. Certifique-se de que a API está rodando!${NC}"
fi

# 5. Criar arquivo de configuração
echo ""
echo -e "${YELLOW}📝 Criando arquivo de configuração...${NC}"

CONFIG_FILE="/etc/nginx/sites-available/thiagobahlsportfolio.com"

cat > "$CONFIG_FILE" << 'EOF'
server {
    listen 80;
    server_name thiagobahlsportfolio.com www.thiagobahlsportfolio.com;

    # Limite de tamanho de upload (200MB)
    client_max_body_size 200M;
    
    # Aumentar limite de tamanho da URL
    large_client_header_buffers 16 64k;

    # Logs específicos para este domínio
    access_log /var/log/nginx/portfolio.access.log;
    error_log /var/log/nginx/portfolio.error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Cache agressivo para assets estáticos
    location ~* \.(?:js|css|ico|png|jpe?g|gif|svg|webp|woff2?|ttf|eot)$ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location = /health {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        access_log off;
    }

    # Proxy para uploads (arquivos estáticos) - precisa vir antes do /api geral
    location ^~ /api/uploads {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache para imagens
        expires 1d;
        add_header Cache-Control "public, immutable";
        
        # Timeout aumentado para arquivos grandes
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        send_timeout 300s;
    }

    # Proxy para API - comunicação com backend
    location ^~ /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout aumentado para uploads grandes
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        send_timeout 300s;
    }

    # Sitemap e robots.txt - proxy para backend
    location ~ ^/(sitemap\.xml|robots\.txt)$ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Sem cache para sitemap e robots.txt
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # SPA - todas as outras rotas vão para o frontend
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Headers para SPA funcionar corretamente
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

echo -e "${GREEN}✅ Arquivo de configuração criado: $CONFIG_FILE${NC}"

# 6. Habilitar site
echo ""
echo -e "${YELLOW}🔗 Habilitando site...${NC}"
if [ -L "/etc/nginx/sites-enabled/thiagobahlsportfolio.com" ]; then
    echo "Link já existe, removendo..."
    rm /etc/nginx/sites-enabled/thiagobahlsportfolio.com
fi
ln -s /etc/nginx/sites-available/thiagobahlsportfolio.com /etc/nginx/sites-enabled/
echo -e "${GREEN}✅ Site habilitado${NC}"

# 7. Configurar server default (fechar conexão para domínios não configurados)
echo ""
echo -e "${YELLOW}🛡️  Configurando server default...${NC}"
DEFAULT_FILE="/etc/nginx/sites-available/default"
if [ -f "$DEFAULT_FILE" ]; then
    # Backup do arquivo original
    cp "$DEFAULT_FILE" "$DEFAULT_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    
    cat > "$DEFAULT_FILE" << 'EOF'
# Server default - retorna 444 (fecha conexão) para domínios não configurados
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    
    # Fecha a conexão sem resposta (mais seguro que 404)
    return 444;
}
EOF
    echo -e "${GREEN}✅ Server default configurado${NC}"
fi

# 8. Testar configuração
echo ""
echo -e "${YELLOW}🧪 Testando configuração do Nginx...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Configuração válida!${NC}"
else
    echo -e "${RED}❌ Erro na configuração! Corrija antes de continuar.${NC}"
    exit 1
fi

# 9. Recarregar Nginx
echo ""
echo -e "${YELLOW}🔄 Recarregando Nginx...${NC}"
systemctl reload nginx
echo -e "${GREEN}✅ Nginx recarregado${NC}"

# 10. Testar localmente
echo ""
echo -e "${YELLOW}🧪 Testando configuração localmente...${NC}"
if curl -s -H "Host: thiagobahlsportfolio.com" http://127.0.0.1 | head -n 1 | grep -q "<!DOCTYPE\|<html"; then
    echo -e "${GREEN}✅ Teste local bem-sucedido!${NC}"
else
    echo -e "${YELLOW}⚠️  Teste local retornou resposta inesperada. Verifique se o Docker está rodando.${NC}"
fi

# Resumo final
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Configuração do Nginx concluída!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Teste localmente:"
echo "   curl -H \"Host: thiagobahlsportfolio.com\" http://127.0.0.1"
echo ""
echo "2. Configure o DNS na GoDaddy:"
echo "   - Remova o registro A com 'WebsiteBuilder Site'"
echo "   - Crie registro A: @ → 168.138.134.26"
echo "   - Crie registro A: www → 168.138.134.26"
echo ""
echo "3. Aguarde propagação DNS (até 1 hora)"
echo ""
echo "4. Teste o domínio:"
echo "   curl http://thiagobahlsportfolio.com"
echo ""
echo "5. (Opcional) Configure HTTPS:"
echo "   sudo certbot --nginx -d thiagobahlsportfolio.com -d www.thiagobahlsportfolio.com"
echo ""
echo -e "${YELLOW}📝 Logs do Nginx:${NC}"
echo "   sudo tail -f /var/log/nginx/portfolio.access.log"
echo "   sudo tail -f /var/log/nginx/portfolio.error.log"
echo ""
echo -e "${GREEN}🎉 Pronto!${NC}"
