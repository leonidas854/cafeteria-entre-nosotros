import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fronted_iot/src/core/routes/app_router.dart';
import 'package:fronted_iot/src/core/theme/app_theme.dart';

void main() {
  runApp(const ProviderScope(child: MyApp()));
}

// lib/main.dart
class MyApp extends ConsumerWidget { 
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) { 
    final router = ref.watch(goRouterProvider); 

    return MaterialApp.router(
      title: 'Cafeteria App',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.theme,
      routerConfig: router, 
    );
  }
}
