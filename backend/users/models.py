from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ETUDIANT = 'etudiant'
    ENSEIGNANT = 'enseignant'
    CHOIX_ROLE = [
        (ETUDIANT, 'Etudiant'),
        (ENSEIGNANT, 'Enseignant'),
    ]

    email = models.EmailField(max_length=255,unique=True)
    role = models.CharField(max_length=25, choices=CHOIX_ROLE, default=ETUDIANT)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email