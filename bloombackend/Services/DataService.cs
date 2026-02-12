using bloombackend.Models;

namespace bloombackend.Services
{
    public class DataService
    {
        private static readonly List<User> _users = new()
        {
            new User { Id = 1, Name = "Sarah", Email = "sarah@example.com", TotalSaved = 2847, ItemsSold = 43, ItemsBought = 12, Co2SavedKg = 156, IsPremium = false }
        };

        private static readonly List<MarketplaceItem> _items = new()
        {
            new MarketplaceItem { Id = 1, Title = "Vintage Lamp", Price = 45, ImageUrl = "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200", Category = "Decor", SellerId = 2, SellerName = "Emma L.", SellerDistance = "0.3mi" },
            new MarketplaceItem { Id = 2, Title = "Designer Chair", Price = 120, ImageUrl = "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=200", Category = "Furniture", SellerId = 3, SellerName = "Mike R.", SellerDistance = "0.5mi" },
            new MarketplaceItem { Id = 3, Title = "Coffee Table", Price = 85, ImageUrl = "https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=200", Category = "Furniture", SellerId = 4, SellerName = "Sarah J.", SellerDistance = "0.8mi" },
            new MarketplaceItem { Id = 4, Title = "Plant Stand", Price = 35, ImageUrl = "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=200", Category = "Decor", SellerId = 5, SellerName = "Lisa M.", SellerDistance = "1.2mi" },
            new MarketplaceItem { Id = 5, Title = "Book Shelf", Price = 95, ImageUrl = "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=200", Category = "Furniture", SellerId = 6, SellerName = "David K.", SellerDistance = "0.4mi" },
            new MarketplaceItem { Id = 6, Title = "Desk Organizer", Price = 25, ImageUrl = "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=200", Category = "Decor", SellerId = 7, SellerName = "Anna P.", SellerDistance = "0.6mi" }
        };

        private static readonly List<HiveActivity> _activities = new()
        {
            new HiveActivity { Id = 1, Title = "Costco Run", Description = "Join the monthly Costco bulk run", Type = "group_buy", Participants = 8, MaxParticipants = 12, Savings = 45, OrganizerId = 1, OrganizerName = "Sarah J.", Time = "Tomorrow, 10AM", Location = "Costco - Downtown", Icon = "shopping-bag", Color = "#FF2D55", ParticipantIds = new List<int> { 1, 2, 3 } },
            new HiveActivity { Id = 2, Title = "Detergent Bulk Split", Description = "Split 24kg of eco-friendly detergent", Type = "split", Participants = 4, MaxParticipants = 6, Savings = 32, OrganizerId = 3, OrganizerName = "Mike R.", Time = "This weekend", Location = "Central Park Meetup", Icon = "zap", Color = "#34C759", ParticipantIds = new List<int> { 3, 4 } },
            new HiveActivity { Id = 3, Title = "Shared Delivery", Description = "Pool IKEA delivery with neighbors", Type = "delivery", Participants = 5, MaxParticipants = 8, Savings = 28, OrganizerId = 2, OrganizerName = "Emma L.", Time = "Next Tuesday", Location = "Your building lobby", Icon = "truck", Color = "#FF9500", ParticipantIds = new List<int> { 2, 5, 6, 7 } }
        };

        private static readonly List<Transaction> _transactions = new()
        {
            new Transaction { Id = 1, UserId = 1, Title = "Sold Kitchen Mixer", Amount = 85, Type = "sale", Date = DateTime.UtcNow.AddHours(-2) },
            new Transaction { Id = 2, UserId = 1, Title = "Sold Vintage Lamp", Amount = 45, Type = "sale", Date = DateTime.UtcNow.AddDays(-1) },
            new Transaction { Id = 3, UserId = 1, Title = "Bought Coffee Table", Amount = -85, Type = "purchase", Date = DateTime.UtcNow.AddDays(-2) }
        };

        public List<User> GetUsers() => _users;
        public User? GetUserById(int id) => _users.FirstOrDefault(u => u.Id == id);
        public void UpdateUser(User user)
        {
            var existing = _users.FirstOrDefault(u => u.Id == user.Id);
            if (existing != null)
            {
                var index = _users.IndexOf(existing);
                _users[index] = user;
            }
        }

        public List<MarketplaceItem> GetItems() => _items;
        public MarketplaceItem? GetItemById(int id) => _items.FirstOrDefault(i => i.Id == id);
        public void AddItem(MarketplaceItem item) => _items.Add(item);
        public void UpdateItem(MarketplaceItem item)
        {
            var existing = _items.FirstOrDefault(i => i.Id == item.Id);
            if (existing != null)
            {
                var index = _items.IndexOf(existing);
                _items[index] = item;
            }
        }

        public List<HiveActivity> GetActivities() => _activities;
        public HiveActivity? GetActivityById(int id) => _activities.FirstOrDefault(a => a.Id == id);
        public void JoinActivity(int activityId, int userId)
        {
            var activity = _activities.FirstOrDefault(a => a.Id == activityId);
            if (activity != null && !activity.ParticipantIds.Contains(userId))
            {
                activity.ParticipantIds.Add(userId);
                activity.Participants = activity.ParticipantIds.Count;
            }
        }

        public List<Transaction> GetTransactions(int userId) => _transactions.Where(t => t.UserId == userId).ToList();
        public void AddTransaction(Transaction transaction) => _transactions.Add(transaction);
    }
}
