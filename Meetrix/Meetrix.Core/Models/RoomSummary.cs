using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Meetrix.Core.Models
{
    public class RoomSummary
    {
        public int RoomId { get; set; }

        public string RoomName { get; set; } = null!;

        public int? Capacity { get; set; }

        public int? Floor { get; set; }

        public bool? IsAccessible { get; set; }

        public string? Description { get; set; }

        public int? LastUpdatedBy { get; set; }

        public DateTime? LastUpdated { get; set; }

        public bool? IsActive { get; set; }
    }
}
