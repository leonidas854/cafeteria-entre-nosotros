// en auth_repository.dart

abstract class AuthRepository {
  // CAMBIO: Ahora devuelven un mapa con los datos del usuario
  Future<Map<String, dynamic>> login(String email, String password);
  
  // 'register' puede seguir siendo void, ya que no inicia sesión
  Future<void> register(String name, String email, String password);
  
  Future<void> logout();
  
  // CAMBIO: Ahora devuelve un mapa con los datos del usuario
  Future<Map<String, dynamic>> signInWithGoogle();
  
  // Este no cambia
  Future<Map<String, dynamic>> getMe();

   Future<Map<String, dynamic>> dispensarProducto({
    required String productoId, 
    required int ml, 
    required int valvulaId
  });
}