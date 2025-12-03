import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'producto_recomendado.g.dart';

@JsonSerializable()
class ProductoRecomendado extends Equatable {
  @JsonKey(name: 'id_producto')
  final int idProducto;
  final String nombre;
  final String categoria;
  final int precio;
  final String imagen;
  @JsonKey(name: 'score_ia')
  final double scoreIa;

  const ProductoRecomendado({
    required this.idProducto,
    required this.nombre,
    required this.categoria,
    required this.precio,
    required this.imagen,
    required this.scoreIa,
  });

  factory ProductoRecomendado.fromJson(Map<String, dynamic> json) => _$ProductoRecomendadoFromJson(json);
  Map<String, dynamic> toJson() => _$ProductoRecomendadoToJson(this);

  @override
  List<Object?> get props => [idProducto];
}