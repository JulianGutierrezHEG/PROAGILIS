from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/sessions/', include('games_sessions.urls')),
    path('api/games/', include('games.urls')),
]
