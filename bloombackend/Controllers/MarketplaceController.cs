using Microsoft.AspNetCore.Mvc;
using bloombackend.Models;
using bloombackend.Services;

namespace bloombackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MarketplaceController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;

        public MarketplaceController(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        [HttpGet]
        public async Task<ActionResult<List<MarketplaceItem>>> GetItems([FromQuery] string? category, [FromQuery] double? lng, [FromQuery] double? lat, [FromQuery] double? radius)
        {
            List<MarketplaceItem> items;
            
            // If location provided, get nearby items
            if (lng.HasValue && lat.HasValue)
            {
                var radiusMeters = radius ?? 10000;
                items = await _mongoDbService.GetItemsNearLocationAsync(lng.Value, lat.Value, radiusMeters);
            }
            // If category provided, filter by category
            else if (!string.IsNullOrEmpty(category) && category != "All")
            {
                items = await _mongoDbService.GetItemsByCategoryAsync(category);
            }
            else
            {
                items = await _mongoDbService.GetItemsAsync();
            }

            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MarketplaceItem>> GetItem(string id)
        {
            var item = await _mongoDbService.GetItemByIdAsync(id);
            if (item == null)
                return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<ActionResult<MarketplaceItem>> CreateItem(MarketplaceItem item)
        {
            var created = await _mongoDbService.CreateItemAsync(item);
            return CreatedAtAction(nameof(GetItem), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateItem(string id, MarketplaceItem item)
        {
            var existing = await _mongoDbService.GetItemByIdAsync(id);
            if (existing == null)
                return NotFound();

            await _mongoDbService.UpdateItemAsync(id, item);
            return NoContent();
        }

        [HttpPost("{id}/buy")]
        public async Task<ActionResult> BuyItem(string id, [FromBody] string buyerId)
        {
            var item = await _mongoDbService.GetItemByIdAsync(id);
            if (item == null)
                return NotFound();

            if (item.Status == "sold")
                return BadRequest("Item already sold");

            item.Status = "sold";
            await _mongoDbService.UpdateItemAsync(id, item);

            // Create transaction record
            await _mongoDbService.CreateTransactionAsync(new Transaction
            {
                UserId = buyerId,
                ItemId = id,
                Title = $"Bought: {item.Title}",
                Amount = -item.Price,
                Type = "purchase"
            });

            // Update seller stats
            var seller = await _mongoDbService.GetUserByIdAsync(item.Seller.UserId);
            if (seller != null)
            {
                seller.Stats.ItemsSold++;
                await _mongoDbService.UpdateUserAsync(seller.Id, seller);
            }

            return Ok();
        }

        [HttpGet("categories")]
        public ActionResult<List<string>> GetCategories()
        {
            return Ok(new List<string> { "All", "electronics", "furniture", "clothing", "appliances", "books", "toys", "sports", "other" });
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteItem(string id)
        {
            var item = await _mongoDbService.GetItemByIdAsync(id);
            if (item == null)
                return NotFound();

            await _mongoDbService.DeleteItemAsync(id);
            return NoContent();
        }
    }
}
