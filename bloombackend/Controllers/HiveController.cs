using Microsoft.AspNetCore.Mvc;
using bloombackend.Models;
using bloombackend.Services;

namespace bloombackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HiveController : ControllerBase
    {
        private readonly DataService _dataService;

        public HiveController()
        {
            _dataService = new DataService();
        }

        [HttpGet]
        public ActionResult<List<HiveActivity>> GetActivities()
        {
            return Ok(_dataService.GetActivities());
        }

        [HttpGet("{id}")]
        public ActionResult<HiveActivity> GetActivity(int id)
        {
            var activity = _dataService.GetActivityById(id);
            if (activity == null)
                return NotFound();
            return Ok(activity);
        }

        [HttpPost("{id}/join")]
        public ActionResult JoinActivity(int id, [FromBody] int userId)
        {
            var activity = _dataService.GetActivityById(id);
            if (activity == null)
                return NotFound();

            if (activity.ParticipantIds.Contains(userId))
                return BadRequest("User already joined");

            if (activity.Participants >= activity.MaxParticipants)
                return BadRequest("Activity is full");

            _dataService.JoinActivity(id, userId);
            return Ok();
        }

        [HttpPost]
        public ActionResult<HiveActivity> CreateActivity(HiveActivity activity)
        {
            activity.Id = _dataService.GetActivities().Max(a => a.Id) + 1;
            activity.CreatedAt = DateTime.UtcNow;
            activity.ParticipantIds = new List<int> { activity.OrganizerId };
            activity.Participants = 1;
            
            // Add to the list (would be in data service)
            _dataService.GetActivities().Add(activity);
            
            return CreatedAtAction(nameof(GetActivity), new { id = activity.Id }, activity);
        }

        [HttpGet("stats")]
        public ActionResult<object> GetStats()
        {
            var activities = _dataService.GetActivities();
            var totalParticipants = activities.Sum(a => a.Participants);
            var totalSavings = activities.Sum(a => a.Savings);

            return Ok(new
            {
                activeActivities = activities.Count,
                totalParticipants,
                totalSavings,
                neighborCount = 247
            });
        }
    }
}
