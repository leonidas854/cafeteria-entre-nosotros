# Cafeteria Backend - Documentación de Arquitectura

Bienvenido al repositorio del backend de "Cafeteria Entre Nosotros". Este proyecto ha sido refactorizado para seguir una arquitectura limpia (N-Capas) y hacer que sea más fácil de mantener, escalar y entender para los nuevos desarrolladores.

## Estructura del Proyecto

El proyecto está dividido en las siguientes carpetas principales:

- **Controllers**: Contienen los endpoints de la API. Su única responsabilidad es recibir la petición HTTP, validar (opcionalmente) y llamar al Servicio correspondiente. **Nunca deben inyectar directamente `MiDbContext` ni tener lógica de negocio.**
- **Services**: Contienen toda la lógica de negocio. Tienen una subcarpeta `Interfaces` y otra `Implementations`. Aquí es donde se realizan cálculos, se aplican promociones, y se orquestan las llamadas a la base de datos a través de los Repositorios.
- **Repositories**: Contienen la lógica de acceso a datos. Es la única capa que interactúa directamente con `MiDbContext` (Entity Framework) o con MongoDB.
- **DTOs (Data Transfer Objects)**: Modelos de datos que se usan para enviar y recibir información entre el frontend y el backend. Ayudan a no exponer las Entidades de la base de datos directamente, enviando solo lo necesario.
- **Mappings**: Contiene `MappingProfile.cs` (AutoMapper) para configurar cómo se traduce automáticamente una Entidad a un DTO y viceversa.
- **Entities**: Clases que representan las tablas en la base de datos.
- **Exceptions & Middlewares**: Contienen el `GlobalExceptionMiddleware`, el cual atrapa cualquier error en la aplicación (como `NotFoundException` o `UnauthorizedException`) y devuelve un JSON limpio al frontend sin necesidad de escribir múltiples bloques `try/catch` en cada controlador.

---

## ¿Cómo añadir un nuevo Endpoint / Funcionalidad?

Si necesitas agregar una nueva funcionalidad, sigue este flujo:

1. **Crea tus DTOs**: Si recibes o devuelves datos nuevos, crea un DTO en la carpeta `DTOs/`.
2. **Añade la firma al Servicio**: Ve a `Services/Interfaces/ITuServicio.cs` y añade el nuevo método.
3. **Implementa la lógica**: Ve a `Services/Implementations/TuServicio.cs` y escribe la lógica. Si necesitas datos, inyecta y llama a un Repositorio (o a `MiDbContext` si aún estás en transición de migrar todos los repositorios).
4. **Agrega el Endpoint**: Ve a `Controllers/TuController.cs`, crea tu `[HttpGet]`, `[HttpPost]`, etc., y llama al método que acabas de crear en tu servicio.
5. **AutoMapper (Opcional)**: Si necesitas mapear un DTO a tu Entidad, agrégalo a `Mappings/MappingProfile.cs` (`CreateMap<Entidad, DTO>().ReverseMap();`).

---

## Manejo de Autenticación y Errores

### Tokens (ICurrentUserService)
Si necesitas saber quién hizo la petición (ID o Rol del usuario), no leas los claims manualmente en el controlador. Inyecta `ICurrentUserService` en tu controlador o servicio:

```csharp
var usuarioId = _currentUserService.GetUserId();
var rol = _currentUserService.GetUserRole();
```

### Manejo de Errores
¡No uses `try/catch` para devolver errores HTTP! Si un recurso no se encuentra o el usuario no tiene permisos, simplemente arroja la excepción personalizada correspondiente desde tu Servicio o Controlador:

```csharp
if (producto == null) {
    throw new NotFoundException("El producto no existe.");
}
```

El `GlobalExceptionMiddleware` automáticamente atrapará esta excepción y devolverá al cliente un código HTTP `404 Not Found` en formato JSON.

---

## Tecnologías Principales

- **.NET 9.0** (C#)
- **Entity Framework Core** (con PostgreSQL)
- **MongoDB.Driver** (Para el carrito de compras)
- **AutoMapper** (Para mapeos DTO <-> Entidad)
- **Autenticación JWT**
