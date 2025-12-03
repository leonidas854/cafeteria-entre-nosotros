// lib/src/features/menu/presentation/screens/product_detail_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // Para filtrar la entrada de texto
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fronted_iot/src/features/auth/presentation/providers/auth_providers.dart';
import 'package:fronted_iot/src/features/profile/presentation/providers/profile_providers.dart';
import 'package:fronted_iot/src/features/menu/presentation/providers/menu_providers.dart';
import 'package:fronted_iot/src/core/theme/app_colors.dart';
import 'package:go_router/go_router.dart';

// PASO 1: Convertir a ConsumerStatefulWidget
class ProductDetailScreen extends ConsumerStatefulWidget {
  final String productId;
  const ProductDetailScreen({super.key, required this.productId});

  @override
  ConsumerState<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  // PASO 2: Variables de estado para los controles de usuario
  final _formKey = GlobalKey<FormState>();
  final _mlController = TextEditingController();
  int? _selectedValve; // Válvula seleccionada (puede ser nulo al inicio)
  bool _isLoading = false; // Para mostrar un indicador de carga en el botón

  // Es importante liberar los recursos del controller cuando el widget se destruye
  @override
  void dispose() {
    _mlController.dispose();
    super.dispose();
  }

  // --- LÓGICA DE COMPRA ---
  Future<void> _dispensarProducto() async {
    // Validar que el campo de texto y la válvula estén seleccionados
    if (!_formKey.currentState!.validate()) return;
    if (_selectedValve == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Por favor, selecciona una válvula.'), backgroundColor: Colors.orange),
      );
      return;
    }

    final ml = int.parse(_mlController.text);
    final costo = (ml / 100.0) * 1.5; // La misma regla de negocio del backend

    // Mostrar diálogo de confirmación
    final confirmar = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmar Compra'),
        content: Text('Vas a comprar ${ml}ml por un costo de Bs. ${costo.toStringAsFixed(2)}. ¿Continuar?'),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Cancelar')),
          ElevatedButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('Confirmar')),
        ],
      ),
    );

    if (confirmar != true) return;

    // Iniciar la carga
    setState(() { _isLoading = true; });

    try {
      final resultado = await ref.read(authRepositoryProvider).dispensarProducto(
        productoId: widget.productId, // Usamos el ID del producto de la pantalla
        ml: ml,
        valvulaId: _selectedValve!,
      );

      // Si la compra es exitosa, invalidamos los providers para que se actualicen
      ref.invalidate(authNotifierProvider);
      ref.invalidate(profileDetailProvider);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('¡Compra exitosa! Nuevo saldo: Bs. ${resultado['nuevo_saldo'].toStringAsFixed(2)}'),
          backgroundColor: Colors.green,
        ),
      );
      // Navegar de vuelta a home después de una compra exitosa
      context.go('/home');

    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString().replaceAll("Exception: ", "")}'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      // Detener la carga, independientemente del resultado
      setState(() { _isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final productAsync = ref.watch(productDetailProvider(widget.productId));

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/home'),
        ),
        title: productAsync.when(
          data: (product) => Text(product.nombre),
          loading: () => const Text('Cargando...'),
          error: (e, st) => const Text('Detalle'),
        ),
      ),
      body: productAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
        data: (product) {
          return SingleChildScrollView(
            // Envolvemos todo en un Form
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Image.network(
                    product.imagen,
                    height: 300,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => const Icon(Icons.broken_image),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          product.nombre,
                          style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Precio base: Bs. 1.50 por 100ml', // Precio informativo
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(color: AppColors.accent),
                        ),
                        const SizedBox(height: 24),
                        const Divider(),
                        const SizedBox(height: 16),
                        
                        // --- INICIO DE NUEVOS CONTROLES ---
                        TextFormField(
                          controller: _mlController,
                          decoration: const InputDecoration(
                            labelText: 'Cantidad en mililitros (ml)',
                            border: OutlineInputBorder(),
                            suffixText: 'ml',
                          ),
                          keyboardType: TextInputType.number,
                          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Por favor, ingresa una cantidad';
                            }
                            if (int.tryParse(value) == null || int.parse(value) <= 0) {
                              return 'Ingresa un número válido y mayor a cero';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 24),
                        Text('Selecciona la válvula de salida', style: Theme.of(context).textTheme.titleMedium),
                        RadioListTile<int>(
                          title: const Text('Válvula 1'),
                          value: 1,
                          groupValue: _selectedValve,
                          onChanged: (value) => setState(() => _selectedValve = value),
                        ),
                        RadioListTile<int>(
                          title: const Text('Válvula 2'),
                          value: 2,
                          groupValue: _selectedValve,
                          onChanged: (value) => setState(() => _selectedValve = value),
                        ),
                        // --- FIN DE NUEVOS CONTROLES ---
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
      // El botón ahora llama a la nueva lógica
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(24.0),
        child: ElevatedButton(
          style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
          // Deshabilitamos el botón mientras está cargando
          onPressed: _isLoading ? null : _dispensarProducto,
          child: _isLoading 
            ? const CircularProgressIndicator(color: Colors.white) 
            : const Text('Comprar y Dispensar'),
        ),
      ),
    );
  }
}