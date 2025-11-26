

import 'package:flutter/foundation.dart'; 
import 'package:logger/logger.dart';


final logger = Logger(
  
  printer: PrettyPrinter(
    methodCount: 1, 
    errorMethodCount: 5, 
    lineLength: 90, 
    colors: true, 
    printEmojis: true, 
    dateTimeFormat:DateTimeFormat.dateAndTime 
  ),

  level: kDebugMode ? Level.debug : Level.off,
);