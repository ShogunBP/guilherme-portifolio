#!/bin/bash

# Script para configurar limite de logs do Docker
# Execute este script UMA VEZ na VM para evitar crescimento infinito de logs
# Uso: sudo ./setup-docker-logs.sh

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Configurando limite de logs do Docker"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Este script precisa ser executado com sudo"
    echo "   Use: sudo ./setup-docker-logs.sh"
    exit 1
fi

DOCKER_DAEMON_FILE="/etc/docker/daemon.json"
BACKUP_FILE="/etc/docker/daemon.json.backup.$(date +%Y%m%d_%H%M%S)"

# Fazer backup do arquivo existente
if [ -f "$DOCKER_DAEMON_FILE" ]; then
    echo "📋 Fazendo backup do arquivo existente..."
    cp "$DOCKER_DAEMON_FILE" "$BACKUP_FILE"
    echo "   Backup salvo em: $BACKUP_FILE"
fi

# Criar ou atualizar configuração
echo ""
echo "📝 Configurando limite de logs..."
cat > "$DOCKER_DAEMON_FILE" << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "50m",
    "max-file": "3"
  }
}
EOF

echo "✅ Configuração aplicada:"
echo "   - Tamanho máximo por arquivo de log: 50MB"
echo "   - Número máximo de arquivos: 3"
echo "   - Total máximo por container: 150MB"
echo ""

# Reiniciar Docker
echo "🔄 Reiniciando serviço Docker..."
systemctl restart docker

if [ $? -eq 0 ]; then
    echo "✅ Docker reiniciado com sucesso"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✨ Configuração concluída!"
    echo ""
    echo "💡 Os logs antigos não serão apagados automaticamente."
    echo "   Execute o script de limpeza se necessário:"
    echo "   ./clean-docker-logs.sh"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo "❌ Erro ao reiniciar Docker"
    echo "   Verifique os logs: journalctl -u docker"
    exit 1
fi

