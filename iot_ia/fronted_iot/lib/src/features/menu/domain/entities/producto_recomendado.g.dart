// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'producto_recomendado.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ProductoRecomendado _$ProductoRecomendadoFromJson(Map<String, dynamic> json) =>
    ProductoRecomendado(
      idProducto: (json['id_producto'] as num).toInt(),
      nombre: json['nombre'] as String,
      categoria: json['categoria'] as String,
      precio: (json['precio'] as num).toInt(),
      imagen: json['imagen'] as String,
      scoreIa: (json['score_ia'] as num).toDouble(),
    );

Map<String, dynamic> _$ProductoRecomendadoToJson(
  ProductoRecomendado instance,
) => <String, dynamic>{
  'id_producto': instance.idProducto,
  'nombre': instance.nombre,
  'categoria': instance.categoria,
  'precio': instance.precio,
  'imagen': instance.imagen,
  'score_ia': instance.scoreIa,
};
