from Admin.views import login_view,logout_view
from .models import UsuarioBase
from django.urls import path, include

urlpatterns = [
    
    path('login/',login_view,name='login'),
    path('logout/',logout_view),
    
    
]
