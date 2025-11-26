import 'package:flutter_riverpod/flutter_riverpod.dart'; 
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:fronted_iot/src/features/menu/data/repositories/fake_menu_repository.dart';

import 'package:fronted_iot/src/features/menu/domain/entities/product.dart';

part 'menu_providers.g.dart';

@riverpod
FakeMenuRepository menuRepository(Ref ref) {
  return FakeMenuRepository();
}

@riverpod
Future<List<Product>> productList(Ref ref) {
  return ref.watch(menuRepositoryProvider).getProducts();
}

@riverpod
Future<Product> productDetail(Ref ref, String id) {
  return ref.watch(menuRepositoryProvider).getProductById(id);
}
