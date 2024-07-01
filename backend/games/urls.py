from django.urls import path
from .views import UserGroupProjectPhaseView

urlpatterns = [
    path('', UserGroupProjectPhaseView.as_view(), name='showPhases'),
]
