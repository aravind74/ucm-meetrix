using System.ComponentModel.DataAnnotations;

namespace Meetrix.Core.DTOs
{
    public class BookingRequestDto
    {
        [Required]
        public int RoomId { get; set; }
        [Required]
        public DateTime StartTime { get; set; }
        [Required]
        public DateTime EndTime { get; set; }
        [StringLength(255)]
        public string? Purpose { get; set; }

    }
}
