from django.urls import path
from .views import RegistroView, VerificarTokenLogin, LoginView, MeView, GoogleLoginView 


urlpatterns = [
    path('registro/', RegistroView.as_view()),
    path('verificacionToken/', VerificarTokenLogin.as_view()),
    path("login/", LoginView.as_view()),
    path("me/", MeView.as_view()),
    path("google/", GoogleLoginView.as_view()),
    #path('logout/', LogoutView.as_view(), name='logout'),
]