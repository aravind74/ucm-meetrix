using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Meetrix.Core.DTOs
{
    public class RoomUsageDto
    {
        public int RoomId { get; set; }
        public string RoomName { get; set; } = string.Empty;
        public int BookingCount { get; set; }
    }
}