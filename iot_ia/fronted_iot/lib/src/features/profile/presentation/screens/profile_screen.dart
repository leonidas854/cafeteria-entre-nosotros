
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fronted_iot/src/features/auth/presentation/providers/auth_providers.dart';

import 'package:fronted_iot/src/features/profile/presentation/providers/profile_providers.dart';


import 'package:go_router/go_router.dart';

import 'package:intl/intl.dart'; 

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

 
  String _formatDate(String isoString) {
    try {
      final dateTime = DateTime.parse(isoString);
 
      return DateFormat('dd MMM, yyyy - hh:mm a').format(dateTime);
    } catch (e) {
      return isoString; 
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
  
    final profileDataAsync = ref.watch(profileDetailProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mi Perfil'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/home'),
        ),
      ),
   
      body: profileDataAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error al cargar el perfil: $err')),
        data: (profileData) {

          final String name = profileData['name'] ?? 'Sin nombre';
          final String email = profileData['email'] ?? 'Sin email';
          final num saldo = profileData['saldo'] ?? 0;
          final List<dynamic> transacciones = profileData['historial_transacciones'] ?? [];

          return ListView(
            padding: const EdgeInsets.all(16.0),
            children: [
        
              Card(
                elevation: 2,
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.person_outline),
                      title: const Text('Nombre'),
                      subtitle: Text(name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    ),
                    const Divider(height: 1),
                    ListTile(
                      leading: const Icon(Icons.email_outlined),
                      title: const Text('Email'),
                      subtitle: Text(email, style: const TextStyle(fontSize: 16)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

    
              Card(
                elevation: 2,
                color: Theme.of(context).colorScheme.primaryContainer,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      const Text('SALDO ACTUAL', style: TextStyle(fontWeight: FontWeight.bold)),
                      Text(
                        'Bs. ${saldo.toStringAsFixed(2)}',
                        style: Theme.of(context).textTheme.displaySmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).colorScheme.onPrimaryContainer
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 30),
             

            
              ElevatedButton(
                onPressed: () {
                 
                  ref.read(authNotifierProvider.notifier).logout();
                  context.go('/welcome');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.redAccent,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16.0)
                ),
                child: const Text('Cerrar Sesión'),
              ),
               const SizedBox(height: 40),

             
              Text('Historial de Transacciones', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 10),
              if (transacciones.isEmpty)
                const Center(child: Text('No tienes transacciones todavía.'))
              else
           
                ListView.builder(
                  shrinkWrap: true, 
                  physics: const NeverScrollableScrollPhysics(), 
                  itemCount: transacciones.length,
                  itemBuilder: (context, index) {
                    final transaccion = transacciones[index];
                    final bool isRecarga = transaccion['tipo'] == 'recarga';
                    
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8.0),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: isRecarga ? Colors.green[100] : Colors.red[100],
                          child: Icon(
                            isRecarga ? Icons.arrow_upward : Icons.arrow_downward,
                            color: isRecarga ? Colors.green : Colors.red,
                          ),
                        ),
                        title: Text(transaccion['descripcion'] ?? 'Transacción'),
                        subtitle: Text(_formatDate(transaccion['timestamp'] ?? '')),
                        trailing: Text(
                          '${isRecarga ? '+' : '-'} Bs. ${transaccion['monto']}',
                          style: TextStyle(
                            color: isRecarga ? Colors.green : Colors.red,
                            fontWeight: FontWeight.bold,
                            fontSize: 16
                          ),
                        ),
                      ),
                    );
                  },
                ),
              
              
            ],
          );
        },
      ),
    );
  }
}