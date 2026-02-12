using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace bloombackend.Models
{
    public class Conversation
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;
        
        public List<Participant> Participants { get; set; } = new();
        public List<Message> Messages { get; set; } = new();
        public LastMessage? LastMessage { get; set; }
        
        public string Type { get; set; } = "direct"; // direct, group_buy, event
        public RelatedItem? RelatedItem { get; set; }
        
        public Dictionary<string, int> UnreadCount { get; set; } = new();
        
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Participant
    {
        [BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime? LastReadAt { get; set; }
    }

    public class Message
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;
        
        [BsonRepresentation(BsonType.ObjectId)]
        public string SenderId { get; set; } = string.Empty;
        public string SenderName { get; set; } = string.Empty;
        public string? SenderAvatar { get; set; }
        
        public string Text { get; set; } = string.Empty;
        public string Type { get; set; } = "text"; // text, image, item, location
        
        public MessageMetadata? Metadata { get; set; }
        public List<MessageReaction> Reactions { get; set; } = new();
        public List<ReadReceipt> ReadBy { get; set; } = new();
        
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class LastMessage
    {
        public string Text { get; set; } = string.Empty;
        [BsonRepresentation(BsonType.ObjectId)]
        public string SenderId { get; set; } = string.Empty;
        public string SenderName { get; set; } = string.Empty;
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class RelatedItem
    {
        [BsonRepresentation(BsonType.ObjectId)]
        public string ItemId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Image { get; set; }
    }

    public class MessageMetadata
    {
        public string? ImageUrl { get; set; }
        [BsonRepresentation(BsonType.ObjectId)]
        public string? ItemId { get; set; }
        public string? ItemTitle { get; set; }
        public MessageLocation? Location { get; set; }
    }

    public class MessageLocation
    {
        public double[] Coordinates { get; set; } = new double[2];
        public string Address { get; set; } = string.Empty;
    }

    public class MessageReaction
    {
        public string Emoji { get; set; } = string.Empty;
        [BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; } = string.Empty;
    }

    public class ReadReceipt
    {
        [BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; } = string.Empty;
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime ReadAt { get; set; } = DateTime.UtcNow;
    }
}
