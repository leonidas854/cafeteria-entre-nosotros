// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'recarga_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$recargaRepositoryHash() => r'5df0f6d6e4c4aa125928c9d826ad0964f1b4082f';

/// See also [recargaRepository].
@ProviderFor(recargaRepository)
final recargaRepositoryProvider = Provider<RecargaRepository>.internal(
  recargaRepository,
  name: r'recargaRepositoryProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$recargaRepositoryHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef RecargaRepositoryRef = ProviderRef<RecargaRepository>;
String _$recargaActionHash() => r'e5dc7f93b54f98f52d5580239c55635b787fd252';

/// See also [RecargaAction].
@ProviderFor(RecargaAction)
final recargaActionProvider =
    AutoDisposeNotifierProvider<RecargaAction, void>.internal(
      RecargaAction.new,
      name: r'recargaActionProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$recargaActionHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

typedef _$RecargaAction = AutoDisposeNotifier<void>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package
