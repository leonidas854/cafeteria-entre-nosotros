from django.urls import path
from .views import RealizarRecargaView

urlpatterns = [
    path('hacer_recarga/', RealizarRecargaView.as_view()),
]
