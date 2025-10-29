using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Meetrix.Core.Models
{
    public class UserRegisterRequest : MeetrixBase
    {
        public string FirstName { get; set; } = "";
        public string? LastName { get; set; }
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
        public bool IsDifferentlyAbled { get; set; }
    }
}
