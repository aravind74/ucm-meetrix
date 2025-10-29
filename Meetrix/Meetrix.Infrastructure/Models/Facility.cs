using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Meetrix.Infrastructure.Models;

[Table("Facility")]
public partial class Facility
{
    [Key]
    public int FacilityId { get; set; }

    [StringLength(100)]
    [Unicode(false)]
    public string FacilityName { get; set; } = null!;

    public int? LastUpdatedBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? LastUpdated { get; set; }

    public bool? IsActive { get; set; }
}
