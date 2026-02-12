using MongoDB.Driver;
using bloombackend.Data;
using bloombackend.Models;

namespace bloombackend.Services
{
    public class MongoDbService
    {
        private readonly MongoDbContext _context;

        public MongoDbService(MongoDbContext context)
        {
            _context = context;
        }

        // ============================================
        // USERS
        // ============================================
        public async Task<List<User>> GetUsersAsync() =>
            await _context.Users.Find(_ => true).ToListAsync();

        public async Task<User?> GetUserByIdAsync(string id) =>
            await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();

        public async Task<User?> GetUserByEmailAsync(string email) =>
            await _context.Users.Find(u => u.Email == email).FirstOrDefaultAsync();

        public async Task<User> CreateUserAsync(User user)
        {
            user.CreatedAt = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.Users.InsertOneAsync(user);
            return user;
        }

        public async Task UpdateUserAsync(string id, User user)
        {
            user.UpdatedAt = DateTime.UtcNow;
            await _context.Users.ReplaceOneAsync(u => u.Id == id, user);
        }

        public async Task DeleteUserAsync(string id) =>
            await _context.Users.DeleteOneAsync(u => u.Id == id);

        // ============================================
        // MARKETPLACE ITEMS
        // ============================================
        public async Task<List<MarketplaceItem>> GetItemsAsync() =>
            await _context.MarketplaceItems.Find(i => i.Status == "active").ToListAsync();

        public async Task<List<MarketplaceItem>> GetItemsByCategoryAsync(string category) =>
            await _context.MarketplaceItems.Find(i => i.Category == category && i.Status == "active").ToListAsync();

        public async Task<MarketplaceItem?> GetItemByIdAsync(string id) =>
            await _context.MarketplaceItems.Find(i => i.Id == id).FirstOrDefaultAsync();

        public async Task<List<MarketplaceItem>> GetItemsNearLocationAsync(double longitude, double latitude, double radiusMeters = 10000)
        {
            var filter = Builders<MarketplaceItem>.Filter.Near(
                i => i.Location.Coordinates,
                longitude,
                latitude,
                maxDistance: radiusMeters
            );
            return await _context.MarketplaceItems.Find(filter).ToListAsync();
        }

        public async Task<MarketplaceItem> CreateItemAsync(MarketplaceItem item)
        {
            item.CreatedAt = DateTime.UtcNow;
            item.UpdatedAt = DateTime.UtcNow;
            await _context.MarketplaceItems.InsertOneAsync(item);
            return item;
        }

        public async Task UpdateItemAsync(string id, MarketplaceItem item)
        {
            item.UpdatedAt = DateTime.UtcNow;
            await _context.MarketplaceItems.ReplaceOneAsync(i => i.Id == id, item);
        }

        public async Task DeleteItemAsync(string id) =>
            await _context.MarketplaceItems.DeleteOneAsync(i => i.Id == id);

        // ============================================
        // HIVE ACTIVITIES
        // ============================================
        public async Task<List<HiveActivity>> GetActivitiesAsync() =>
            await _context.HiveActivities.Find(a => a.Status == "upcoming").ToListAsync();

        public async Task<HiveActivity?> GetActivityByIdAsync(string id) =>
            await _context.HiveActivities.Find(a => a.Id == id).FirstOrDefaultAsync();

        public async Task<HiveActivity> CreateActivityAsync(HiveActivity activity)
        {
            activity.CreatedAt = DateTime.UtcNow;
            activity.UpdatedAt = DateTime.UtcNow;
            await _context.HiveActivities.InsertOneAsync(activity);
            return activity;
        }

        public async Task JoinActivityAsync(string activityId, string userId, string username)
        {
            var filter = Builders<HiveActivity>.Filter.Eq(a => a.Id, activityId);
            var update = Builders<HiveActivity>.Update
                .Push(a => a.Participants, new ActivityParticipant { UserId = userId, Username = username })
                .Inc(a => a.CurrentParticipants, 1);
            await _context.HiveActivities.UpdateOneAsync(filter, update);
        }

        // ============================================
        // TRANSACTIONS
        // ============================================
        public async Task<List<Transaction>> GetTransactionsByUserAsync(string userId) =>
            await _context.Transactions.Find(t => t.UserId == userId).ToListAsync();

        public async Task<Transaction> CreateTransactionAsync(Transaction transaction)
        {
            transaction.Date = DateTime.UtcNow;
            transaction.UpdatedAt = DateTime.UtcNow;
            await _context.Transactions.InsertOneAsync(transaction);
            return transaction;
        }

        // ============================================
        // SCANS
        // ============================================
        public async Task<List<Scan>> GetScansByUserAsync(string userId) =>
            await _context.Scans.Find(s => s.UserId == userId).ToListAsync();

        public async Task<Scan?> GetScanByIdAsync(string id) =>
            await _context.Scans.Find(s => s.Id == id).FirstOrDefaultAsync();

        public async Task<Scan> CreateScanAsync(Scan scan)
        {
            scan.CreatedAt = DateTime.UtcNow;
            scan.UpdatedAt = DateTime.UtcNow;
            await _context.Scans.InsertOneAsync(scan);
            return scan;
        }

        public async Task UpdateScanStatusAsync(string scanId, string status, string? listingId = null)
        {
            var update = Builders<Scan>.Update
                .Set(s => s.Status, status)
                .Set(s => s.UpdatedAt, DateTime.UtcNow);
            
            if (listingId != null)
                update = update.Set(s => s.ListingId, listingId);
            
            await _context.Scans.UpdateOneAsync(s => s.Id == scanId, update);
        }

        // ============================================
        // CONVERSATIONS
        // ============================================
        public async Task<List<Conversation>> GetConversationsByUserAsync(string userId) =>
            await _context.Conversations
                .Find(c => c.Participants.Any(p => p.UserId == userId))
                .SortByDescending(c => c.UpdatedAt)
                .ToListAsync();

        public async Task<Conversation?> GetConversationByIdAsync(string id) =>
            await _context.Conversations.Find(c => c.Id == id).FirstOrDefaultAsync();

        public async Task<Conversation> CreateConversationAsync(Conversation conversation)
        {
            conversation.CreatedAt = DateTime.UtcNow;
            conversation.UpdatedAt = DateTime.UtcNow;
            await _context.Conversations.InsertOneAsync(conversation);
            return conversation;
        }

        public async Task AddMessageAsync(string conversationId, Message message)
        {
            var filter = Builders<Conversation>.Filter.Eq(c => c.Id, conversationId);
            var update = Builders<Conversation>.Update
                .Push(c => c.Messages, message)
                .Set(c => c.LastMessage, new LastMessage
                {
                    Text = message.Text,
                    SenderId = message.SenderId,
                    SenderName = message.SenderName,
                    CreatedAt = message.CreatedAt
                })
                .Set(c => c.UpdatedAt, DateTime.UtcNow);
            
            await _context.Conversations.UpdateOneAsync(filter, update);
        }

        // ============================================
        // GRIDS
        // ============================================
        public async Task<List<Grid>> GetGridsNearLocationAsync(double longitude, double latitude, double radiusMeters = 5000)
        {
            var filter = Builders<Grid>.Filter.Near(
                g => g.Location.Coordinates,
                longitude,
                latitude,
                maxDistance: radiusMeters
            );
            return await _context.Grids.Find(filter).ToListAsync();
        }

        public async Task<Grid?> GetGridByIdAsync(string id) =>
            await _context.Grids.Find(g => g.Id == id).FirstOrDefaultAsync();

        public async Task JoinGridAsync(string gridId, string userId, string username, string? avatar = null)
        {
            var filter = Builders<Grid>.Filter.Eq(g => g.Id, gridId);
            var update = Builders<Grid>.Update
                .Push(g => g.Members, new GridMember
                {
                    UserId = userId,
                    Username = username,
                    Avatar = avatar,
                    JoinedAt = DateTime.UtcNow
                })
                .Inc(g => g.Stats.ActiveMembers, 1);
            
            await _context.Grids.UpdateOneAsync(filter, update);
        }
    }
}
