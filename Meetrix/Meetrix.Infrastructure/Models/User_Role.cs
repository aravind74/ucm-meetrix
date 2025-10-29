using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Meetrix.Infrastructure.Models;

[Table("User_Role")]
public partial class User_Role
{
    [Key]
    public int UserRoleId { get; set; }

    [StringLength(100)]
    [Unicode(false)]
    public string? RoleName { get; set; }

    [InverseProperty("UserRole")]
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
