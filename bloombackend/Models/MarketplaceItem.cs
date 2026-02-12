using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace bloombackend.Models
{
    public class MarketplaceItem
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;
        
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Condition { get; set; } = "good"; // new, like-new, good, fair, poor
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public List<string> Images { get; set; } = new();
        
        public ItemSeller Seller { get; set; } = new();
        public ItemLocation Location { get; set; } = new();
        
        public GroupBuy? GroupBuy { get; set; }
        public SustainabilityImpact Sustainability { get; set; } = new();
        
        public string Status { get; set; } = "active"; // active, sold, reserved, inactive
        public int Views { get; set; }
        public int Likes { get; set; }
        
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class ItemSeller
    {
        [BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public double Rating { get; set; } = 5;
        public string? Location { get; set; }
    }

    public class ItemLocation
    {
        public string Type { get; set; } = "Point";
        public double[] Coordinates { get; set; } = new double[2]; // [longitude, latitude]
        public string Address { get; set; } = string.Empty;
    }

    public class GroupBuy
    {
        public bool Enabled { get; set; }
        public int MaxParticipants { get; set; } = 5;
        public int CurrentParticipants { get; set; }
        public int DiscountPercent { get; set; } = 10;
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime? EndTime { get; set; }
        public List<GroupBuyParticipant> Participants { get; set; } = new();
    }

    public class GroupBuyParticipant
    {
        [BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    }

    public class SustainabilityImpact
    {
        public double Co2SavedKg { get; set; }
        public double WasteDivertedKg { get; set; }
    }
}
