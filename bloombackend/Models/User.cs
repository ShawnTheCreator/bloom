using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace bloombackend.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;
        
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        
        public UserProfile Profile { get; set; } = new();
        public UserLocation Location { get; set; } = new();
        public UserStats Stats { get; set; } = new();
        public UserSubscription Subscription { get; set; } = new();
        public UserPreferences Preferences { get; set; } = new();
        
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class UserProfile
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public string? Bio { get; set; }
        public string? Phone { get; set; }
    }

    public class UserLocation
    {
        public string Type { get; set; } = "Point";
        public double[] Coordinates { get; set; } = new double[2];
        public string Address { get; set; } = string.Empty;
        public string? Neighborhood { get; set; }
    }

    public class UserStats
    {
        public decimal TotalSaved { get; set; }
        public int ItemsSold { get; set; }
        public int ItemsBought { get; set; }
        public double Co2SavedKg { get; set; }
        public int Reputation { get; set; } = 100;
    }

    public class UserSubscription
    {
        public bool IsMamaPro { get; set; }
        public string Plan { get; set; } = "free";
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime? ExpiresAt { get; set; }
        public string? RevenueCatId { get; set; }
    }

    public class UserPreferences
    {
        public bool Notifications { get; set; } = true;
        public bool LocationSharing { get; set; }
        public string? FcmToken { get; set; }
        public List<string> PreferredCategories { get; set; } = new();
    }
}
