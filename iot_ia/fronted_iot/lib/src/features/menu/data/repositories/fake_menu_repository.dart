import 'package:fronted_iot/src/features/menu/domain/entities/product.dart';


class FakeMenuRepository {
  final _products = const [
    Product(
      id: '1',
      name: 'Espresso Americano',
      description: 'Intenso café espresso diluido con agua caliente, perfecto para despertar tus sentidos.',
      price: 12.50,
      imageUrl: 'https://images.unsplash.com/photo-1511920183353-3c9c9b5a7a40', 
      category: 'Cafés Calientes',
    ),
    Product(
      id: '2',
      name: 'Latte Cremoso',
      description: 'Un suave y reconfortante latte hecho con leche vaporizada y un toque de espuma.',
      price: 15.00,
      imageUrl: 'https://images.unsplash.com/photo-1551782450-17144def4936',
      category: 'Cafés Calientes',
    ),
    Product(
      id: '3',
      name: 'Frappé de Caramelo',
      description: 'Una deliciosa y refrescante bebida helada con café, leche, hielo y un rico sirope de caramelo.',
      price: 20.00,
      imageUrl: 'https://images.unsplash.com/photo-1572498283344-4648719c8f65',
      category: 'Bebidas Frías',
    ),
    Product(
      id: '4',
      name: 'Croissant de Almendras',
      description: 'Hojaldre crujiente relleno de una suave crema de almendras y cubierto con almendras fileteadas.',
      price: 18.00,
      imageUrl: 'https://images.unsplash.com/photo-1627102100018-8736384a56a6',
      category: 'Postres',
    ),
  ];

  Future<List<Product>> getProducts() async {
    await Future.delayed(const Duration(seconds: 1)); 
    return _products;
  }

  Future<Product> getProductById(String id) async {
    await Future.delayed(const Duration(milliseconds: 500));
    return _products.firstWhere((p) => p.id == id);
  }
}