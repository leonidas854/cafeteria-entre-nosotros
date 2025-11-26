import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fronted_iot/src/features/auth/presentation/providers/auth_providers.dart';

class RegisterScreen extends ConsumerWidget {
  const RegisterScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authNotifierProvider);
    final emailController = TextEditingController();
    final passwordController = TextEditingController();

    return Scaffold(
      appBar: AppBar(title: const Text('Crear Cuenta')),
      body: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            ElevatedButton(
              onPressed: authState.actionState.isLoading
                  ? null
                  : () {
                      ref
                          .read(authNotifierProvider.notifier)
                          .register(
                            "Nombre Falso",
                            emailController.text,
                            passwordController.text,
                          );
                    },
              child: authState.actionState.isLoading
                  ? const CircularProgressIndicator()
                  : const Text('REGISTRARSE'),
            ),
          ],
        ),
      ),
    );
  }
}
