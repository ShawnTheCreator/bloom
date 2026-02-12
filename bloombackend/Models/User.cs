namespace bloombackend.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public decimal TotalSaved { get; set; }
        public int ItemsSold { get; set; }
        public int ItemsBought { get; set; }
        public double Co2SavedKg { get; set; }
        public DateTime JoinedDate { get; set; } = DateTime.UtcNow;
        public bool IsPremium { get; set; }
        public string? ProfileImage { get; set; }
    }
}
