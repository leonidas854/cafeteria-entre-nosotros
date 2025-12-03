// lib/src/features/auth/presentation/widgets/google_sign_in_button.dart

import 'package:flutter/material.dart';

class GoogleSignInButton extends StatelessWidget {
  final VoidCallback? onPressed; 
  const GoogleSignInButton({super.key, this.onPressed});

  @override
  Widget build(BuildContext context) {
  
    return ElevatedButton.icon(
      icon: Image.asset(
        'assets/images/google_logo.png',
        height: 22.0, 
        errorBuilder: (context, error, stackTrace) {
       
          return const Icon(Icons.login, color: Colors.black54);
        },
      ),
      label: const Text(
        'Continuar con Google',
     
        style: TextStyle(
          color: Color(0xFF1F1F1F), 
          fontWeight: FontWeight.w500, 
          fontSize: 16,
        ),
      ),
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
      
        backgroundColor: Colors.white,
        foregroundColor: Colors.blue, 
        elevation: 1,

       
        side: const BorderSide(color: Color(0xFF747775)),

        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12), 
        ),
        
      
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16), 
        
        minimumSize: const Size(double.infinity, 50), 
      ),
    );
  }
}