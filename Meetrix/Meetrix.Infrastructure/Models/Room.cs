using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Meetrix.Infrastructure.Models;

[Table("Room")]
public partial class Room
{
    [Key]
    public int RoomId { get; set; }

    [StringLength(100)]
    [Unicode(false)]
    public string RoomName { get; set; } = null!;

    public int? Capacity { get; set; }

    public int? Floor { get; set; }

    public bool? IsAccesible { get; set; }

    [StringLength(250)]
    [Unicode(false)]
    public string? Description { get; set; }

    public int? LastUpdatedBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? LastUpdated { get; set; }

    public bool? IsActive { get; set; }

    [InverseProperty("Room")]
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
