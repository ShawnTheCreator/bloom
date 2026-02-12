using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace bloombackend.Models
{
    public class Grid
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;
        
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        
        public GridLocation Location { get; set; } = new();
        public List<GridItem> Items { get; set; } = new();
        public List<GridMember> Members { get; set; } = new();
        
        public GridStats Stats { get; set; } = new();
        public GridSettings Settings { get; set; } = new();
        
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class GridLocation
    {
        public string Type { get; set; } = "Point";
        public double[] Coordinates { get; set; } = new double[2];
        public string Address { get; set; } = string.Empty;
        public double Radius { get; set; } = 2000; // meters
    }

    public class GridItem
    {
        [BsonRepresentation(BsonType.ObjectId)]
        public string ItemId { get; set; } = string.Empty;
        [BsonRepresentation(BsonType.ObjectId)]
        public string SellerId { get; set; } = string.Empty;
        public string SellerName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string? Image { get; set; }
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    }

    public class GridMember
    {
        [BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
        public string Role { get; set; } = "member"; // member, admin
    }

    public class GridStats
    {
        public int TotalItems { get; set; }
        public decimal TotalSaved { get; set; }
        public int ActiveMembers { get; set; }
    }

    public class GridSettings
    {
        public bool IsPublic { get; set; } = true;
        public bool RequiresApproval { get; set; }
        public int? MaxMembers { get; set; }
    }
}
