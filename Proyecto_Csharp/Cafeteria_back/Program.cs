using Cafeteria_back.Repositorio;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Cafeteria_back.Custom;
using Cafeteria_back.Entities.Usuarios;
using Cafeteria_back.Services.Interfaces;
using Cafeteria_back.Services.Implementations;
using Cafeteria_back.Repositories.Implementations;
using Cafeteria_back.Repositories.Interfaces;
using Cafeteria_back.Data;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configurar Serilog
builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/cafeteria-log-.txt", rollingInterval: RollingInterval.Day));

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


//conecion base de datos

var connecctionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<MiDbContext>(options =>
options.UseNpgsql(connecctionString));
//google maps
builder.Services.AddHttpClient<GoogleMapsApi>();
builder.Services.AddScoped<IGeolocalizador, GoogleMapsAdapter>();

// AutoMapper y HttpContextAccessor
builder.Services.AddAutoMapper(cfg => {
    cfg.AddProfile<Cafeteria_back.Mappings.MappingProfile>();
});
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<Cafeteria_back.Services.Interfaces.ICurrentUserService, Cafeteria_back.Services.Implementations.CurrentUserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUsuariosService, UsuariosService>();
builder.Services.AddScoped<IProductoService, ProductoService>();
builder.Services.AddScoped<IPedidoService, PedidoService>();
builder.Services.AddScoped<ICajeroService, CajeroService>();
builder.Services.AddScoped<IExtrasService, ExtrasService>();
builder.Services.AddScoped<IPromocionesService, PromocionesService>();
builder.Services.AddScoped<IAgregacionService, AgregacionService>();
builder.Services.AddScoped<IResenaService, ResenaService>();
builder.Services.AddScoped<IHomeService, HomeService>();

//jwt
builder.Services.AddSingleton<IUtilidades, Utilidades>();

builder.Services.AddAuthentication(config =>
{
    config.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    config.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(config =>
{
    config.RequireHttpsMetadata = false;
    config.SaveToken = true;
    config.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:key"]!))
    };

    config.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var token = context.Request.Cookies["jwt"];
            if (!string.IsNullOrEmpty(token))
            {
                context.Token = token;
            }

            return Task.CompletedTask;
        }
    };
});
//strategy
builder.Services.AddScoped<DescuentoStrategyContext>();


//mongodb
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));
builder.Services.AddScoped<ICarritoService, CarritoService>();




//habilitar cors
builder.Services.AddCors(options =>
{
    options.AddPolicy("NewPolicy", app =>
    {
        //app.AllowAnyOrigin()
       app.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://192.168.1.17:3000","http://192.168.1.17:8000") 
   .AllowAnyHeader()
   .AllowAnyMethod()
   .AllowCredentials();

    });
});
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseStaticFiles(); 

// Añadir Middleware de Excepciones Globales
app.UseMiddleware<Cafeteria_back.Middlewares.GlobalExceptionMiddleware>();

app.UseCors("NewPolicy");
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
