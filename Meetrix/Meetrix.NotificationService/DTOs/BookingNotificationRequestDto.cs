namespace Meetrix.NotificationService.DTOs
{
    public class BookingNotificationRequestDto
    {
        public string ToEmail { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string RoomName { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Purpose { get; set; } = string.Empty;
        public string? Link { get; set; }
    }
}
