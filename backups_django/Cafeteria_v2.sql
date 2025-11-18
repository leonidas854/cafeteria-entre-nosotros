/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.0.2-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: Cafeteria_DB
-- ------------------------------------------------------
-- Server version	12.0.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `Admin_bebida`
--

DROP TABLE IF EXISTS `Admin_bebida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Admin_bebida` (
  `producto_id` bigint(20) NOT NULL,
  `tamanio` varchar(100) NOT NULL,
  PRIMARY KEY (`producto_id`),
  CONSTRAINT `Admin_bebida_producto_id_d5317f1f_fk_Admin_producto_id` FOREIGN KEY (`producto_id`) REFERENCES `Admin_producto` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Admin_bebida`
--

LOCK TABLES `Admin_bebida` WRITE;
/*!40000 ALTER TABLE `Admin_bebida` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `Admin_bebida` VALUES
(7,'S/D'),
(8,'Mediano,media'),
(9,'Grande'),
(10,'Mediano,media'),
(11,'Grande,grande'),
(12,'Mediano'),
(13,'Grande'),
(14,'Mediano'),
(15,'Grande'),
(16,'Mediano'),
(17,'Grande'),
(18,'Mediano'),
(19,'Grande'),
(20,'Mediano'),
(21,'Grande'),
(22,'Mediano'),
(23,'Grande'),
(24,'Mediano'),
(25,'Grande'),
(26,'Mediano'),
(27,'Grande'),
(28,'Mediano'),
(29,'Grande'),
(30,'Mediano'),
(31,'Grande'),
(32,'Mediano'),
(33,'Grande'),
(34,'Mediano'),
(35,'Grande'),
(36,'Mediano'),
(37,'Grande'),
(38,'Mediano'),
(39,'Grande'),
(40,'Mediano'),
(41,'Grande'),
(42,'Mediano'),
(43,'Grande'),
(44,'Mediano'),
(45,'Grande'),
(46,'Mediano'),
(47,'Grande'),
(48,'Mediano'),
(49,'Grande'),
(50,'S/D');
/*!40000 ALTER TABLE `Admin_bebida` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `Admin_cliente`
--

DROP TABLE IF EXISTS `Admin_cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Admin_cliente` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ubicacion` varchar(100) NOT NULL,
  `apell_materno` varchar(100) NOT NULL,
  `telefono` int(11) NOT NULL,
  `nit` int(11) NOT NULL,
  `latitud` double NOT NULL,
  `longitud` double NOT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `Admin_cliente_user_id_9237816d_fk_Admin_usuariobase_id` FOREIGN KEY (`user_id`) REFERENCES `Admin_usuariobase` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Admin_cliente`
--

LOCK TABLES `Admin_cliente` WRITE;
/*!40000 ALTER TABLE `Admin_cliente` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `Admin_cliente` VALUES
(1,'No se encontraron resultados para la ubicación proporcionada.','string',2147483647,2147483647,0,0,1);
/*!40000 ALTER TABLE `Admin_cliente` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `Admin_comida`
--

DROP TABLE IF EXISTS `Admin_comida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Admin_comida` (
  `producto_id` bigint(20) NOT NULL,
  `proporcion` varchar(100) NOT NULL,
  PRIMARY KEY (`producto_id`),
  CONSTRAINT `Admin_comida_producto_id_12fdd38b_fk_Admin_producto_id` FOREIGN KEY (`producto_id`) REFERENCES `Admin_producto` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Admin_comida`
--

LOCK TABLES `Admin_comida` WRITE;
/*!40000 ALTER TABLE `Admin_comida` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `Admin_comida` VALUES
(51,'Porcion'),
(52,'Entero'),
(53,'Porcion'),
(54,'Entero'),
(55,'Porcion'),
(56,'Entero'),
(57,'Porcion'),
(58,'Entero'),
(59,'Porcion'),
(60,'Entero'),
(61,'1 unidad'),
(62,'6 unidades'),
(64,'entero');
/*!40000 ALTER TABLE `Admin_comida` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `Admin_pedido`
--

DROP TABLE IF EXISTS `Admin_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Admin_pedido` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `total_estimado` double NOT NULL,
  `total_descuento` double NOT NULL,
  `tipo_entrega` varchar(100) NOT NULL,
  `estado` varchar(100) NOT NULL,
  `cliente_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Admin_pedido_cliente_id_4e6f1cff_fk_Admin_cliente_id` (`cliente_id`),
  CONSTRAINT `Admin_pedido_cliente_id_4e6f1cff_fk_Admin_cliente_id` FOREIGN KEY (`cliente_id`) REFERENCES `Admin_cliente` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Admin_pedido`
--

LOCK TABLES `Admin_pedido` WRITE;
/*!40000 ALTER TABLE `Admin_pedido` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `Admin_pedido` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `Admin_producto`
--

DROP TABLE IF EXISTS `Admin_producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Admin_producto` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `precio` double NOT NULL,
  `tipo` varchar(100) NOT NULL,
  `estado` tinyint(1) NOT NULL,
  `categoria` varchar(100) NOT NULL,
  `subcategoria` varchar(100) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `sabores` varchar(100) NOT NULL,
  `imagen_url` varchar(100) NOT NULL,
  `imagen` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Admin_producto`
--

LOCK TABLES `Admin_producto` WRITE;
/*!40000 ALTER TABLE `Admin_producto` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `Admin_producto` VALUES
(7,'Mezcla de la casa',60,'bebida',1,'Café en grano','S/D','Un café en grano especial que usamos para preparar todas nuestras bebidas: americano, espresso, capp','S/D','/imagenes/5d20704b-b147-44f6-8221-a4a1c57fa493.jpg',NULL),
(8,'Espresso Simple (M)',9,'bebida',1,'Bebidas calientes con café','Espresso','Con un sabor y aroma fuerte. Ideal para quienes prefieren una experiencia de café pura y rápida.','S/D','/imagenes/c882ecd0-0cbe-4939-aa29-2fb81ba9f4dd.jpg',NULL),
(9,'Espresso Simple (G)',12,'bebida',1,'Bebidas calientes con café','Espresso','Con un sabor intenso y aroma fuerte. Ideal para quienes prefieren una experiencia de café pura y ráp','S/D','/imagenes/9133ca6f-44e4-4f53-966b-4d4dbc6d9305.jpg',NULL),
(10,'Espresso Doble (M)',13,'bebida',1,'Bebidas calientes con café','Espresso','Dos shots de café para quienes disfrutan un sabor fuerte y energizante.','S/D','/imagenes/9e750308-8cc5-4aba-a238-1b4dc3edb281.jpg',NULL),
(11,'Espresso Doble (G)',17,'bebida',1,'Bebidas calientes con café','Espresso','Dos shots de café concentrado para quienes disfrutan un sabor fuerte y energizante.','S/D','/imagenes/49e8978b-3077-4b49-b426-7c97bae0b44a.jpg',NULL),
(12,'Espresso Macchiato (M)',15,'bebida',1,'Bebidas calientes con café','Espresso','Un espresso con un toque de leche espumada. Mantiene el sabor fuerte del café con una ligera suavida','S/D','/imagenes/fc4315e5-3e68-4968-8790-5ef9f9bb98d4.jpg',NULL),
(13,'Espresso Macchiato (G)',19,'bebida',1,'Bebidas calientes con café','Espresso','Un espresso con un toque de leche espumada. Mantiene el sabor fuerte del café con una ligera suavida','S/D','/imagenes/30bf2f02-008b-4c03-9711-1fcc32d90bab.jpg',NULL),
(14,'Espresso Dolce (M)',17,'bebida',1,'Bebidas calientes con café','Espresso','Un espresso suave y dulce, ideal para quienes prefieren un sabor menos amargo. Perfecto balance entr','S/D','/imagenes/793b27c3-5196-4bd3-9104-8719cf01161d.jpg',NULL),
(15,'Espresso Dolce (G)',21,'bebida',1,'Bebidas calientes con café','Espresso','Un espresso suave y dulce, ideal para quienes prefieren un sabor menos amargo. Perfecto balance entr','S/D','/imagenes/e7b9eaf9-042b-4b3c-9e85-66c23d0825ad.jpg',NULL),
(16,'Americano Regular (M)',19,'bebida',1,'Bebidas calientes con café','Americano','Café suave y ligero, preparado con café filtrado. Perfecto para quienes disfrutan una taza más larga','S/D','/imagenes/c9023dd7-f584-4e6a-a9e1-9dc8df4aa75f.jpg',NULL),
(17,'Americano Regular (G)',22,'bebida',1,'Bebidas calientes con café','Americano','Café suave y ligero, preparado con café filtrado. Perfecto para quienes disfrutan una taza más larga','S/D','/imagenes/c4de2c05-76a2-4ffa-9e33-64f16cafe75d.jpg',NULL),
(18,'Americano Macchiato (M)',21,'bebida',1,'Bebidas calientes con café','Americano','Café americano con un toque de leche espumada. Combina la suavidad del americano con una capa ligera','S/D','/imagenes/42db3889-00a9-498f-9787-e54facd827d4.png',NULL),
(19,'Americano Macchiato (G)',24,'bebida',1,'Bebidas calientes con café','Americano','Café americano con un toque de leche espumada. Combina la suavidad del americano con una capa ligera','S/D','/imagenes/6fc1ab8b-ed28-4135-843b-8048ea9fe5e4.png',NULL),
(20,'Capucchino (M)',23,'bebida',1,'Bebidas calientes con café','S/D','Clásica bebida italiana de café espresso con leche vaporizada y una suave capa de espuma, con un equ','Vainilla, Dulce de leche, Caramelo, Canela, Chocolate Blanco.','/imagenes/327ff9d4-5d3d-467a-9d87-d1c186792e76.jpg',NULL),
(21,'Capucchino (G)',26,'bebida',1,'Bebidas calientes con café','S/D','Clásica bebida italiana de café espresso con leche vaporizada y una suave capa de espuma, con un equ','Vainilla, Dulce de leche, Caramelo, Canela, Chocolate Blanco.','/imagenes/b62d155b-5cda-4241-b677-606b04a71adb.jpg',NULL),
(22,'Mokaccino Regular (M)',25,'bebida',1,'Bebidas calientes con café','Mokaccino','Deliciosa combinación de café, leche vaporizada y chocolate. Cremoso y dulce, ideal para los amantes','S/D','/imagenes/aace92f5-c9a6-49b7-9e31-503e4cd02665.jpg',NULL),
(23,'Mokaccino Regular (G)',28,'bebida',1,'Bebidas calientes con café','Mokaccino','Deliciosa combinación de café, leche vaporizada y chocolate. Cremoso y dulce, ideal para los amantes','S/D','/imagenes/1f281248-f9f0-49d5-8d38-c6f59f699524.jpg',NULL),
(24,'Mokaccino con menta (M)',25,'bebida',1,'Bebidas calientes con café','Mokaccino','Café con leche y chocolate, combinado con un toque refrescante de menta. Una mezcla dulce, cremosa y','S/D','/imagenes/bc977697-d7c8-4f45-bf54-dacd4f406eb5.jpg',NULL),
(25,'Mokaccino con menta (G)',28,'bebida',1,'Bebidas calientes con café','Mokaccino','Café con leche y chocolate, combinado con un toque refrescante de menta. Una mezcla dulce, cremosa y','S/D','/imagenes/c4a31abc-1815-463e-a36f-7660865b79df.jpg',NULL),
(26,'Chocolate (M)',23,'bebida',1,'Bebidas calientes con café','S/D','Bebida cremosa y reconfortante, elaborada con leche y cacao, perfecta para disfrutar en cualquier mo','S/D','/imagenes/4035aee2-1c70-479c-834f-26bc4d977f43.png',NULL),
(27,'Chocolate (G)',26,'bebida',1,'Bebidas calientes con café','S/D','Bebida cremosa y reconfortante, elaborada con leche y cacao, perfecta para disfrutar en cualquier mo','S/D','/imagenes/1589500f-5cd5-4496-b57c-091786e1e871.png',NULL),
(28,'Chai Latte (M)',24,'bebida',1,'Bebidas calientes sin café','té','Infusión de té negro con especias aromáticas y leche caliente, con un sabor dulce y ligeramente pica','S/D','/imagenes/70bbfe56-9b6b-40a6-9d28-9d38fbde0845.jpg',NULL),
(29,'Chai Latte (G)',27,'bebida',1,'Bebidas calientes sin café','té','Infusión de té negro con especias aromáticas y leche caliente, con un sabor dulce y ligeramente pica','S/D','/imagenes/1f51417f-5e77-44f7-b05a-98f0d7dc67e8.jpg',NULL),
(30,'Té Simple (M)',18,'bebida',1,'Bebidas calientes sin café','té','Bebida caliente y ligera, preparada con hojas naturales','S/D','/imagenes/5bd135a0-074c-437f-ac1e-fec74c0b5497.jpg',NULL),
(31,'Té Simple (G)',21,'bebida',1,'Bebidas calientes sin café','té','Bebida caliente y ligera, preparada con hojas naturales','S/D','/imagenes/eda885e3-94c5-4a4d-ac5f-7c98bf53c60e.jpg',NULL),
(32,'Frappe Capuccino (M)',24,'bebida',1,'Bebidas Frias con Café','S/D','Café frío batido con leche y hielo, con un toque de sabor a capuccino y una textura cremosa y refres','Regular, vainilla, Dulce de leche, Oreo, mokkaccino, mokkacino con menta, chocolate blanco.','/imagenes/3fb61376-366f-4ad1-b581-2dff16dfe696.jpg',NULL),
(33,'Frappe Capuccino (G)',27,'bebida',1,'Bebidas Frias con Café','S/D','Café frío batido con leche y hielo, con un toque de sabor a capuccino y una textura cremosa y refres','Regular, vainilla, Dulce de leche, Oreo, mokkaccino, mokkacino con menta, chocolate blanco.','/imagenes/7749f7ee-c90b-4a52-a7e7-bcc9733b443b.jpg',NULL),
(34,'Latte Ice (M)',24,'bebida',1,'Bebidas Frias con Café','S/D','Café espresso con leche fría y hielo, suave y refrescante, ideal para los días calurosos.','S/D','/imagenes/23a861a6-fea9-41ce-a701-99d6d0674c21.jpg',NULL),
(35,'Latte Ice (G)',27,'bebida',1,'Bebidas Frias con Café','S/D','Café espresso con leche fría y hielo, suave y refrescante, ideal para los días calurosos.','S/D','/imagenes/9528c487-cf73-4b79-9aa6-1fdab89dc8f9.jpg',NULL),
(36,'Vienessa Affogato (M)',26,'bebida',1,'Bebidas Frias con Café','S/D','Postre italiano que combina una bola de helado de vainilla con un shot de café espresso caliente, cr','S/D','/imagenes/e0f00098-923d-4086-86e8-e0b204f2bc67.jpg',NULL),
(37,'Vienessa Affogato (G)',30,'bebida',1,'Bebidas Frias con Café','S/D','Postre italiano que combina una bola de helado de vainilla con un shot de café espresso caliente, cr','S/D','/imagenes/a8d1e4f1-0d97-458c-b9bf-b4a7de24c514.jpg',NULL),
(38,'Café Ice (M)',22,'bebida',1,'Bebidas Frias con Café','S/D','Café enfriado servido con hielo, de sabor intenso y refrescante, perfecto para disfrutar en cualquie','S/D','/imagenes/f3b5b0b8-0dde-4faa-9879-c2e0ac5f0afa.png',NULL),
(39,'Café Ice (G)',26,'bebida',1,'Bebidas Frias con Café','S/D','Café enfriado servido con hielo, de sabor intenso y refrescante, perfecto para disfrutar en cualquie','S/D','/imagenes/82867cf2-3f97-4dec-9060-98e86ecbde13.png',NULL),
(40,'Te Ice (M)',23,'bebida',1,'Tes Fríos','S/D','Bebida refrescante elaborada con té natural y servida con hielo','S/D','/imagenes/95b63e9d-e6ef-421d-92b8-ce5f0cb3c1ad.png',NULL),
(41,'Te Ice (G)',27,'bebida',1,'Tes Fríos','S/D','Bebida refrescante elaborada con té natural y servida con hielo','S/D','/imagenes/56e57c11-8727-4971-988e-61a3edf7af80.png',NULL),
(42,'Te Frappe (M)',24,'bebida',1,'Tes Fríos','S/D','Té batido con hielo, suave y espumoso, perfecto para refrescarte con un toque ligero y delicioso..','S/D','/imagenes/b6591bac-3167-426c-b122-376cdc9f8cc6.jpg',NULL),
(43,'Te Frappe (G)',28,'bebida',1,'Tes Fríos','S/D','Té batido con hielo, suave y espumoso, perfecto para refrescarte con un toque ligero y delicioso..','S/D','/imagenes/aa4b323e-126d-4d84-bf86-ccfa74ccdf61.jpg',NULL),
(44,'Jugos (M)',22,'bebida',1,'Bebidas Con Frutas','S/D','Refrescante bebida elaborada con frutas frescas','Piña,Limon,Sandia,Frutilla,Mango,Durazno,Copoazu,Maracuya,Frambuesa y Achachairu','/imagenes/2169fff8-7718-4c83-bbe2-ee6583f73f7f.jpg',NULL),
(45,'Jugos (G)',25,'bebida',1,'Bebidas Con Frutas','S/D','Refrescante bebida elaborada con frutas frescas','Piña,Limon,Sandia,Frutilla,Mango,Durazno,Copoazu,Maracuya,Frambuesa y Achachairu','/imagenes/6af8ab89-413a-4a44-9f1a-13ae1f177b55.jpg',NULL),
(46,'Milkshake (M)',25,'bebida',1,'Bebidas Con Frutas','S/D','Refrescante bebida elaborada con frutas frescas y leche','Piña,Limon,Sandia,Frutilla,Mango,Durazno,Copoazu,Maracuya,Frambuesa y Achachairu','/imagenes/6be14fbf-8497-4db0-8af6-7b67d61cee7b.jpg',NULL),
(47,'Milkshake (G)',29,'bebida',1,'Bebidas Con Frutas','S/D','Refrescante bebida elaborada con frutas frescas y leche','Piña,Limon,Sandia,Frutilla,Mango,Durazno,Copoazu,Maracuya,Frambuesa y Achachairu','/imagenes/9a53428c-23d4-4a74-8931-d83da550578f.jpg',NULL),
(48,'Smoothie Yogurt (M)',25,'bebida',1,'Bebidas Con Frutas','S/D','Bebida cremosa y refrescante hecha con frutas naturales y hielo','Piña,Limon,Sandia,Frutilla,Mango,Durazno,Copoazu,Maracuya,Frambuesa y Achachairu','/imagenes/d386d285-2d27-4ea5-94c6-1eb779c9d2da.jpg',NULL),
(49,'Smoothie Yogurt (G)',29,'bebida',1,'Bebidas Con Frutas','S/D','Bebida cremosa y refrescante hecha con frutas naturales y hielo','Piña,Limon,Sandia,Frutilla,Mango,Durazno,Copoazu,Maracuya,Frambuesa y Achachairu','/imagenes/87bfdf7d-d6dc-4137-b009-a2f9378431f7.jpg',NULL),
(50,'Yogurt Musli',22,'bebida',1,'Bebidas Con Frutas','S/D','Yogurt cremoso acompañado de muesli crujiente y un toque de miel natural','S/D','/imagenes/dc9caa11-e544-4c43-abc0-acf6f7321dd5.jpg',NULL),
(51,'Revuelto de huevos (P)',20,'comida',1,'Desayunos','S/D','Huevos batidos y cocinados a la perfección, servidos calientes y esponjosos, con tocino y tomate mas','S/D','/imagenes/2274a660-85e8-4433-bca3-2a90bfb02fb0.jpg',NULL),
(52,'Revuelto de huevos (E)',32,'comida',1,'Desayunos','S/D','Huevos batidos y cocinados a la perfección, servidos calientes y esponjosos, con tocino y tomate mas','S/D','/imagenes/9fab5733-7906-4965-b485-66b84ece1071.jpg',NULL),
(53,'Desayuno Italiano (P)',20,'comida',1,'Desayunos','S/D','Panini tostado relleno con ingredientes frescos, acompañado de un capuccino mas un jugo de frutas de','filete de pollo, Barbacoa y Mozzarella','/imagenes/c05826da-9d51-4d8c-b69d-08b6a6f51696.jpg',NULL),
(54,'Desayuno Italiano (E)',32,'comida',1,'Desayunos','S/D','Panini tostado relleno con ingredientes frescos, acompañado de un capuccino mas un jugo de frutas de','filete de pollo, Barbacoa y Mozzarella','/imagenes/7d6b8725-13e0-4236-a3a6-9c985e8856c0.jpg',NULL),
(55,'Pies (P)',24,'comida',1,'Reposteria','S/D','Delicioso postre con base crujiente y relleno suave de fruta','Limon, maracuyá, oreo, snickers, manzana y Entero mix','/imagenes/ea455ee8-cc49-48c4-b4af-04da0a13d718.jpg',NULL),
(56,'Pies (E)',180,'comida',1,'Reposteria','S/D','Delicioso postre con base crujiente y relleno suave de fruta','Limon, maracuyá, oreo, snickers, manzana y Entero mix','/imagenes/ba9cd221-02cf-4d17-9f95-c180d5aced8e.jpg',NULL),
(57,'Torta (P)',25,'comida',1,'Reposteria','S/D','Esponjoso y suave, cubierto con un delicioso glaseado o relleno','Chocolate, Capuccino, Selva negra, Tres leches y zanahoria','/imagenes/e4db1a92-fa0c-452b-822f-2100ad115fa8.jpg',NULL),
(58,'Torta (E)',187,'comida',1,'Reposteria','S/D','Esponjoso y suave, cubierto con un delicioso glaseado o relleno','Chocolate, Capuccino, Selva negra, Tres leches y zanahoria','/imagenes/546717ea-30f5-4342-bb6b-848ccb12fc0c.jpg',NULL),
(59,'Cheesecakes (P)',25,'comida',1,'Reposteria','S/D','Delicioso pastel cremoso a base de queso suave sobre una base crujiente de galleta','Berries, maracuyá, mango, oreo y Entero Mix','/imagenes/b4487e28-521f-43b8-9ef5-3c1523ec2856.jpg',NULL),
(60,'Cheesecakes (E)',187,'comida',1,'Reposteria','S/D','Delicioso pastel cremoso a base de queso suave sobre una base crujiente de galleta','Berries, maracuyá, mango, oreo y Entero Mix','/imagenes/723b57f6-5de2-4985-b8b7-a0401eff8e3b.jpg',NULL),
(61,'Galletas (P)',9,'comida',1,'Reposteria','S/D','Dulces y crujientes, hechas con ingredientes frescos.','Avena, chispas de chocolate y mixto','/imagenes/85dc3fcb-d0b7-488f-b7ef-4b61eab79611.jpg',NULL),
(62,'Galletas (E)',50,'comida',1,'Reposteria','S/D','Dulces y crujientes, hechas con ingredientes frescos.','Avena, chispas de chocolate y mixto','/imagenes/62c3acb4-2542-44e1-abbb-94d9fc8f7ba7.jpg',NULL),
(64,'Tiramisú (E)',20,'comida',1,'Reposteria','S/D','Postre en capas que consiste de cuatro ingredientes esenciales. Estos son café, mascarpone (queso it','S/D','/imagenes/32d705e3-f3ab-44da-ac2a-698503aab2c9.webp',NULL);
/*!40000 ALTER TABLE `Admin_producto` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `Admin_promocion`
--

DROP TABLE IF EXISTS `Admin_promocion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Admin_promocion` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `descuento` double NOT NULL,
  `fecha_ini` date NOT NULL,
  `fech_final` date NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Admin_promocion`
--

LOCK TABLES `Admin_promocion` WRITE;
/*!40000 ALTER TABLE `Admin_promocion` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `Admin_promocion` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `Admin_promocion_producto`
--

DROP TABLE IF EXISTS `Admin_promocion_producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Admin_promocion_producto` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `promocion_id` bigint(20) NOT NULL,
  `producto_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Admin_promocion_producto_promocion_id_producto_id_6ff06413_uniq` (`promocion_id`,`producto_id`),
  KEY `Admin_promocion_prod_producto_id_462700c0_fk_Admin_pro` (`producto_id`),
  CONSTRAINT `Admin_promocion_prod_producto_id_462700c0_fk_Admin_pro` FOREIGN KEY (`producto_id`) REFERENCES `Admin_producto` (`id`),
  CONSTRAINT `Admin_promocion_prod_promocion_id_90d79778_fk_Admin_pro` FOREIGN KEY (`promocion_id`) REFERENCES `Admin_promocion` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Admin_promocion_producto`
--

LOCK TABLES `Admin_promocion_producto` WRITE;
/*!40000 ALTER TABLE `Admin_promocion_producto` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `Admin_promocion_producto` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `Admin_usuariobase`
--

DROP TABLE IF EXISTS `Admin_usuariobase`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Admin_usuariobase` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `tipo` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Admin_usuariobase`
--

LOCK TABLES `Admin_usuariobase` WRITE;
/*!40000 ALTER TABLE `Admin_usuariobase` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `Admin_usuariobase` VALUES
(1,'pbkdf2_sha256$1000000$pZqUoDRfbiqoD9vTsXORxf$fiDUFJ4Ci+NLpYCL/RrVMJnHDUawf6ASi+V2+VT6SrU=','2025-11-18 19:45:44.943255',0,'string','','','user@example.com',0,1,'2025-11-18 19:41:49.248323','cliente');
/*!40000 ALTER TABLE `Admin_usuariobase` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `Admin_usuariobase_groups`
--

DROP TABLE IF EXISTS `Admin_usuariobase_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Admin_usuariobase_groups` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `usuariobase_id` bigint(20) NOT NULL,
  `group_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Admin_usuariobase_groups_usuariobase_id_group_id_731acaa2_uniq` (`usuariobase_id`,`group_id`),
  KEY `Admin_usuariobase_groups_group_id_f5468d8b_fk_auth_group_id` (`group_id`),
  CONSTRAINT `Admin_usuariobase_gr_usuariobase_id_fc143752_fk_Admin_usu` FOREIGN KEY (`usuariobase_id`) REFERENCES `Admin_usuariobase` (`id`),
  CONSTRAINT `Admin_usuariobase_groups_group_id_f5468d8b_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Admin_usuariobase_groups`
--

LOCK TABLES `Admin_usuariobase_groups` WRITE;
/*!40000 ALTER TABLE `Admin_usuariobase_groups` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `Admin_usuariobase_groups` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `Admin_usuariobase_user_permissions`
--

DROP TABLE IF EXISTS `Admin_usuariobase_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Admin_usuariobase_user_permissions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `usuariobase_id` bigint(20) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Admin_usuariobase_user_p_usuariobase_id_permissio_03729762_uniq` (`usuariobase_id`,`permission_id`),
  KEY `Admin_usuariobase_us_permission_id_a9016688_fk_auth_perm` (`permission_id`),
  CONSTRAINT `Admin_usuariobase_us_permission_id_a9016688_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `Admin_usuariobase_us_usuariobase_id_ec3783e3_fk_Admin_usu` FOREIGN KEY (`usuariobase_id`) REFERENCES `Admin_usuariobase` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Admin_usuariobase_user_permissions`
--

LOCK TABLES `Admin_usuariobase_user_permissions` WRITE;
/*!40000 ALTER TABLE `Admin_usuariobase_user_permissions` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `Admin_usuariobase_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `Caja_empleado`
--

DROP TABLE IF EXISTS `Caja_empleado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Caja_empleado` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `fecha_contratacion` date NOT NULL,
  `rol` varchar(100) NOT NULL,
  `telefono` int(11) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `Caja_empleado_user_id_e8ce3935_fk_Admin_usuariobase_id` FOREIGN KEY (`user_id`) REFERENCES `Admin_usuariobase` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Caja_empleado`
--

LOCK TABLES `Caja_empleado` WRITE;
/*!40000 ALTER TABLE `Caja_empleado` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `Caja_empleado` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `Caja_venta`
--

DROP TABLE IF EXISTS `Caja_venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Caja_venta` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `total` int(11) NOT NULL,
  `estado` varchar(100) NOT NULL,
  `tipo_de_pago` varchar(100) NOT NULL,
  `empleado_id` bigint(20) NOT NULL,
  `pedido_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pedido_id` (`pedido_id`),
  KEY `Caja_venta_empleado_id_07376053_fk_Caja_empleado_id` (`empleado_id`),
  CONSTRAINT `Caja_venta_empleado_id_07376053_fk_Caja_empleado_id` FOREIGN KEY (`empleado_id`) REFERENCES `Caja_empleado` (`id`),
  CONSTRAINT `Caja_venta_pedido_id_ae64cb6a_fk_Admin_pedido_id` FOREIGN KEY (`pedido_id`) REFERENCES `Admin_pedido` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Caja_venta`
--

LOCK TABLES `Caja_venta` WRITE;
/*!40000 ALTER TABLE `Caja_venta` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `Caja_venta` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `Cliente_detalle_pedido`
--

DROP TABLE IF EXISTS `Cliente_detalle_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Cliente_detalle_pedido` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` double NOT NULL,
  `pedido_id` bigint(20) DEFAULT NULL,
  `producto_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Cliente_detalle_pedido_pedido_id_41c7032a_fk_Admin_pedido_id` (`pedido_id`),
  KEY `Cliente_detalle_pedido_producto_id_196b62b7_fk_Admin_producto_id` (`producto_id`),
  CONSTRAINT `Cliente_detalle_pedido_pedido_id_41c7032a_fk_Admin_pedido_id` FOREIGN KEY (`pedido_id`) REFERENCES `Admin_pedido` (`id`),
  CONSTRAINT `Cliente_detalle_pedido_producto_id_196b62b7_fk_Admin_producto_id` FOREIGN KEY (`producto_id`) REFERENCES `Admin_producto` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Cliente_detalle_pedido`
--

LOCK TABLES `Cliente_detalle_pedido` WRITE;
/*!40000 ALTER TABLE `Cliente_detalle_pedido` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `Cliente_detalle_pedido` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `Cliente_extra`
--

DROP TABLE IF EXISTS `Cliente_extra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Cliente_extra` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `precio` double NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Cliente_extra`
--

LOCK TABLES `Cliente_extra` WRITE;
/*!40000 ALTER TABLE `Cliente_extra` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `Cliente_extra` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `Cliente_extra_detalle_pedido`
--

DROP TABLE IF EXISTS `Cliente_extra_detalle_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Cliente_extra_detalle_pedido` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `extra_id` bigint(20) NOT NULL,
  `detalle_pedido_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Cliente_extra_detalle_pe_extra_id_detalle_pedido__103f0001_uniq` (`extra_id`,`detalle_pedido_id`),
  KEY `Cliente_extra_detall_detalle_pedido_id_254035c3_fk_Cliente_d` (`detalle_pedido_id`),
  CONSTRAINT `Cliente_extra_detall_detalle_pedido_id_254035c3_fk_Cliente_d` FOREIGN KEY (`detalle_pedido_id`) REFERENCES `Cliente_detalle_pedido` (`id`),
  CONSTRAINT `Cliente_extra_detall_extra_id_f4e67d35_fk_Cliente_e` FOREIGN KEY (`extra_id`) REFERENCES `Cliente_extra` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Cliente_extra_detalle_pedido`
--

LOCK TABLES `Cliente_extra_detalle_pedido` WRITE;
/*!40000 ALTER TABLE `Cliente_extra_detalle_pedido` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `Cliente_extra_detalle_pedido` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `auth_permission` VALUES
(1,'Can add log entry',1,'add_logentry'),
(2,'Can change log entry',1,'change_logentry'),
(3,'Can delete log entry',1,'delete_logentry'),
(4,'Can view log entry',1,'view_logentry'),
(5,'Can add permission',2,'add_permission'),
(6,'Can change permission',2,'change_permission'),
(7,'Can delete permission',2,'delete_permission'),
(8,'Can view permission',2,'view_permission'),
(9,'Can add group',3,'add_group'),
(10,'Can change group',3,'change_group'),
(11,'Can delete group',3,'delete_group'),
(12,'Can view group',3,'view_group'),
(13,'Can add content type',4,'add_contenttype'),
(14,'Can change content type',4,'change_contenttype'),
(15,'Can delete content type',4,'delete_contenttype'),
(16,'Can view content type',4,'view_contenttype'),
(17,'Can add session',5,'add_session'),
(18,'Can change session',5,'change_session'),
(19,'Can delete session',5,'delete_session'),
(20,'Can view session',5,'view_session'),
(21,'Can add Token',6,'add_token'),
(22,'Can change Token',6,'change_token'),
(23,'Can delete Token',6,'delete_token'),
(24,'Can view Token',6,'view_token'),
(25,'Can add Token',7,'add_tokenproxy'),
(26,'Can change Token',7,'change_tokenproxy'),
(27,'Can delete Token',7,'delete_tokenproxy'),
(28,'Can view Token',7,'view_tokenproxy'),
(29,'Can add producto',8,'add_producto'),
(30,'Can change producto',8,'change_producto'),
(31,'Can delete producto',8,'delete_producto'),
(32,'Can view producto',8,'view_producto'),
(33,'Can add cliente',9,'add_cliente'),
(34,'Can change cliente',9,'change_cliente'),
(35,'Can delete cliente',9,'delete_cliente'),
(36,'Can view cliente',9,'view_cliente'),
(37,'Can add bebida',10,'add_bebida'),
(38,'Can change bebida',10,'change_bebida'),
(39,'Can delete bebida',10,'delete_bebida'),
(40,'Can view bebida',10,'view_bebida'),
(41,'Can add comida',11,'add_comida'),
(42,'Can change comida',11,'change_comida'),
(43,'Can delete comida',11,'delete_comida'),
(44,'Can view comida',11,'view_comida'),
(45,'Can add pedido',12,'add_pedido'),
(46,'Can change pedido',12,'change_pedido'),
(47,'Can delete pedido',12,'delete_pedido'),
(48,'Can view pedido',12,'view_pedido'),
(49,'Can add promocion',13,'add_promocion'),
(50,'Can change promocion',13,'change_promocion'),
(51,'Can delete promocion',13,'delete_promocion'),
(52,'Can view promocion',13,'view_promocion'),
(53,'Can add user',14,'add_usuariobase'),
(54,'Can change user',14,'change_usuariobase'),
(55,'Can delete user',14,'delete_usuariobase'),
(56,'Can view user',14,'view_usuariobase'),
(57,'Can add detalle_pedido',15,'add_detalle_pedido'),
(58,'Can change detalle_pedido',15,'change_detalle_pedido'),
(59,'Can delete detalle_pedido',15,'delete_detalle_pedido'),
(60,'Can view detalle_pedido',15,'view_detalle_pedido'),
(61,'Can add extra',16,'add_extra'),
(62,'Can change extra',16,'change_extra'),
(63,'Can delete extra',16,'delete_extra'),
(64,'Can view extra',16,'view_extra'),
(65,'Can add empleado',17,'add_empleado'),
(66,'Can change empleado',17,'change_empleado'),
(67,'Can delete empleado',17,'delete_empleado'),
(68,'Can view empleado',17,'view_empleado'),
(69,'Can add venta',18,'add_venta'),
(70,'Can change venta',18,'change_venta'),
(71,'Can delete venta',18,'delete_venta'),
(72,'Can view venta',18,'view_venta');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `authtoken_token`
--

DROP TABLE IF EXISTS `authtoken_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `authtoken_token` (
  `key` varchar(40) NOT NULL,
  `created` datetime(6) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `authtoken_token_user_id_35299eff_fk_Admin_usuariobase_id` FOREIGN KEY (`user_id`) REFERENCES `Admin_usuariobase` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authtoken_token`
--

LOCK TABLES `authtoken_token` WRITE;
/*!40000 ALTER TABLE `authtoken_token` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `authtoken_token` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext DEFAULT NULL,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint(5) unsigned NOT NULL CHECK (`action_flag` >= 0),
  `change_message` longtext NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_Admin_usuariobase_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_Admin_usuariobase_id` FOREIGN KEY (`user_id`) REFERENCES `Admin_usuariobase` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `django_content_type` VALUES
(10,'Admin','bebida'),
(9,'Admin','cliente'),
(11,'Admin','comida'),
(1,'admin','logentry'),
(12,'Admin','pedido'),
(8,'Admin','producto'),
(13,'Admin','promocion'),
(14,'Admin','usuariobase'),
(3,'auth','group'),
(2,'auth','permission'),
(6,'authtoken','token'),
(7,'authtoken','tokenproxy'),
(17,'Caja','empleado'),
(18,'Caja','venta'),
(15,'Cliente','detalle_pedido'),
(16,'Cliente','extra'),
(4,'contenttypes','contenttype'),
(5,'sessions','session');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `django_migrations` VALUES
(1,'contenttypes','0001_initial','2025-11-18 17:02:06.484562'),
(2,'contenttypes','0002_remove_content_type_name','2025-11-18 17:02:06.525357'),
(3,'auth','0001_initial','2025-11-18 17:02:06.649702'),
(4,'auth','0002_alter_permission_name_max_length','2025-11-18 17:02:06.668738'),
(5,'auth','0003_alter_user_email_max_length','2025-11-18 17:02:06.678782'),
(6,'auth','0004_alter_user_username_opts','2025-11-18 17:02:06.688901'),
(7,'auth','0005_alter_user_last_login_null','2025-11-18 17:02:06.695679'),
(8,'auth','0006_require_contenttypes_0002','2025-11-18 17:02:06.697607'),
(9,'auth','0007_alter_validators_add_error_messages','2025-11-18 17:02:06.709064'),
(10,'auth','0008_alter_user_username_max_length','2025-11-18 17:02:06.722101'),
(11,'auth','0009_alter_user_last_name_max_length','2025-11-18 17:02:06.733381'),
(12,'auth','0010_alter_group_name_max_length','2025-11-18 17:02:06.753426'),
(13,'auth','0011_update_proxy_permissions','2025-11-18 17:02:06.768181'),
(14,'auth','0012_alter_user_first_name_max_length','2025-11-18 17:02:06.780276'),
(15,'Admin','0001_initial','2025-11-18 17:02:07.120785'),
(16,'Admin','0002_producto_imagen','2025-11-18 17:02:07.135618'),
(17,'Caja','0001_initial','2025-11-18 17:02:07.248449'),
(18,'Cliente','0001_initial','2025-11-18 17:02:07.402438'),
(19,'admin','0001_initial','2025-11-18 17:02:07.474408'),
(20,'admin','0002_logentry_remove_auto_add','2025-11-18 17:02:07.487732'),
(21,'admin','0003_logentry_add_action_flag_choices','2025-11-18 17:02:07.509404'),
(22,'authtoken','0001_initial','2025-11-18 17:02:07.573197'),
(23,'authtoken','0002_auto_20160226_1747','2025-11-18 17:02:07.633786'),
(24,'authtoken','0003_tokenproxy','2025-11-18 17:02:07.637908'),
(25,'authtoken','0004_alter_tokenproxy_options','2025-11-18 17:02:07.644060'),
(26,'sessions','0001_initial','2025-11-18 17:02:07.671761');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-11-18 19:41:02
