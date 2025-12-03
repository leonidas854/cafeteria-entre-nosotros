
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:dio/dio.dart';
import 'package:fronted_iot/src/core/providers/dio_provider.dart';

import 'package:fronted_iot/src/features/menu/domain/entities/producto_recomendado.dart';

part 'menu_providers.g.dart'; 
class MenuRepository {
  final Dio _dio;
  MenuRepository(this._dio);

  
  Future<List<ProductoRecomendado>> getProductos() async {

    final response = await _dio.get('/dispensador/productos'); 
    
   
    final data = response.data as List;
    
    return data.map((item) => ProductoRecomendado.fromJson(item as Map<String, dynamic>)).toList();
  }
   Future<ProductoRecomendado> getProductoById(String id) async {
    final response = await _dio.get('/dispensador/prod_id/$id/');
    return ProductoRecomendado.fromJson(response.data as Map<String, dynamic>);
  }
}


@Riverpod(keepAlive: true)
MenuRepository menuRepository(MenuRepositoryRef ref) {
  return MenuRepository(ref.watch(dioProvider));
}

@Riverpod(keepAlive: true)
Future<List<ProductoRecomendado>> productList(ProductListRef ref) {
  return ref.watch(menuRepositoryProvider).getProductos();
}
@riverpod
Future<ProductoRecomendado> productDetail(ProductDetailRef ref, String productId) {
  return ref.watch(menuRepositoryProvider).getProductoById(productId);
}