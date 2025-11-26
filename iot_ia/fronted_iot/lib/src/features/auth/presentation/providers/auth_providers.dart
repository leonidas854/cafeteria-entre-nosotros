

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:fronted_iot/src/features/auth/data/repositories/fake_auth_repository_impl.dart';
import 'package:fronted_iot/src/features/auth/domain/repositories/auth_repository.dart';
import 'package:fronted_iot/src/core/utils/logger.dart';
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
  return FakeAuthRepositoryImpl();
}

@riverpod
class AuthNotifier extends _$AuthNotifier {
  @override
  AuthState build() {
   
    return AuthState();
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(actionState: const AsyncValue.loading());
    final action = await AsyncValue.guard(() {
      return ref.read(authRepositoryProvider).login(email, password);
    });

    if (!action.hasError) {
     
      state = state.copyWith(status: AuthStatus.authenticated, actionState: action);
    } else {
      state = state.copyWith(actionState: action);
    }
  }

  Future<void> register(String name, String email, String password) async {

    state = state.copyWith(actionState: const AsyncValue.loading());
    final action = await AsyncValue.guard(() async {
      await Future.delayed(const Duration(seconds: 2)); 
      logger.i('REGISTRO EXITOSO (FAKE)');
    });
     if (!action.hasError) {
      state = state.copyWith(status: AuthStatus.authenticated, actionState: action);
    } else {
      state = state.copyWith(actionState: action);
    }
  }

  Future<void> logout() async {
   
    state = AuthState(); 
  }
}