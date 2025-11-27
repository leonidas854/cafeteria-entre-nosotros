// lib/src/features/menu/presentation/providers/menu_providers.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:fronted_iot/src/features/menu/data/repositories/fake_menu_repository.dart';
import 'package:fronted_iot/src/features/menu/domain/entities/product.dart';

part 'menu_providers.g.dart';

@Riverpod(keepAlive: true)
FakeMenuRepository menuRepository(Ref ref) {
  return FakeMenuRepository();
}


@Riverpod(keepAlive: true)
Future<List<Product>> productList(Ref ref) {

  return ref.watch(menuRepositoryProvider).getProducts();
}

@riverpod
Future<Product> productDetail(Ref ref, String id) {

  return ref.read(menuRepositoryProvider).getProductById(id);
}