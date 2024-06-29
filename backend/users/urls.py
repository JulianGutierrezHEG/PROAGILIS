from django.urls import path
from .views import RegisterView, LoginView, AuthenticatedUserView, LogoutView

urlpatterns = [
    path('register', RegisterView.as_view()),
    path('login', LoginView.as_view()),
    path('logout', LogoutView.as_view()),
    path('userAuth', AuthenticatedUserView.as_view())
]
