from django.urls import path
from .views import CrearRecargaView, ConfirmarRecargaView, SaldoView

urlpatterns = [
    path('crear/', CrearRecargaView.as_view()),
    path('confirmar/', ConfirmarRecargaView.as_view()),
    path('saldo/', SaldoView.as_view()),
]
