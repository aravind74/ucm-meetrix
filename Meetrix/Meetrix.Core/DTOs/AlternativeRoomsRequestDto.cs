using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Meetrix.Core.DTOs
{
    public class AlternativeRoomsRequestDto
    {
        public int ExcludeRoomId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        public string AccessFilter { get; set; } = "all";
        public string CapacityFilter { get; set; } = "any";
        public List<string> Facilities { get; set; } = new();
    }
}
