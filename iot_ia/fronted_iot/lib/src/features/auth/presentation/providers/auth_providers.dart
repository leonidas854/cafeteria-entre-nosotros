
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:fronted_iot/src/features/auth/domain/repositories/auth_repository.dart';
import 'package:fronted_iot/src/core/providers/dio_provider.dart';
import 'package:fronted_iot/src/core/storage/secure_storage.dart';
import 'package:fronted_iot/src/features/auth/data/repositories/api_auth_repository_impl.dart';

part 'auth_providers.g.dart';




enum AuthStatus { authenticated, unauthenticated }


class AuthState {
  final AuthStatus status;
  final AsyncValue<void> actionState; 

  AuthState({this.status = AuthStatus.unauthenticated, this.actionState = const AsyncData(null)});

  AuthState copyWith({AuthStatus? status, AsyncValue<void>? actionState}) {
    return AuthState(
      status: status ?? this.status,
      actionState: actionState ?? this.actionState,
    );
  }
}

@riverpod
AuthRepository authRepository(Ref ref) {
  final dio = ref.watch(dioProvider);
  final storage = ref.watch(secureStorageProvider);
  return ApiAuthRepositoryImpl(dio, storage);
}


@riverpod
class AuthNotifier extends _$AuthNotifier {
  
  @override
  Future<AuthState> build() async {
  
    final storage = ref.read(secureStorageProvider);
    final token = await storage.read(key: 'idToken');
    if (token != null) {
      return AuthState(status: AuthStatus.authenticated);
    }
    return AuthState(status: AuthStatus.unauthenticated);
  }

  AuthRepository get _authRepo => ref.read(authRepositoryProvider);

  Future<void> login(String email, String password) async {
   
    state = const AsyncLoading<AuthState>().copyWithPrevious(state);
    
   
    state = await AsyncValue.guard(() async {
      await _authRepo.login(email, password);
     
      return AuthState(status: AuthStatus.authenticated);
    });
  }

  Future<void> register(String name, String email, String password) async {
    state = const AsyncLoading<AuthState>().copyWithPrevious(state);
    state = await AsyncValue.guard(() async {
      await _authRepo.register(name, email, password);
      return AuthState(status: AuthStatus.authenticated);
    });
  }

  Future<void> signInWithGoogle() async {
    state = const AsyncLoading<AuthState>().copyWithPrevious(state);
    state = await AsyncValue.guard(() async {
      await _authRepo.signInWithGoogle();
      return AuthState(status: AuthStatus.authenticated);
    });
  }

  Future<void> logout() async {
    await _authRepo.logout();

    state = AsyncData(AuthState(status: AuthStatus.unauthenticated));
  }
}