using Meetrix.Core.Contracts;
using Meetrix.Core.DTOs;
using Meetrix.Core.Models;
using Meetrix.Infrastructure.Data;
using Meetrix.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;

namespace Meetrix.Infrastructure.Services
{
    public class WaitlistService : IWaitlistService
    {
        private readonly AppDbContext _db;
        private readonly INotificationClient _notificationClient;

        public WaitlistService(AppDbContext db, INotificationClient notificationClient)
        {
            _db = db;
            _notificationClient = notificationClient;
        }

        public async Task<WaitlistSummary> JoinWaitlistAsync(WaitlistRequestDto request, int userId, CancellationToken ct = default)
        {
            if (request.StartTime >= request.EndTime)
                throw new ArgumentException("Invalid time range.");

            if (request.StartTime < DateTime.Now)
                throw new ArgumentException("Cannot join waitlist for past time.");

            var roomExists = await _db.Rooms.AnyAsync(r => r.RoomId == request.RoomId && r.IsActive == true, ct);
            if (!roomExists)
                throw new InvalidOperationException("Room not found or inactive.");

            var alreadyBookedByUser = await _db.Bookings.AnyAsync(b =>
                b.UserId == userId &&
                b.RoomId == request.RoomId &&
                b.Status != "Cancelled" &&
                b.Status != "NoShow" &&
                b.StartTime < request.EndTime &&
                b.EndTime > request.StartTime,
                ct);

            if (alreadyBookedByUser)
                throw new InvalidOperationException("You already have a booking for this room and time.");

            var roomAlreadyAvailable = !await _db.Bookings.AnyAsync(b =>
                b.RoomId == request.RoomId &&
                b.IsActive == true &&
                b.Status != "Cancelled" &&
                b.Status != "NoShow" &&
                b.StartTime < request.EndTime &&
                b.EndTime > request.StartTime,
                ct);

            if (roomAlreadyAvailable)
                throw new InvalidOperationException("This room is available for the selected time. You do not need to join the waitlist.");

            var alreadyExists = await _db.Waitlists.AnyAsync(w =>
                w.UserId == userId &&
                w.RoomId == request.RoomId &&
                w.Status == "Active" &&
                w.StartTime < request.EndTime &&
                w.EndTime > request.StartTime,
                ct);

            if (alreadyExists)
                throw new InvalidOperationException("You already have a waitlist entry for this time.");

            var entity = new Waitlist
            {
                UserId = userId,
                RoomId = request.RoomId,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                Status = "Active",
                CreatedOn = DateTime.Now,
                LastUpdated = DateTime.Now
            };

            _db.Waitlists.Add(entity);
            await _db.SaveChangesAsync(ct);

            var room = await _db.Rooms.FirstAsync(r => r.RoomId == entity.RoomId, ct);

            return new WaitlistSummary
            {
                WaitlistId = entity.WaitlistId,
                UserId = entity.UserId,
                RoomId = entity.RoomId,
                RoomName = room.RoomName,
                StartTime = entity.StartTime,
                EndTime = entity.EndTime,
                Status = entity.Status,
                CreatedOn = entity.CreatedOn,
                LastUpdated = entity.LastUpdated
            };
        }

        public async Task<IReadOnlyList<WaitlistSummary>> GetMyWaitlistAsync(int userId, CancellationToken ct = default)
        {
            return await _db.Waitlists
                .Where(w => w.UserId == userId)
                .Include(w => w.Room)
                .OrderByDescending(w => w.CreatedOn)
                .Select(w => new WaitlistSummary
                {
                    WaitlistId = w.WaitlistId,
                    UserId = w.UserId,
                    RoomId = w.RoomId,
                    RoomName = w.Room.RoomName,
                    StartTime = w.StartTime,
                    EndTime = w.EndTime,
                    Status = w.Status,
                    CreatedOn = w.CreatedOn,
                    LastUpdated = w.LastUpdated
                })
                .ToListAsync(ct);
        }

        public async Task<bool> CancelWaitlistAsync(int waitlistId, int userId, CancellationToken ct = default)
        {
            var waitlist = await _db.Waitlists
                .FirstOrDefaultAsync(w => w.WaitlistId == waitlistId, ct);

            if (waitlist == null)
                return false;

            if (waitlist.UserId != userId)
                throw new UnauthorizedAccessException("You can only cancel your own waitlist entry.");

            if (waitlist.Status != "Active")
                throw new InvalidOperationException("Only active waitlist entries can be cancelled.");

            waitlist.Status = "Cancelled";
            waitlist.LastUpdated = DateTime.Now;

            await _db.SaveChangesAsync(ct);
            return true;
        }

        public async Task<bool> TryAssignNextFromWaitlistAsync(int roomId, DateTime startTime, DateTime endTime, CancellationToken ct = default)
        {
            var nextWaitlist = await _db.Waitlists
                .Where(w =>
                    w.RoomId == roomId &&
                    w.Status == "Active" &&
                    w.StartTime == startTime &&
                    w.EndTime == endTime)
                .OrderBy(w => w.CreatedOn)
                .FirstOrDefaultAsync(ct);

            if (nextWaitlist == null)
                return false;

            var hasConflict = await _db.Bookings.AnyAsync(b =>
                b.RoomId == roomId &&
                b.IsActive == true &&
                b.Status != "Cancelled" &&
                b.Status != "NoShow" &&
                b.StartTime < endTime &&
                b.EndTime > startTime,
                ct);

            var booking = new Booking
            {
                UserId = nextWaitlist.UserId,
                RoomId = nextWaitlist.RoomId,
                StartTime = nextWaitlist.StartTime,
                EndTime = nextWaitlist.EndTime,
                Purpose = "Auto-assigned from waitlist",
                Status = hasConflict? "Expired": "Scheduled",
                LastUpdatedBy = nextWaitlist.UserId,
                LastUpdated = DateTime.Now,
                IsActive = true
            };

            _db.Bookings.Add(booking);

            nextWaitlist.Status = "Assigned";
            nextWaitlist.LastUpdated = DateTime.Now;

            await _db.SaveChangesAsync(ct);
            var user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == booking.UserId, ct);
            var room = await _db.Rooms.FirstOrDefaultAsync(r => r.RoomId == booking.RoomId, ct);

            if (user != null && room != null)
            {
                await _notificationClient.SendWaitlistAssignedAsync(new BookingNotificationRequestDto
                {
                    ToEmail = user.Email ?? string.Empty,
                    UserName = user.FirstName + " " + user.LastName ?? user.Email ?? "",
                    RoomName = room.RoomName,
                    StartTime = booking.StartTime,
                    EndTime = booking.EndTime,
                    Purpose = booking.Purpose ?? string.Empty
                }, ct);
            }
            return true;
        }
    }
}