using DotNetEnv;
using bloombackend.Data;
using bloombackend.Services;
using bloombackend.Settings;
using bloombackend.Models;

// Load .env file for local development
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Create MongoDB Settings directly
var mongoSettings = new MongoDbSettings
{
    ConnectionString = Environment.GetEnvironmentVariable("MONGODB_URI") 
        ?? builder.Configuration.GetConnectionString("MongoDb")
        ?? "mongodb://localhost:27017/Bloom",
    
    DatabaseName = Environment.GetEnvironmentVariable("MONGODB_DB_NAME")
        ?? builder.Configuration.GetValue<string>("MongoDb:DatabaseName") 
        ?? "Bloom"
};

// Register as singleton
builder.Services.AddSingleton(mongoSettings);

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

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

// Seed demo data endpoint
app.MapPost("/api/seed", async (MongoDbService mongo) =>
{
    var demoUserId = "65d1234567890abcdef12345";
    
    // Check if demo user exists
    var existing = await mongo.GetUserByIdAsync(demoUserId);
    if (existing != null)
        return Results.Ok(new { message = "Demo user already exists" });
    
    // Create demo user
    var demoUser = new User
    {
        Id = demoUserId,
        Username = "sarah_bloom",
        Email = "sarah@bloom.com",
        Profile = new UserProfile
        {
            FirstName = "Sarah",
            LastName = "Johnson",
            Avatar = "https://bloom-images.s3.amazonaws.com/avatars/sarah.jpg",
            Bio = "Passionate about sustainable living",
            Location = "Portland, OR"
        },
        Stats = new UserStats
        {
            TotalSaved = 2847,
            ItemsSold = 43,
            ItemsBought = 12,
            Co2SavedKg = 156,
            Reputation = 85
        },
        Subscription = new UserSubscription
        {
            IsMamaPro = false,
            Plan = "free"
        }
    };
    
    await mongo.CreateUserAsync(demoUser);
    
    // Create sample transaction
    var transaction = new Transaction
    {
        UserId = demoUserId,
        Type = "sale",
        Amount = 85,
        Description = "Sold Kitchen Mixer",
        Date = DateTime.UtcNow.AddHours(-2),
        Status = "completed"
    };
    await mongo.CreateTransactionAsync(transaction);
    
    return Results.Ok(new { message = "Demo data seeded successfully" });
});

app.Run();
