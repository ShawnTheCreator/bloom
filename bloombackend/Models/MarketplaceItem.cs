namespace bloombackend.Models
{
    public class MarketplaceItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int SellerId { get; set; }
        public string SellerName { get; set; } = string.Empty;
        public string SellerDistance { get; set; } = string.Empty;
        public DateTime ListedDate { get; set; } = DateTime.UtcNow;
        public bool IsSold { get; set; }
        public int? BuyerId { get; set; }
    }
}
