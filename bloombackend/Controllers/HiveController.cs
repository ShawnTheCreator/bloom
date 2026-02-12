using Microsoft.AspNetCore.Mvc;
using bloombackend.Models;
using bloombackend.Services;

namespace bloombackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HiveController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;

        public HiveController(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        [HttpGet]
        public async Task<ActionResult<List<HiveActivity>>> GetActivities()
        {
            var activities = await _mongoDbService.GetActivitiesAsync();
            return Ok(activities);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<HiveActivity>> GetActivity(string id)
        {
            var activity = await _mongoDbService.GetActivityByIdAsync(id);
            if (activity == null)
                return NotFound();
            return Ok(activity);
        }

        [HttpPost("{id}/join")]
        public async Task<ActionResult> JoinActivity(string id, [FromBody] JoinActivityRequest request)
        {
            var activity = await _mongoDbService.GetActivityByIdAsync(id);
            if (activity == null)
                return NotFound();

            if (activity.Participants.Any(p => p.UserId == request.UserId))
                return BadRequest("User already joined");

            if (activity.MaxParticipants.HasValue && activity.CurrentParticipants >= activity.MaxParticipants)
                return BadRequest("Activity is full");

            await _mongoDbService.JoinActivityAsync(id, request.UserId, request.Username);
            return Ok();
        }

        [HttpPost]
        public async Task<ActionResult<HiveActivity>> CreateActivity(HiveActivity activity)
        {
            var created = await _mongoDbService.CreateActivityAsync(activity);
            return CreatedAtAction(nameof(GetActivity), new { id = created.Id }, created);
        }

        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetStats()
        {
            var activities = await _mongoDbService.GetActivitiesAsync();
            var totalParticipants = activities.Sum(a => a.CurrentParticipants);
            var totalSavings = activities.Sum(a => a.SustainabilityImpact?.Co2SavedKg ?? 0);

            return Ok(new
            {
                activeActivities = activities.Count,
                totalParticipants,
                totalCo2Saved = totalSavings,
                neighborCount = 247
            });
        }
    }

    public class JoinActivityRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
    }
}
