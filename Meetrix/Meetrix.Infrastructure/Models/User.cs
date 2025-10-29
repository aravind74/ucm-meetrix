using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Meetrix.Infrastructure.Models;

[Table("User")]
public partial class User
{
    [Key]
    public int UserId { get; set; }

    [StringLength(100)]
    [Unicode(false)]
    public string FirstName { get; set; } = null!;

    [StringLength(100)]
    [Unicode(false)]
    public string? LastName { get; set; }

    public int? UserRoleId { get; set; }

    [StringLength(150)]
    public string? Email { get; set; }

    public string? PasswordHash { get; set; }

    public bool? IsDifferentlyAbled { get; set; }

    public int? LastUpdatedBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? LastUpdated { get; set; }

    public bool? IsActive { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    [ForeignKey("UserRoleId")]
    [InverseProperty("Users")]
    public virtual User_Role? UserRole { get; set; }
}
