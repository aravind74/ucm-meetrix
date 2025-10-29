using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Meetrix.Core.Models
{
    public class MeetrixBase
    {
        public int LastUpdatedBy { get; set; }
        public DateTime LastUpdated { get; set; }
        public bool IsActive { get; set; }
        public int? UserRoleId { get; set; }
    }
}
