// lib/src/features/home/presentation/screens/home_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fronted_iot/src/core/utils/logger.dart';
import 'package:fronted_iot/src/features/auth/presentation/providers/auth_providers.dart';
import 'package:fronted_iot/src/features/menu/presentation/providers/menu_providers.dart';
import 'package:fronted_iot/src/features/menu/presentation/widgets/product_card.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
   
    final authStateAsync = ref.watch(authNotifierProvider);

    return authStateAsync.when(
  
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      ),

      error: (err, stack) => Scaffold(
        body: Center(child: Text('Error al cargar la sesión: $err')),
      ),

      data: (authState) {
     
        final isLoggedIn = authState.status == AuthStatus.authenticated;
        final productsAsync = ref.watch(productListProvider);

   
        return Scaffold(
          appBar: AppBar(
            title: const Text('Nuestro Menú'),
            actions: [
              if (isLoggedIn)
                IconButton(
                  onPressed: () => context.go('/profile'),
                  icon: const Icon(Icons.person),
                )
              else
                TextButton(
                  onPressed: () => context.go('/login'),
                  child: const Text('Ingresar'),
                ),
              const SizedBox(width: 8),
            ],
          ),
          body: productsAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, stack) {
              logger.e('Error al cargar productos', error: err, stackTrace: stack);
              return Center(child: Text('Error al cargar el menú: $err'));
            },
            data: (products) {
              return GridView.builder(
                padding: const EdgeInsets.all(16.0),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16.0,
                  mainAxisSpacing: 16.0,
                  childAspectRatio: 0.75,
                ),
                itemCount: products.length,
                itemBuilder: (context, index) {
                  return ProductCard(product: products[index]);
                },
              );
            },
          ),
        );
      },
    );
  }
}