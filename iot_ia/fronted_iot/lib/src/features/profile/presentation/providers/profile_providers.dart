
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:fronted_iot/src/features/auth/presentation/providers/auth_providers.dart';

part 'profile_providers.g.dart';


@riverpod
Future<Map<String, dynamic>> profileDetail(ProfileDetailRef ref) async {
  final authRepository = ref.watch(authRepositoryProvider);
  return authRepository.getMe();
}