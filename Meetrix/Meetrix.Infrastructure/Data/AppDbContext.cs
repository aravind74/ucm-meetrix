using System;
using System.Collections.Generic;
using Meetrix.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;

namespace Meetrix.Infrastructure.Data;

public partial class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Booking> Bookings { get; set; }

    public virtual DbSet<Facility> Facilities { get; set; }

    public virtual DbSet<Room> Rooms { get; set; }

    public virtual DbSet<Room_Facility> Room_Facilities { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<User_Role> User_Roles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasOne(d => d.Room).WithMany(p => p.Bookings)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Booking_Room");

            entity.HasOne(d => d.User).WithMany(p => p.Bookings)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Booking_User");
        });

        modelBuilder.Entity<Room_Facility>(entity =>
        {
            entity.HasOne(d => d.Facility).WithMany()
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Room_Facility_Facility");

            entity.HasOne(d => d.Room).WithMany()
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Room_Facility_Room");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasOne(d => d.UserRole).WithMany(p => p.Users).HasConstraintName("FK_User_User_Role");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
