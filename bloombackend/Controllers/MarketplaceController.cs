using Microsoft.AspNetCore.Mvc;
using bloombackend.Models;
using bloombackend.Services;

namespace bloombackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MarketplaceController : ControllerBase
    {
        private readonly DataService _dataService;

        public MarketplaceController()
        {
            _dataService = new DataService();
        }

        [HttpGet]
        public ActionResult<List<MarketplaceItem>> GetItems([FromQuery] string? category)
        {
            var items = _dataService.GetItems();
            
            if (!string.IsNullOrEmpty(category) && category != "All")
            {
                items = items.Where(i => i.Category.Equals(category, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            return Ok(items);
        }

        [HttpGet("{id}")]
        public ActionResult<MarketplaceItem> GetItem(int id)
        {
            var item = _dataService.GetItemById(id);
            if (item == null)
                return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public ActionResult<MarketplaceItem> CreateItem(MarketplaceItem item)
        {
            item.Id = _dataService.GetItems().Max(i => i.Id) + 1;
            item.ListedDate = DateTime.UtcNow;
            _dataService.AddItem(item);
            return CreatedAtAction(nameof(GetItem), new { id = item.Id }, item);
        }

        [HttpPost("{id}/buy")]
        public ActionResult BuyItem(int id, [FromBody] int buyerId)
        {
            var item = _dataService.GetItemById(id);
            if (item == null)
                return NotFound();

            if (item.IsSold)
                return BadRequest("Item already sold");

            item.IsSold = true;
            item.BuyerId = buyerId;
            _dataService.UpdateItem(item);

            // Update buyer stats
            var buyer = _dataService.GetUserById(buyerId);
            if (buyer != null)
            {
                buyer.ItemsBought++;
                _dataService.UpdateUser(buyer);
            }

            return Ok();
        }

        [HttpGet("categories")]
        public ActionResult<List<string>> GetCategories()
        {
            return Ok(new List<string> { "All", "Furniture", "Decor", "Kitchen", "Electronics" });
        }
    }
}
