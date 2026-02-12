using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace bloombackend.Models
{
    public class Transaction
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;
        
        [BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; } = string.Empty;
        
        [BsonRepresentation(BsonType.ObjectId)]
        public string? ItemId { get; set; }
        
        public string Title { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Type { get; set; } = string.Empty; // sale, purchase, subscription, refund
        public string Status { get; set; } = "completed"; // pending, completed, cancelled, refunded
        
        public PaymentDetails? Payment { get; set; }
        
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime Date { get; set; } = DateTime.UtcNow;
        
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class PaymentDetails
    {
        public string Method { get; set; } = string.Empty; // stripe, paypal, in-app
        public string? TransactionId { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
