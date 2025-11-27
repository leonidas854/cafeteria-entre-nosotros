
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fronted_iot/src/core/utils/logger.dart'; 
import 'package:fronted_iot/src/features/auth/presentation/providers/auth_providers.dart';
import 'package:flutter/material.dart';
import 'package:fronted_iot/src/features/auth/presentation/screens/login_screen.dart';
import 'package:fronted_iot/src/features/auth/presentation/screens/register_screen.dart';
import 'package:fronted_iot/src/features/home/presentation/screens/home_screen.dart';
import 'package:fronted_iot/src/features/menu/presentation/screens/product_detail_screen.dart';
import 'package:fronted_iot/src/features/auth/presentation/screens/welcome_screen.dart';
import 'package:fronted_iot/src/features/profile/presentation/screens/profile_screen.dart';

final goRouterProvider = Provider<GoRouter>((ref) {
 
  
  return GoRouter(
    initialLocation: '/welcome',
    observers: [GoRouterObserver()],

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
    redirect: (context, state) {
      final isLoggedIn = ref.read(authNotifierProvider).status == AuthStatus.authenticated;
      final location = state.matchedLocation;
      
      logger.d('Redirect Check: isLoggedIn=$isLoggedIn, location=$location');

      final isGoingToAuthScreens = location == '/login' || location == '/register' || location == '/welcome'|| location == '/home';

      if (!isLoggedIn && !isGoingToAuthScreens) {
        return '/welcome';
      }


      return null;
    },
  );
});

class GoRouterObserver extends NavigatorObserver {
  @override
  void didPush(Route<dynamic> route, Route<dynamic>? previousRoute) {
    logger.i('Pushed: ${route.settings.name}');
  }
}