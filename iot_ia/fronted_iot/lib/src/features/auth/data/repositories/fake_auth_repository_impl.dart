import 'package:fronted_iot/src/features/auth/domain/repositories/auth_repository.dart';
import 'package:fronted_iot/src/core/utils/logger.dart';

class FakeAuthRepositoryImpl implements AuthRepository {
  @override
  Future<void> login(String email, String password) async {
    await Future.delayed(const Duration(seconds: 2));

    if (email == 'test@test.com' && password == '123456') {
      logger.i('LOGIN EXITOSO (FAKE)');
      return;
    } else {
      logger.i('LOGIN FALLIDO (FAKE)');
      throw Exception('Email o contraseña incorrectos');
    }
  }
  @override
Future<void> register(String name, String email, String password) async {
  await Future.delayed(const Duration(seconds: 1));
  logger.i('REGISTRO EXITOSO (FAKE) para $name');
  return;
}

@override
Future<void> logout() async { 
  await Future.delayed(const Duration(milliseconds: 100));
  logger.i('LOGOUT EXITOSO (FAKE)');
  return;
}
@override
  Future<void> signInWithGoogle() async { 
    logger.i('Iniciando flujo de Sign In con Google (FAKE)');
    await Future.delayed(const Duration(seconds: 3));
    logger.i('GOOGLE SIGN IN EXITOSO (FAKE)');
    return;
  }
}
