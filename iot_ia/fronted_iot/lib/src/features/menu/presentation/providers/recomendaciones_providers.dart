// lib/src/features/menu/presentation/providers/recomendaciones_providers.dart

import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:dio/dio.dart';
import 'package:fronted_iot/src/core/providers/dio_provider.dart';
import 'package:fronted_iot/src/features/menu/domain/entities/producto_recomendado.dart';

part 'recomendaciones_providers.g.dart';


class RecomendacionesRepository {
  final Dio _dio;
  RecomendacionesRepository(this._dio);


  Future<List<ProductoRecomendado>> getRecomendaciones() async {

    final response = await _dio.get('/sensores/recomendaciones/clima/'); 
    
    
    final data = response.data as List;
    
    
    return data.map((item) => ProductoRecomendado.fromJson(item as Map<String, dynamic>)).toList();
  }
}


@Riverpod(keepAlive: true)
RecomendacionesRepository recomendacionesRepository(RecomendacionesRepositoryRef ref) {
  return RecomendacionesRepository(ref.watch(dioProvider));
}

@Riverpod(keepAlive: true)
Future<List<ProductoRecomendado>> recomendaciones(RecomendacionesRef ref) {
  return ref.watch(recomendacionesRepositoryProvider).getRecomendaciones();
}