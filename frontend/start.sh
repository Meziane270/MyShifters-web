#!/bin/bash
# Script de démarrage du frontend MyShifters

echo "🚀 Démarrage du frontend MyShifters..."
echo ""

# Vérifier que node_modules existe
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules n'existe pas. Exécutez d'abord : yarn install"
    exit 1
fi

echo "📝 Configuration détectée :"
if [ -f .env.local ]; then
    echo "   - .env.local (développement local)"
    cat .env.local | grep -v '^#' | grep -v '^$'
elif [ -f .env ]; then
    echo "   - .env (production)"
    cat .env | grep -v '^#' | grep -v '^$'
fi

echo ""
echo "🌐 Frontend démarrera sur : http://localhost:3000"
echo "🔗 Assurez-vous que le backend tourne sur le port configuré"
echo ""

# Démarrer le serveur de développement
yarn start
