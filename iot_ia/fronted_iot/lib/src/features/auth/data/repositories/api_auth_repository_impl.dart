import 'package:dio/dio.dart';
//import 'package:fronted_iot/src/core/storage/secure_storage.dart';
import 'package:fronted_iot/src/features/auth/domain/repositories/auth_repository.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:fronted_iot/src/core/utils/logger.dart';

class ApiAuthRepositoryImpl implements AuthRepository {
  final Dio _dio;
  final FlutterSecureStorage _storage;

  ApiAuthRepositoryImpl(this._dio, this._storage);

  @override
  Future<void> login(String email, String password) async {
    try {
      final response = await _dio.post(
        '/usuario/login/',
        data: {'email': email, 'password': password},
      );

      if (response.statusCode == 200 && response.data['idToken'] != null) {
        await _storage.write(key: 'idToken', value: response.data['idToken']);
      } else {
        throw Exception('Error en la respuesta del servidor');
      }
    } on DioException catch (e) {
      final errorMessage =
          e.response?.data['error']?['message'] ?? 'Error de red';
      throw Exception(errorMessage);
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
  Future<void> signInWithGoogle() async {
    throw UnimplementedError(
      'signInWithGoogle no está implementado en ApiAuthRepositoryImpl',
    );
  }
}
