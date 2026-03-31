using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Meetrix.Core.DTOs
{
    public class AdminDashboardSummaryDto
    {
        public int TotalBookings { get; set; }
        public int CurrentBookings { get; set; }
        public int CancelledBookings { get; set; }
        public int NoShowBookings { get; set; }
        public int TotalRooms { get; set; }
        public int ActiveWaitlistEntries { get; set; }

        public List<RoomUsageDto> TopRooms { get; set; } = new();
        public List<HourlyBookingDto> PeakHours { get; set; } = new();
    }
}