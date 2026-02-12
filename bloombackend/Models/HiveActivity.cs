using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace bloombackend.Models
{
    public class HiveActivity
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;
        
        public string Type { get; set; } = string.Empty; // community-event, group-buy, milestone, local-pickup, workshop
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        
        public ActivityOrganizer Organizer { get; set; } = new();
        public ActivityLocation Location { get; set; } = new();
        
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime StartTime { get; set; }
        
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime EndTime { get; set; }
        
        public int? MaxParticipants { get; set; }
        public int CurrentParticipants { get; set; }
        public List<ActivityParticipant> Participants { get; set; } = new();
        
        public string Category { get; set; } = string.Empty;
        public List<string> Images { get; set; } = new();
        public string Status { get; set; } = "upcoming"; // upcoming, live, completed, cancelled
        
        public SustainabilityMetrics? SustainabilityImpact { get; set; }
        
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class ActivityOrganizer
    {
        [BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string? Avatar { get; set; }
    }

    public class ActivityLocation
    {
        public string Type { get; set; } = "Point";
        public double[] Coordinates { get; set; } = new double[2];
        public string Address { get; set; } = string.Empty;
    }

    public class ActivityParticipant
    {
        [BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    }

    public class SustainabilityMetrics
    {
        public int? TreesPlanted { get; set; }
        public double? Co2SavedKg { get; set; }
    }
}
