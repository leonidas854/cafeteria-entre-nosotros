// lib/src/features/auth/presentation/providers/auth_providers.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:fronted_iot/src/features/auth/domain/repositories/auth_repository.dart';
import 'package:fronted_iot/src/core/providers/dio_provider.dart';
import 'package:fronted_iot/src/core/storage/secure_storage.dart';
import 'package:fronted_iot/src/features/auth/data/repositories/api_auth_repository_impl.dart';
import 'package:fronted_iot/src/features/auth/domain/entities/user_profile.dart'; // Asegúrate de importar el modelo

part 'auth_providers.g.dart';

enum AuthStatus { authenticated, unauthenticated }

// --- CAMBIO 1: ACTUALIZAR AuthState ---
class AuthState {
  final AuthStatus status;
  final String? uid;
  final UserProfile? profile; // La información del perfil

  AuthState({
    this.status = AuthStatus.unauthenticated,
    this.uid,
    this.profile,
  });

  // copyWith ahora también puede manejar el perfil
  AuthState copyWith({AuthStatus? status, String? uid, UserProfile? profile}) {
    return AuthState(
      status: status ?? this.status,
      uid: uid ?? this.uid,
      profile: profile ?? this.profile,
    );
  }
}

@Riverpod(keepAlive: true)
AuthRepository authRepository(AuthRepositoryRef ref) {
  return ApiAuthRepositoryImpl(ref.watch(dioProvider), ref.watch(secureStorageProvider));
}

@Riverpod(keepAlive: true)
class AuthNotifier extends _$AuthNotifier {
  

  @override
  Future<AuthState> build() async {
    final storage = ref.read(secureStorageProvider);
    final token = await storage.read(key: 'idToken');
    

    if (token == null) {
      return AuthState(status: AuthStatus.unauthenticated);
    }

    
    try {
     
      final meData = await ref.read(authRepositoryProvider).getMe();

      return AuthState(
        status: AuthStatus.authenticated,
        uid: meData['uid'],
        profile: UserProfile.fromJson(meData), // <-- CORRECCIÓN AQUÍ
      );
      // ------------------------------------

    }  catch (e) {
     
      await ref.read(authRepositoryProvider).logout(); 
      return AuthState(status: AuthStatus.unauthenticated);
    }
  }

  AuthRepository get _authRepo => ref.read(authRepositoryProvider);


  Future<void> login(String email, String password) async {
    state = const AsyncLoading<AuthState>().copyWithPrevious(state);
    state = await AsyncValue.guard(() async {
      
      final loginData = await _authRepo.login(email, password);
  
      return AuthState(
        status: AuthStatus.authenticated,
        uid: loginData['uid'],
        profile: UserProfile.fromJson(loginData['profile'])
      );
    });
  }

  // El método register no cambia, su lógica es correcta
  Future<void> register(String name, String email, String password) async {
    state = const AsyncLoading<AuthState>().copyWithPrevious(state);
    state = await AsyncValue.guard(() async {
      await _authRepo.register(name, email, password);
      return state.value!; // Retorna el estado anterior (unauthenticated)
    });
  }

  // --- CAMBIO 4: ACTUALIZAR signInWithGoogle() ---
  Future<void> signInWithGoogle() async {
    state = const AsyncLoading<AuthState>().copyWithPrevious(state);
    state = await AsyncValue.guard(() async {
      // El repositorio ahora devuelve los datos completos del perfil
      final googleLoginData = await _authRepo.signInWithGoogle();
      // Creamos el nuevo estado con toda la información
      return AuthState(
        status: AuthStatus.authenticated,
        uid: googleLoginData['uid'],
        profile: UserProfile.fromJson(googleLoginData['profile'])
      );
    });
  }

  // --- CAMBIO 5: ACTUALIZAR logout() ---
  Future<void> logout() async {
    await _authRepo.logout();
    // Reseteamos al estado inicial, sin UID ni perfil
    state = AsyncData(AuthState(status: AuthStatus.unauthenticated, uid: null, profile: null));
  }
}