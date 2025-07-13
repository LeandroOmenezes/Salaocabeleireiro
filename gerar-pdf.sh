#!/bin/bash
# Script para gerar PDF da documentação

echo "🔄 Gerando PDF da documentação..."

# Verifica se pandoc está instalado
if ! command -v pandoc &> /dev/null; then
    echo "❌ Pandoc não encontrado. Instalando..."
    # Para Ubuntu/Debian
    sudo apt-get update && sudo apt-get install -y pandoc
    # Para sistemas com snap
    # sudo snap install pandoc
fi

# Verifica se wkhtmltopdf está instalado (para PDF melhor)
if ! command -v wkhtmltopdf &> /dev/null; then
    echo "📄 Instalando wkhtmltopdf para melhor qualidade de PDF..."
    sudo apt-get install -y wkhtmltopdf
fi

# Gera o PDF
echo "📖 Convertendo Markdown para PDF..."

# Método 1: Usando pandoc (mais simples)
pandoc DOCUMENTACAO_SISTEMA.md -o "Documentacao_Sistema_Salao_de_Beleza.pdf" \
    --pdf-engine=wkhtmltopdf \
    --variable geometry:margin=2cm \
    --variable fontsize=11pt \
    --variable linestretch=1.2 \
    --toc \
    --toc-depth=3

if [ $? -eq 0 ]; then
    echo "✅ PDF gerado com sucesso: Documentacao_Sistema_Salao_de_Beleza.pdf"
    echo "📍 Localização: $(pwd)/Documentacao_Sistema_Salao_de_Beleza.pdf"
else
    echo "❌ Erro ao gerar PDF"
    echo "💡 Alternativa: Use um conversor online como:"
    echo "   - https://md-to-pdf.fly.dev/"
    echo "   - https://www.markdowntopdf.com/"
    echo "   - https://cloudconvert.com/md-to-pdf"
fi

echo ""
echo "📋 Arquivo fonte: DOCUMENTACAO_SISTEMA.md"
echo "📄 Tamanho da documentação: $(wc -l < DOCUMENTACAO_SISTEMA.md) linhas"
echo "🎯 Pronto para conversão manual ou impressão!"