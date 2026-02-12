using MongoDB.Driver;
using bloombackend.Models;
using bloombackend.Settings;

namespace bloombackend.Data
{
    public class MongoDbContext
    {
        private readonly IMongoDatabase _database;

        public MongoDbContext(MongoDbSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            _database = client.GetDatabase(settings.DatabaseName);
        }

        public IMongoCollection<User> Users => _database.GetCollection<User>("User");
        public IMongoCollection<MarketplaceItem> MarketplaceItems => _database.GetCollection<MarketplaceItem>("MarketplaceItem");
        public IMongoCollection<HiveActivity> HiveActivities => _database.GetCollection<HiveActivity>("HiveActivity");
        public IMongoCollection<Transaction> Transactions => _database.GetCollection<Transaction>("Transaction");
        public IMongoCollection<Scan> Scans => _database.GetCollection<Scan>("Scan");
        public IMongoCollection<Conversation> Conversations => _database.GetCollection<Conversation>("Conversation");
        public IMongoCollection<Grid> Grids => _database.GetCollection<Grid>("Grid");
    }
}
