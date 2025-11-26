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
}
