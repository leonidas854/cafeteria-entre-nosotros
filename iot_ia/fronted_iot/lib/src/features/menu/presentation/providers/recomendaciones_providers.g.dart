// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'recomendaciones_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$recomendacionesRepositoryHash() =>
    r'dffadeb63b97c6f11caa2b681fa4bdd0af051c2b';

/// See also [recomendacionesRepository].
@ProviderFor(recomendacionesRepository)
final recomendacionesRepositoryProvider =
    Provider<RecomendacionesRepository>.internal(
      recomendacionesRepository,
      name: r'recomendacionesRepositoryProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$recomendacionesRepositoryHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef RecomendacionesRepositoryRef = ProviderRef<RecomendacionesRepository>;
String _$recomendacionesHash() => r'23773918f3e3999725e2e7b0eec06d6982e6ac70';

/// See also [recomendaciones].
@ProviderFor(recomendaciones)
final recomendacionesProvider =
    FutureProvider<List<ProductoRecomendado>>.internal(
      recomendaciones,
      name: r'recomendacionesProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$recomendacionesHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef RecomendacionesRef = FutureProviderRef<List<ProductoRecomendado>>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package
