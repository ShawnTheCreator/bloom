using Microsoft.AspNetCore.Mvc;
using bloombackend.Models;
using bloombackend.Services;

namespace bloombackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;

        public TransactionsController(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<Transaction>>> GetUserTransactions(string userId)
        {
            var transactions = await _mongoDbService.GetTransactionsByUserAsync(userId);
            return Ok(transactions);
        }

        [HttpPost]
        public async Task<ActionResult<Transaction>> CreateTransaction(Transaction transaction)
        {
            var created = await _mongoDbService.CreateTransactionAsync(transaction);
            
            // Update user stats
            var user = await _mongoDbService.GetUserByIdAsync(transaction.UserId);
            if (user != null)
            {
                if (transaction.Type == "sale" && transaction.Amount > 0)
                {
                    user.Stats.TotalSaved += transaction.Amount;
                    user.Stats.ItemsSold++;
                }
                else if (transaction.Type == "purchase")
                {
                    user.Stats.ItemsBought++;
                }
                await _mongoDbService.UpdateUserAsync(user.Id, user);
            }

            return CreatedAtAction(nameof(GetUserTransactions), new { userId = transaction.UserId }, created);
        }

        [HttpGet("user/{userId}/summary")]
        public async Task<ActionResult<object>> GetUserSummary(string userId)
        {
            var user = await _mongoDbService.GetUserByIdAsync(userId);
            if (user == null)
                return NotFound();

            var transactions = await _mongoDbService.GetTransactionsByUserAsync(userId);
            var recentSales = transactions.Where(t => t.Type == "sale").OrderByDescending(t => t.Date).Take(3).ToList();

            return Ok(new
            {
                totalSaved = user.Stats.TotalSaved,
                itemsSold = user.Stats.ItemsSold,
                itemsBought = user.Stats.ItemsBought,
                co2SavedKg = user.Stats.Co2SavedKg,
                reputation = user.Stats.Reputation,
                isPremium = user.Subscription.IsMamaPro,
                recentActivity = recentSales
            });
        }
    }
}
