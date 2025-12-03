// lib/src/features/recargas/presentation/providers/recarga_providers.dart

import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:dio/dio.dart';
import 'package:fronted_iot/src/core/providers/dio_provider.dart';
import 'package:fronted_iot/src/core/utils/logger.dart';

import 'package:fronted_iot/src/features/auth/presentation/providers/auth_providers.dart';


part 'recarga_providers.g.dart';


class RecargaRepository {
  final Dio _dio;
  RecargaRepository(this._dio);


  Future<void> hacerRecarga({required String uid, required double monto}) async {
    final endpoint = '/creditos/hacer_recarga/';
    final payload = {'uid': uid, 'monto': monto};

    logger.d("Repositorio: Intentando hacer POST a '$endpoint' con payload: $payload");

    try {
      final response = await _dio.post(endpoint, data: payload)
          .timeout(const Duration(seconds: 15)); 

      logger.i("Repositorio: Respuesta de API de recarga: ${response.statusCode}");
      
      if (response.statusCode != 200) {
        throw Exception("El servidor respondió con un código inesperado: ${response.statusCode}");
      }
      
    } on DioException catch (e, stackTrace) {
      logger.e("Repositorio: DioException atrapada.", error: e.message, stackTrace: stackTrace);
      final errorMessage = e.response?.data?['error'] ?? 'Error de conexión. Revisa la URL de la API y que el servidor esté corriendo.';
      throw Exception(errorMessage);
    } catch (e, stackTrace) {
      logger.e("Repositorio: Error genérico inesperado en hacerRecarga.", error: e, stackTrace: stackTrace);
      throw Exception('Ocurrió un error inesperado durante la recarga.');
    }
  }
}

@Riverpod(keepAlive: true)
RecargaRepository recargaRepository(RecargaRepositoryRef ref) {
  return RecargaRepository(ref.watch(dioProvider));
}


@riverpod
class RecargaAction extends _$RecargaAction {
 
  @override
  void build() {
   
  }

  Future<void> realizarRecarga(double monto) async {
   
    final userUid = ref.read(authNotifierProvider).value?.uid;

    if (userUid == null) {
      throw Exception('Usuario no autenticado. No se puede realizar la recarga.');
    }
    
   
    await ref.read(recargaRepositoryProvider).hacerRecarga(uid: userUid, monto: monto);
 
    ref.invalidate(authNotifierProvider);
  }
}