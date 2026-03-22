using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Meetrix.Core.Models
{
    public class BookingSummary
    {
        public int BookingId { get; set; }
        public int UserId { get; set; }
        public string? UserName { get; set; }
        public int RoomId { get; set; }
        public string RoomName { get; set; } = string.Empty;
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string? Status { get; set; }
        public string? Purpose { get; set; }
        public int? LastUpdatedBy { get; set; }
        public DateTime? LastUpdated { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? CheckedInAt { get; set; }
    }
}
