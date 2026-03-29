using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Meetrix.Infrastructure.Models
{
    [Table("Waitlist")]
    public class Waitlist
    {
        [Key]
        public int WaitlistId { get; set; }

        public int UserId { get; set; }

        public int RoomId { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime StartTime { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime EndTime { get; set; }

        [StringLength(100)]
        public string Status { get; set; } = "Active";

        [Column(TypeName = "datetime")]
        public DateTime CreatedOn { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime? LastUpdated { get; set; }

        [ForeignKey("RoomId")]
        public virtual Room Room { get; set; } = null!;

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
    }
}