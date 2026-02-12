namespace bloombackend.Models
{
    public class Transaction
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Type { get; set; } = string.Empty; // sale, purchase, saving
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public int? RelatedItemId { get; set; }
    }
}
