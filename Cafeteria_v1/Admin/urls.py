from Admin.views import login_view,logout
from .models import UsuarioBase
from django.urls import path, include

urlpatterns = [
    
    path('login/',login_view,name='login'),
    path('logout/',logout),
    
]
