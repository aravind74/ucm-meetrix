namespace Meetrix.Core.DTOs
{
    public class RoomRequestDto
    {
        public string RoomName { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public int Floor { get; set; }
        public bool IsAccessible { get; set; }
        public string? Description { get; set; }
    }
}
