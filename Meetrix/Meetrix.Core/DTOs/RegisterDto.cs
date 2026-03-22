namespace Meetrix.Core.DTOs
{
    public class RegisterDto
    {
        public string FirstName { get; set; } = "";
        public string? LastName { get; set; }
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
        public bool IsDifferentlyAbled { get; set; }
        public int LastUpdatedBy { get; set; }
    }
}
