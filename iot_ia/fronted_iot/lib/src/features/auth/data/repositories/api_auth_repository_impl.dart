import 'package:dio/dio.dart';
//import 'package:fronted_iot/src/core/storage/secure_storage.dart';
import 'package:fronted_iot/src/features/auth/domain/repositories/auth_repository.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:fronted_iot/src/core/utils/logger.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:fronted_iot/src/features/auth/domain/entities/user_profile.dart';

class ApiAuthRepositoryImpl implements AuthRepository {
  final Dio _dio;
  final FlutterSecureStorage _storage;
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    serverClientId:
        '244257360794-hc6e82aj7jbnqc512hjcck3h63hphqlf.apps.googleusercontent.com',
  );
  ApiAuthRepositoryImpl(this._dio, this._storage);

  //244257360794-hc6e82aj7jbnqc512hjcck3h63hphqlf.apps.googleusercontent.com
  @override
  @override
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _dio.post(
        '/usuario/login/',
        data: {'email': email, 'password': password},
      );
      if (response.statusCode == 200 && response.data['idToken'] != null) {
        await _storage.write(key: 'idToken', value: response.data['idToken']);
        await _storage.write(key: 'userUid', value: response.data['uid']);
        return response.data;
      } else {
        throw Exception('Respuesta inválida del servidor durante el login');
      }
    } on DioException catch (e) {
      throw Exception(e.response?.data['error'] ?? 'Error de red en login');
    }
  }

  @override
  Future<void> register(String name, String email, String password) async {
    try {
      await _dio.post(
        '/usuario/registro/',
        data: {'name': name, 'email': email, 'password': password},
      );
      await login(email, password);
    } on DioException catch (e) {
      if (e.response != null && e.response?.data != null) {
        final Map<String, dynamic> errors = e.response?.data;

        final errorMessage = errors.values.first.first ?? 'Error de validación';
        logger.e('Error de validación desde la API: $errorMessage');
        throw Exception(errorMessage);
      }
      throw Exception('Error al registrar el usuario.');
    }
  }

  @override
  Future<void> logout() async {
    await _storage.delete(key: 'idToken');
  }

  @override
  Future<Map<String, dynamic>> signInWithGoogle() async {
    try {
      logger.i('Iniciando flujo de Google Sign-In...');
      final googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        logger.w('Flujo de Google Sign-In cancelado por el usuario.');

        throw Exception('Google cancelado.');
      }
      final googleAuth = await googleUser.authentication;
      final idToken = googleAuth.idToken;
      if (idToken == null) {
        logger.e('Error: no se pudo obtener el idToken de Google.');
        throw Exception('No se pudo obtener el idToken de Google.');
      }

      final response = await _dio.post(
        '/usuario/google/',
        data: {'idToken': idToken},
      );

      if (response.statusCode == 200 &&
          response.data['idToken'] != null &&
          response.data['uid'] != null) {
        final sessionToken = response.data['idToken'];
        final uid = response.data['uid'];

        logger.i(
          'Login con Google exitoso. UID: $uid, Token: ${sessionToken.substring(0, 10)}...',
        );

        await _storage.write(key: 'idToken', value: sessionToken);
        await _storage.write(key: 'userUid', value: uid);
        return response.data;
      } else {
        throw Exception(
          'El backend no devolvió una respuesta válida para Google Sign-In',
        );
      }
    } on DioException catch (e) {
      final errorMessage =
          e.response?.data['error'] ?? 'Error de red con Google Sign-In';
      logger.e('DioException en signInWithGoogle: $errorMessage');
      throw Exception(errorMessage);
    } catch (e) {
      logger.e(
        'Error NATIVO o inesperado en signInWithGoogle: ${e.toString()}',
      );
      throw Exception(e.toString());
    }
  }

  @override
  Future<Map<String, dynamic>> getMe() async {
    try {
      final token = await _storage.read(key: 'idToken');
      if (token == null) {
        throw Exception('Token no encontrado, no se puede obtener el perfil.');
      }

  
      final response = await _dio.post(
        '/usuario/me/',
        data: {'idToken': token},
      );

      return response.data;
    } on DioException catch (e) {
   
      throw Exception(
        e.response?.data['error'] ?? 'Error al obtener el perfil',
      );
    }
  }
   @override
  Future<Map<String, dynamic>> dispensarProducto({
    required String productoId, 
    required int ml, 
    required int valvulaId
  }) async {
    try {
      
      final token = await _storage.read(key: 'idToken');
      if (token == null) {
        throw Exception('Usuario no autenticado. Por favor, inicia sesión.');
      }

    
      final response = await _dio.post(
        '/sensores/dispensar/', 
        data: {
          'idToken': token,
          'producto_id': productoId, 
          'ml': ml,
          'valvula_id': valvulaId,
        },
      );
      
      return response.data; 

    } on DioException catch (e) {
      throw Exception(e.response?.data['error'] ?? 'Error de red al realizar la compra.');
    }
  }
}
