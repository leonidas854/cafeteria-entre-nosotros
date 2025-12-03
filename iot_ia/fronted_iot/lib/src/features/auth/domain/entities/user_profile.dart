import 'package:equatable/equatable.dart';

class UserProfile extends Equatable {
  final String? name;
  final String? email;
  final num saldo; 

  const UserProfile({this.name, this.email, required this.saldo});

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      name: json['name'],
      email: json['email'],
      saldo: json['saldo'] ?? 0,
    );
  }
  
  @override
  List<Object?> get props => [name, email, saldo];
}