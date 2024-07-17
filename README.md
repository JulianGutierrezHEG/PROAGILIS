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
commande pour remplir la bdd (Ce fichier peut être changé ou dupliqué pour changer le type de données):
python manage.py loaddata ecommerce.json
python manage.py runserver
# Redis & Docker
avoir docker desktop installé et actif
docker run --rm -p 6379:6379 redis:7
# Frontend
cd frontend/frontend
npm install
npm run dev



# Final
Avoir 3 terminal : django server, redis et vue avec vite
accès via http://localhost:3000/

