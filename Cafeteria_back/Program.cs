using Cafeteria_back.Repositorio;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Cafeteria_back.Custom;
using Cafeteria_back.Entities.Usuarios;
using Cafeteria_back.Repositories.Implementations;
using Cafeteria_back.Repositories.Interfaces;
using Cafeteria_back.Data;
using Cafeteria_back.Entities.Carritos;


var builder = WebApplication.CreateBuilder(args);

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

//jwt
builder.Services.AddSingleton<Utilidades>();
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
builder.Services.AddSingleton<CarritoService>();


//habilitar cors
builder.Services.AddCors(options =>
{
    options.AddPolicy("NewPolicy", app =>
    {
        app.WithOrigins("http://localhost:3000", "http://localhost:3001") 
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

app.UseCors("NewPolicy");
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
