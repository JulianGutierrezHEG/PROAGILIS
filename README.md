# PROAGILIS
Projet de bachelor

# Installation 
## BDD
- Installer pgadmin
- Créer une bdd "proagilis" en localhost

## Backend
- cd backend
- python -m venv venv
- venv\Scripts\activate
- pip install -r requirements.txt
- Données (ecommerce.json et evenements.json peut être modifié pour changer les données):
  - python manage.py makemigrations
  - python manage.py migrate
  - python manage.py loaddata ecommerce.json
  - python manage.py loaddata evenements.json

## Démarrage du serveur
- python manage.py runserver

## Redis & Docker
- Avoir docker desktop installé et actif
- docker run --rm -p 6379:6379 redis:7

## Frontend
- cd frontend/frontend
- npm install
- npm run dev

# Final
- Avoir 3 terminal : django server, redis et vue avec vite
- Accès via http://localhost:3000/

