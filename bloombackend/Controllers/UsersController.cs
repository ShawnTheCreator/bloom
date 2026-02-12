using Microsoft.AspNetCore.Mvc;
using bloombackend.Models;
using bloombackend.Services;

namespace bloombackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;

        public UsersController(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        [HttpGet]
        public async Task<ActionResult<List<User>>> GetUsers()
        {
            var users = await _mongoDbService.GetUsersAsync();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(string id)
        {
            var user = await _mongoDbService.GetUserByIdAsync(id);
            if (user == null)
                return NotFound();
            return Ok(user);
        }

        [HttpGet("{id}/stats")]
        public async Task<ActionResult<object>> GetUserStats(string id)
        {
            var user = await _mongoDbService.GetUserByIdAsync(id);
            if (user == null)
                return NotFound();

            return Ok(new
            {
                totalSaved = user.Stats.TotalSaved,
                itemsSold = user.Stats.ItemsSold,
                itemsBought = user.Stats.ItemsBought,
                co2SavedKg = user.Stats.Co2SavedKg,
                isPremium = user.Subscription.IsMamaPro,
                reputation = user.Stats.Reputation
            });
        }

        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(User user)
        {
            var created = await _mongoDbService.CreateUserAsync(user);
            return CreatedAtAction(nameof(GetUser), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateUser(string id, User user)
        {
            var existing = await _mongoDbService.GetUserByIdAsync(id);
            if (existing == null)
                return NotFound();

            await _mongoDbService.UpdateUserAsync(id, user);
            return NoContent();
        }

        [HttpPost("{id}/subscribe")]
        public async Task<ActionResult<User>> Subscribe(string id)
        {
            var user = await _mongoDbService.GetUserByIdAsync(id);
            if (user == null)
                return NotFound();

            user.Subscription.IsMamaPro = true;
            user.Subscription.Plan = "monthly";
            await _mongoDbService.UpdateUserAsync(id, user);
            return Ok(user);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteUser(string id)
        {
            var user = await _mongoDbService.GetUserByIdAsync(id);
            if (user == null)
                return NotFound();

            await _mongoDbService.DeleteUserAsync(id);
            return NoContent();
        }
    }
}
