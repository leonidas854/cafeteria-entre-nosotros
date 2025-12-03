from django.urls import path
from .views import IniciarDispensacionView,RecomendacionesProxyView,ProductoDetailView

urlpatterns = [
    #path('dispensar/', IniciarDispensacionView.as_view(), name='Dispensador'),
    path('productos',RecomendacionesProxyView.as_view(),name="Productos"),
    path('prod_id/<str:producto_id>/',ProductoDetailView.as_view(),name="Productos_ID")
]