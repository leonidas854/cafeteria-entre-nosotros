
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fronted_iot/src/core/storage/secure_storage.dart'; 
import 'package:fronted_iot/src/core/utils/logger.dart';


final dioProvider = Provider<Dio>((ref) {

  final baseUrl = dotenv.env['API_BASE_URL'] ?? 'http://locahost:5000/api';
  logger.i('API Base URL: $baseUrl'); 

  final dio = Dio(BaseOptions(
    
    baseUrl: baseUrl,
  ));
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      logger.d('REQUEST[${options.method}] => PATH: ${options.path}');
      

      final storage = ref.read(secureStorageProvider);
      final token = await storage.read(key: 'idToken');

      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      
      return handler.next(options);
    },
    onResponse: (response, handler) {
      logger.d('RESPONSE[${response.statusCode}] => DATA: ${response.data}');
      return handler.next(response);
    },
    onError: (DioException e, handler) {
      logger.e('ERROR[${e.response?.statusCode}] => MESSAGE: ${e.message}');
      return handler.next(e);
    },
  ));

  return dio;
});