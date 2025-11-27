import 'package:fronted_iot/src/features/menu/domain/entities/product.dart';
import 'package:fronted_iot/src/core/utils/logger.dart';

class FakeMenuRepository {
  final _products = const [
    Product(
      id: '1',
      name: 'Espresso Americano',
      description:
          'Intenso café espresso diluido con agua caliente, perfecto para despertar tus sentidos.',
      price: 12.50,
      imageUrl: 'images.jpg',
      category: 'Cafés Calientes',
    ),
    Product(
      id: '2',
      name: 'Latte Cremoso',
      description:
          'Un suave y reconfortante latte hecho con leche vaporizada y un toque de espuma.',
      price: 15.00,
      imageUrl: 'images2.jpg',
      category: 'Cafés Calientes',
    ),
    Product(
      id: '3',
      name: 'Frappé de Caramelo',
      description:
          'Una deliciosa y refrescante bebida helada con café, leche, hielo y un rico sirope de caramelo.',
      price: 20.00,
      imageUrl: 'images4.jpg',
      category: 'Bebidas Frías',
    ),
    Product(
      id: '4',
      name: 'Croissant de Almendras',
      description:
          'Hojaldre crujiente relleno de una suave crema de almendras y cubierto con almendras fileteadas.',
      price: 18.00,
      imageUrl: 'images3.jpg',
      category: 'Postres',
    ),
  ];

  Future<List<Product>> getProducts() async {
    await Future.delayed(const Duration(seconds: 1));
    return _products;
  }


  Future<Product> getProductById(String id) async {
    await Future.delayed(const Duration(milliseconds: 500));
    try {
    
      final product = _products.firstWhere((p) => p.id == id);
      return product;
    } catch (e) {
 
      logger.e('Producto no encontrado con ID: $id', error: e);
      throw Exception('No se pudo encontrar el producto solicitado.');
    }
  }
}
