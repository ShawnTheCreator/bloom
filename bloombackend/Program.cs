using DotNetEnv;
using bloombackend.Data;
using bloombackend.Services;
using bloombackend.Settings;

// Load .env file for local development
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Add MongoDB Settings
builder.Services.Configure<MongoDbSettings>(options =>
{
    // Priority: Environment Variable > .env file > appsettings.json > localhost fallback
    options.ConnectionString = Environment.GetEnvironmentVariable("MONGODB_URI") 
        ?? builder.Configuration.GetConnectionString("MongoDb")
        ?? "mongodb://localhost:27017/Bloom";
    
    options.DatabaseName = Environment.GetEnvironmentVariable("MONGODB_DB_NAME")
        ?? builder.Configuration.GetValue<string>("MongoDb:DatabaseName") 
        ?? "Bloom";
});

// Add MongoDB Context and Service
builder.Services.AddSingleton<MongoDbContext>();
builder.Services.AddScoped<MongoDbService>();

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Add CORS for React Native frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();
