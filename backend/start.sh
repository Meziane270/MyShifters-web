#!/bin/bash
# Script de démarrage du backend MyShifters

echo "🚀 Démarrage du backend MyShifters..."
echo ""

if [ -f .env.local ]; then
    echo "📝 Chargement de .env.local (développement local)"
    export $(cat .env.local | grep -v '^#' | xargs)
fi

if [ -f .env ]; then
    echo "📝 Chargement de .env"
    export $(cat .env | grep -v '^#' | xargs)
fi

# Définir le port (par défaut 8000)
PORT=${PORT:-8000}

echo ""
echo "🌐 Backend démarrera sur : http://localhost:$PORT"
echo "📚 Documentation API : http://localhost:$PORT/docs"
echo ""

uvicorn server:app --host 0.0.0.0 --port $PORT --reload
