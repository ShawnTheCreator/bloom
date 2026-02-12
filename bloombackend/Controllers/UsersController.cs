using Microsoft.AspNetCore.Mvc;
using bloombackend.Models;
using bloombackend.Services;

namespace bloombackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly DataService _dataService;

        public UsersController()
        {
            _dataService = new DataService();
        }

        [HttpGet]
        public ActionResult<List<User>> GetUsers()
        {
            return Ok(_dataService.GetUsers());
        }

        [HttpGet("{id}")]
        public ActionResult<User> GetUser(int id)
        {
            var user = _dataService.GetUserById(id);
            if (user == null)
                return NotFound();
            return Ok(user);
        }

        [HttpGet("{id}/stats")]
        public ActionResult<object> GetUserStats(int id)
        {
            var user = _dataService.GetUserById(id);
            if (user == null)
                return NotFound();

            return Ok(new
            {
                totalSaved = user.TotalSaved,
                itemsSold = user.ItemsSold,
                itemsBought = user.ItemsBought,
                co2SavedKg = user.Co2SavedKg,
                isPremium = user.IsPremium
            });
        }

        [HttpPost("{id}/subscribe")]
        public ActionResult<User> Subscribe(int id)
        {
            var user = _dataService.GetUserById(id);
            if (user == null)
                return NotFound();

            user.IsPremium = true;
            _dataService.UpdateUser(user);
            return Ok(user);
        }
    }
}
