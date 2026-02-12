using Microsoft.AspNetCore.Mvc;
using bloombackend.Models;
using bloombackend.Services;

namespace bloombackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly DataService _dataService;

        public TransactionsController()
        {
            _dataService = new DataService();
        }

        [HttpGet("user/{userId}")]
        public ActionResult<List<Transaction>> GetUserTransactions(int userId)
        {
            return Ok(_dataService.GetTransactions(userId));
        }

        [HttpPost]
        public ActionResult<Transaction> CreateTransaction(Transaction transaction)
        {
            transaction.Id = _dataService.GetTransactions(transaction.UserId).Max(t => (int?)t.Id) + 1 ?? 1;
            transaction.Date = DateTime.UtcNow;
            _dataService.AddTransaction(transaction);
            
            // Update user stats
            var user = _dataService.GetUserById(transaction.UserId);
            if (user != null)
            {
                if (transaction.Type == "sale" && transaction.Amount > 0)
                {
                    user.TotalSaved += transaction.Amount;
                    user.ItemsSold++;
                }
                else if (transaction.Type == "purchase")
                {
                    user.TotalSaved += transaction.Amount;
                }
                _dataService.UpdateUser(user);
            }

            return CreatedAtAction(nameof(GetUserTransactions), new { userId = transaction.UserId }, transaction);
        }

        [HttpGet("user/{userId}/summary")]
        public ActionResult<object> GetUserSummary(int userId)
        {
            var user = _dataService.GetUserById(userId);
            if (user == null)
                return NotFound();

            var transactions = _dataService.GetTransactions(userId);
            var recentSales = transactions.Where(t => t.Type == "sale").OrderByDescending(t => t.Date).Take(3);

            return Ok(new
            {
                totalSaved = user.TotalSaved,
                itemsSold = user.ItemsSold,
                itemsBought = user.ItemsBought,
                co2SavedKg = user.Co2SavedKg,
                recentActivity = recentSales
            });
        }
    }
}
