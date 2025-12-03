// lib/src/features/home/presentation/screens/home_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fronted_iot/src/features/auth/presentation/providers/auth_providers.dart';
import 'package:fronted_iot/src/features/menu/presentation/providers/menu_providers.dart';
import 'package:fronted_iot/src/features/menu/presentation/providers/recomendaciones_providers.dart';
import 'package:fronted_iot/src/features/menu/presentation/widgets/product_card.dart';
import 'package:fronted_iot/src/features/menu/domain/entities/producto_recomendado.dart';

import 'package:fronted_iot/src/features/auth/domain/entities/user_profile.dart';


class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authStateAsync = ref.watch(authNotifierProvider);

    return authStateAsync.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (err, stack) => Scaffold(body: Center(child: Text('Error al cargar la sesión: $err'))),
      data: (authState) {
        final isLoggedIn = authState.status == AuthStatus.authenticated;
        final productsAsync = ref.watch(productListProvider);
        final recomendacionesAsync = ref.watch(recomendacionesProvider);
        final userProfile = authState.profile;

        return Scaffold(
          appBar: AppBar(
            title: const Text('Nuestro Menú'),
            actions: [
              if (isLoggedIn)
                IconButton(onPressed: () => context.go('/profile'), icon: const Icon(Icons.person))
              else
                TextButton(onPressed: () => context.go('/login'), child: const Text('Ingresar')),
              const SizedBox(width: 8),
            ],
          ),
          body: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                
                if (isLoggedIn && userProfile != null)
                  _buildUserProfileHeader(context, userProfile),
                

                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Text('Recomendado para ti', style: Theme.of(context).textTheme.titleLarge),
                ),
                recomendacionesAsync.when(
                  loading: () => const SizedBox(height: 220, child: Center(child: CircularProgressIndicator())),
                  error: (e, st) => SizedBox(height: 220, child: Center(child: Text('No se pudieron cargar las recomendaciones'))),
                  data: (recs) => SizedBox(
                    height: 220,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16.0),
                      itemCount: recs.length,
                      itemBuilder: (context, index) {
                        final rec = recs[index];
                        return _buildRecommendationCard(context, rec);
                      },
                    ),
                  ),
                ),

                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
                  child: Text('Todo el Menú', style: Theme.of(context).textTheme.titleLarge),
                ),
                productsAsync.when(
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (err, stack) => Center(child: Text('Error al cargar el menú: $err')),
                  data: (products) {
                    return GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
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
              ],
            ),
          ),
          floatingActionButton: isLoggedIn
              ? FloatingActionButton(
                  onPressed: () {
                    context.go('/recarga');
                  },
                  child: const Icon(Icons.qr_code_scanner),
                )
              : null,
          floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
          bottomNavigationBar: isLoggedIn
              ? BottomAppBar(
                  shape: const CircularNotchedRectangle(),
                  notchMargin: 6.0,
                  child: Container(height: 50.0),
                )
              : null,
        );
      },
    );
  }


  Widget _buildUserProfileHeader(BuildContext context, UserProfile profile) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Card(
        elevation: 2.0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
             
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Bienvenido,',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  Text(
                    profile.name ?? 'Usuario', 
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                  ),
                ],
              ),
           
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'Tu Saldo',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  Text(
                    'Bs. ${profile.saldo.toStringAsFixed(2)}', 
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.primary, 
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }


  Widget _buildRecommendationCard(BuildContext context, ProductoRecomendado rec) {
  
    return SizedBox(
      width: 160,
      child: Card(
        clipBehavior: Clip.antiAlias,
        margin: const EdgeInsets.only(right: 12.0),
        child: InkWell(
          onTap: () {
            context.go('/product/${rec.idProducto}');
          },
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Image.network(
                  rec.imagen,
                  fit: BoxFit.cover,
                  width: double.infinity,
                  errorBuilder: (context, error, stackTrace) => const Icon(Icons.broken_image, size: 40),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Text(
                  rec.nombre,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8.0),
                child: Text(
                  'Bs. ${rec.precio}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }
}