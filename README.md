# PROAGILIS
Projet de bachelor

# Installation 
# BDD
Installer pgadmin
créer une bdd "proagilis" en localhost
# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
# Redis & Docker
avoir docker desktop installé et actif
docker run --rm -p 6379:6379 redis:7
# Frontend
cd frontend/frontend
npm install
npm run dev

# Données
commande pour remplir la bdd:
python manage.py loaddata ecommerce.json

Ce fichier peut être changé ou dupliqué pour changer le type de données

# Final
Avoir 3 terminal : django server, redis et vue avev vite
accès via http://localhost:3000/

