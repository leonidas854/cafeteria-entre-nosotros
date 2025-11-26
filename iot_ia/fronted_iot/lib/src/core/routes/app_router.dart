// lib/src/core/routes/app_router.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fronted_iot/src/features/auth/presentation/providers/auth_providers.dart';
import 'package:fronted_iot/src/features/auth/presentation/screens/login_screen.dart';
import 'package:fronted_iot/src/features/auth/presentation/screens/register_screen.dart'; // Nueva pantalla
import 'package:fronted_iot/src/features/home/presentation/screens/home_screen.dart';
import 'package:fronted_iot/src/features/menu/presentation/screens/product_detail_screen.dart';
import 'package:fronted_iot/src/features/auth/presentation/screens/welcome_screen.dart'; // Nueva pantalla
import 'package:fronted_iot/src/features/profile/presentation/screens/profile_screen.dart'; // Nueva pantalla

// Hacemos el router un provider para que pueda leer otros providers
final goRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authNotifierProvider);

  return GoRouter(
    initialLocation: '/welcome', // La nueva pantalla de inicio
    routes: [
      GoRoute(path: '/welcome', builder: (context, state) => const WelcomeScreen()),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(path: '/register', builder: (context, state) => const RegisterScreen()),
      GoRoute(path: '/home', builder: (context, state) => const HomeScreen()),
      GoRoute(path: '/profile', builder: (context, state) => const ProfileScreen()),
      GoRoute(
        path: '/product/:id',
        builder: (context, state) {
          final productId = state.pathParameters['id']!;
          return ProductDetailScreen(productId: productId);
        },
      ),
    ],
    // Lógica de redirección
    redirect: (context, state) {
      final isLoggedIn = authState.status == AuthStatus.authenticated;
      final isGoingToAuthScreens = state.matchedLocation == '/login' || state.matchedLocation == '/register' || state.matchedLocation == '/welcome';

      // Si el usuario está logueado y trata de ir a login/register/welcome, llévalo a home
      if (isLoggedIn && isGoingToAuthScreens) {
        return '/home';
      }

      // Si no está logueado y trata de ir a una pantalla protegida (perfil), llévalo a login
      if (!isLoggedIn && state.matchedLocation == '/profile') {
        return '/login';
      }
      
      // En cualquier otro caso, no hagas nada
      return null;
    },
  );
});