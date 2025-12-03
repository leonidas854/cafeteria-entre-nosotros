// lib/src/features/recargas/presentation/screens/recarga_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fronted_iot/src/features/recargas/presentation/providers/recarga_providers.dart';
import 'package:fronted_iot/src/core/utils/logger.dart'; // Importa tu logger 

class RecargaScreen extends ConsumerStatefulWidget {
  const RecargaScreen({super.key});

  @override
  ConsumerState<RecargaScreen> createState() => _RecargaScreenState();
}

class _RecargaScreenState extends ConsumerState<RecargaScreen> {
  final _montoController = TextEditingController();
  bool _isLoading = false; 

  @override
  void dispose() {
    _montoController.dispose();
    super.dispose();
  }


  Future<void> _realizarRecarga() async {
 
    FocusScope.of(context).unfocus();
    final monto = double.tryParse(_montoController.text);


    if (monto == null || monto <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Por favor, ingresa un monto válido.'), backgroundColor: Colors.orange),
      );
      return;
    }


    setState(() {
      _isLoading = true;
    });

    try {
 
      logger.i("Iniciando acción de recarga...");
      await ref.read(recargaActionProvider.notifier).realizarRecarga(monto);

    
      if (!mounted) return; 
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('¡Recarga exitosa!'), backgroundColor: Colors.green),
      );
      context.pop(); 

    } catch (e) {
     
      logger.e("Error durante la recarga: $e");
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
      );
    } finally {
     
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Recargar Saldo'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/home'),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              'Escanea este QR en el punto de venta',
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(25),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Image.asset(
                'assets/images/qr-code.png',
                errorBuilder: (context, error, stackTrace) => 
                  const Center(child: Icon(Icons.qr_code, size: 100, color: Colors.grey)),
              ),
            ),
            const SizedBox(height: 40),
            TextFormField(
              controller: _montoController,
              decoration: const InputDecoration(
                labelText: 'Monto a Recargar (Bs.)',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.attach_money),
              ),
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d{0,2}'))],
              enabled: !_isLoading, 
            ),
            const SizedBox(height: 30),
            ElevatedButton(
              onPressed: _isLoading ? null : _realizarRecarga,
              child: _isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Text('Confirmar Recarga'),
            ),
          ],
        ),
      ),
    );
  }
}