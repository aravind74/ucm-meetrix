using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Meetrix.Infrastructure.Models;

[Keyless]
[Table("Room_Facility")]
public partial class Room_Facility
{
    public int RoomId { get; set; }

    public int FacilityId { get; set; }

    [ForeignKey("FacilityId")]
    public virtual Facility Facility { get; set; } = null!;

    [ForeignKey("RoomId")]
    public virtual Room Room { get; set; } = null!;
}
