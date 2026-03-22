using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Meetrix.Core.DTOs
{
    public class RoomAvailabilityResponseDto
    {
        public int RoomId { get; set; }
        public DateTime Date { get; set; }
        public List<AvailabilityWindowDto> Windows { get; set; } = new();
    }
}
