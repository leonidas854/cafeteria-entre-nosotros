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

    final authState = ref.watch(authNotifierProvider);
    final isLoggedIn = authState.status == AuthStatus.authenticated;


    final productsAsync = ref.watch(productListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Nuestro Menú'),
        actions: [
          if (isLoggedIn)
            IconButton(
              onPressed: () {
                logger.i('Navegando a /profile...');
                context.go('/profile');
              },
              icon: const Icon(Icons.person),
            )
          else
            TextButton(
              onPressed: () => context.go('/welcome'),
              child: const Text('Ingresar'),
            ),
          const SizedBox(width: 8),
        ],
      ),

      body: productsAsync.when(

        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) {
          logger.e('Error al cargar la lista de productos', error: err, stackTrace: stack);
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Text(
                'Oops, algo salió mal al cargar el menú.\nError: $err',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.red),
              ),
            ),
          );
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
  }
}