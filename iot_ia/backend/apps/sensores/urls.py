from django.urls import path
from .views import EnviarComandoDispensadorView, DispensarProductoView,ClimaRecomendacionesView

urlpatterns = [
    path('iot/comando/dispensar/', EnviarComandoDispensadorView.as_view(), name='iot-comando-dispensar'),
    path('dispensar/', DispensarProductoView.as_view(), name='dispensar-producto'),
    path('recomendaciones/clima/', ClimaRecomendacionesView.as_view(), name='recomendaciones-clima'),
]