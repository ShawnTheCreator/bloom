using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace bloombackend.Models
{
    public class Scan
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;
        
        [BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; } = string.Empty;
        
        public string RawImage { get; set; } = string.Empty;
        public string? RawText { get; set; }
        
        public DetectedItem DetectedItem { get; set; } = new();
        public EstimatedValue EstimatedValue { get; set; } = new();
        public SustainabilityImpact Sustainability { get; set; } = new();
        
        public string Status { get; set; } = "draft"; // draft, listed, sold, discarded
        
        [BsonRepresentation(BsonType.ObjectId)]
        public string? ListingId { get; set; }
        
        public ScanLocation? Location { get; set; }
        public ScanMetadata Metadata { get; set; } = new();
        
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class DetectedItem
    {
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? Brand { get; set; }
        public string Condition { get; set; } = "good";
        public double Confidence { get; set; }
    }

    public class EstimatedValue
    {
        public decimal OriginalPrice { get; set; }
        public decimal ResaleValue { get; set; }
        public string Currency { get; set; } = "USD";
    }

    public class SustainabilityImpact
    {
        public double Co2SavedKg { get; set; }
        public double WasteDivertedKg { get; set; }
    }

    public class ScanLocation
    {
        public double[] Coordinates { get; set; } = new double[2];
        public string Address { get; set; } = string.Empty;
    }

    public class ScanMetadata
    {
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime ScannedAt { get; set; } = DateTime.UtcNow;
        public string? DeviceInfo { get; set; }
        public string AiModel { get; set; } = "phi-4-multimodal";
    }
}
