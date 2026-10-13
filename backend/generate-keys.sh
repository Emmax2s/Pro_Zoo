#!/bin/bash
# Script para generar claves seguras para Pro Zoo
# Uso: ./generate-keys.sh

echo "🔐 Generando claves de seguridad para Pro Zoo..."
echo ""

echo "ADMIN_API_KEY:"
openssl rand -base64 32
echo ""

echo "JWT_SECRET:"
openssl rand -base64 32
echo ""

echo "✅ Copia estas claves en tu archivo .env"
echo "⚠️  Nunca compartas estas claves"
