using Meetrix.Core.Contracts;
using Meetrix.Core.DTOs;
using Meetrix.Core.Models;
using Meetrix.Infrastructure.Data;
using Meetrix.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Meetrix.Infrastructure.Services
{
    public class BookingService : IBookingService
    {
        private readonly AppDbContext _db;
        private readonly IWaitlistService _waitlistService;
        private readonly INotificationClient _notificationClient;
        private readonly IGoogleCalendarService _googleCalendarService;
        private readonly IRoomService _roomService;

        public BookingService(AppDbContext db, IWaitlistService waitlistService, INotificationClient notificationClient, IGoogleCalendarService googleCalendarService, IRoomService roomService)
        {
            _db = db;
            _waitlistService = waitlistService;
            _notificationClient = notificationClient;
            _googleCalendarService = googleCalendarService;
            _roomService = roomService;
        }

        public async Task<BookingSummary> CreateBookingAsync(BookingRequestDto request, int userId, bool isReassign = false, CancellationToken ct = default)
        {
            if (request.StartTime >= request.EndTime)
                throw new ArgumentException("End time must be after start time.");

            var room = await _db.Rooms
                .FirstOrDefaultAsync(r => r.RoomId == request.RoomId && r.IsActive == true, ct);

            if (room == null)
                throw new InvalidOperationException("Room not found or inactive.");

            var hasConflict = await _db.Bookings.AnyAsync(b =>
                b.RoomId == request.RoomId &&
                b.IsActive == true &&
                (b.Status != "Cancelled"  || b.Status != "NoShow") &&
                b.StartTime < request.EndTime &&
                b.EndTime > request.StartTime,
                ct);

            if (hasConflict)
                throw new InvalidOperationException("This room is already booked for the selected time.");

            var entity = new Booking
            {
                UserId = userId,
                RoomId = request.RoomId,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                Purpose = request.Purpose,
                Status = "Scheduled",
                LastUpdatedBy = userId,
                LastUpdated = DateTime.UtcNow,
                IsActive = true
            };

            _db.Bookings.Add(entity);
            await _db.SaveChangesAsync(ct);

            var user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == userId, ct);

            if (user != null)
            {
                if(!isReassign)
                {
                    await _notificationClient.SendBookingCreatedAsync(new BookingNotificationRequestDto
                    {
                        ToEmail = user.Email ?? string.Empty,
                        UserName = user.FirstName + " " + user.LastName ?? user.Email ?? "",
                        RoomName = room.RoomName,
                        StartTime = entity.StartTime,
                        EndTime = entity.EndTime,
                        Purpose = entity.Purpose ?? string.Empty
                    }, ct);
                }
                else
                {
                    await _notificationClient.SendBookingReassignedAsync(new BookingNotificationRequestDto
                    {
                        ToEmail = user.Email ?? string.Empty,
                        UserName = user.FirstName + " " + user.LastName ?? user.Email ?? "",
                        RoomName = room.RoomName,
                        StartTime = entity.StartTime,
                        EndTime = entity.EndTime,
                        Purpose = entity.Purpose ?? string.Empty
                    }, ct);
                }
            }

            var calendarEventId = await _googleCalendarService.CreateBookingEventAsync(room.RoomName, entity.StartTime, entity.EndTime, entity.Purpose, ct);

            entity.CalendarEventId = calendarEventId;
            await _db.SaveChangesAsync(ct);

            return new BookingSummary
            {
                BookingId = entity.BookingId,
                UserId = entity.UserId,
                RoomId = entity.RoomId,
                RoomName = room.RoomName,
                StartTime = entity.StartTime,
                EndTime = entity.EndTime,
                Status = entity.Status,
                Purpose = entity.Purpose,
                LastUpdatedBy = entity.LastUpdatedBy,
                LastUpdated = entity.LastUpdated,
                IsActive = entity.IsActive
            };
        }
        public async Task<IReadOnlyList<BookingSummary>> GetBookingsAsync(int userId, CancellationToken ct = default)
        {
            var bookings = await _db.Bookings
                .Where(b => b.UserId == userId)
                .Include(b => b.Room)
                .Include(b => b.User)
                .OrderBy(b => b.StartTime)
                .Select(b => new BookingSummary
                {
                    BookingId = b.BookingId,
                    UserId = b.UserId,
                    UserName = b.User.FirstName + " " + b.User.LastName,
                    RoomId = b.RoomId,
                    RoomName = b.Room.RoomName,
                    StartTime = b.StartTime,
                    EndTime = b.EndTime,
                    Status = b.Status,
                    Purpose = b.Purpose,
                    LastUpdatedBy = b.LastUpdatedBy,
                    LastUpdated = b.LastUpdated,
                    IsActive = b.IsActive,
                    CheckedInAt = b.CheckedInAt
                })
                .ToListAsync(ct);

            return bookings;
        }

        public async Task<bool> CancelBookingAsync(int bookingId, int userId, CancellationToken ct = default)
        {
            var booking = await _db.Bookings
                .FirstOrDefaultAsync(b => b.BookingId == bookingId && b.IsActive == true, ct);

            if (booking == null)
                return false;

            if (booking.UserId != userId)
                throw new UnauthorizedAccessException("You can only cancel your own bookings.");

            booking.Status = "Cancelled";
            booking.IsActive = false;
            booking.LastUpdatedBy = userId;
            booking.LastUpdated = DateTime.UtcNow;

            await _db.SaveChangesAsync(ct);

            var room = await _db.Rooms.FirstOrDefaultAsync(r => r.RoomId == booking.RoomId, ct);
            var user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == booking.UserId, ct);

            if (room != null && user != null)
            {
                await _notificationClient.SendBookingCancelledAsync(new BookingNotificationRequestDto
                {
                    ToEmail = user.Email ?? string.Empty,
                    UserName = user.FirstName + " " + user.LastName ?? user.Email ?? "",
                    RoomName = room.RoomName,
                    StartTime = booking.StartTime,
                    EndTime = booking.EndTime,
                    Purpose = booking.Purpose ?? string.Empty
                }, ct);
            }

            if (!string.IsNullOrWhiteSpace(booking.CalendarEventId))
            {
                await _googleCalendarService.DeleteBookingEventAsync(booking.CalendarEventId, ct);
            }

            await _waitlistService.TryAssignNextFromWaitlistAsync(booking.RoomId, booking.StartTime, booking.EndTime, ct);
            return true;
        }

        public async Task<RoomAvailabilityResponseDto> GetRoomAvailabilityAsync(int roomId, DateTime date, CancellationToken ct = default)
        {
            var dayStart = date.Date;
            var dayEnd = dayStart.AddDays(1);

            var roomExists = await _db.Rooms
                .AnyAsync(r => r.RoomId == roomId && r.IsActive == true, ct);

            if (!roomExists)
                throw new InvalidOperationException("Room not found or inactive.");

            var bookings = await _db.Bookings
                .Where(b =>
                    b.RoomId == roomId &&
                    b.IsActive == true &&
                    b.Status != "Cancelled" &&
                    b.Status != "NoShow" &&
                    b.StartTime < dayEnd &&
                    b.EndTime > dayStart)
                .OrderBy(b => b.StartTime)
                .ToListAsync(ct);

            var slots = new List<AvailabilityWindowDto>();
            var slotStart = dayStart;

            while (slotStart < dayEnd)
            {
                var slotEnd = slotStart.AddMinutes(15);

                var overlappingBooking = bookings.FirstOrDefault(b =>
                    b.StartTime < slotEnd &&
                    b.EndTime > slotStart);

                slots.Add(new AvailabilityWindowDto
                {
                    StartTime = slotStart,
                    EndTime = slotEnd,
                    IsAvailable = overlappingBooking == null,
                    BookedByUserId = overlappingBooking?.UserId
                });

                slotStart = slotEnd;
            }

            var groupedWindows = new List<AvailabilityWindowDto>();

            if (slots.Count > 0)
            {
                var currentWindow = new AvailabilityWindowDto
                {
                    StartTime = slots[0].StartTime,
                    EndTime = slots[0].EndTime,
                    IsAvailable = slots[0].IsAvailable,
                    BookedByUserId = slots[0].BookedByUserId
                };

                for (int i = 1; i < slots.Count; i++)
                {
                    var currentSlot = slots[i];

                    if (currentSlot.IsAvailable == currentWindow.IsAvailable &&
                        currentSlot.BookedByUserId == currentWindow.BookedByUserId)
                    {
                        currentWindow.EndTime = currentSlot.EndTime;
                    }
                    else
                    {
                        groupedWindows.Add(currentWindow);

                        currentWindow = new AvailabilityWindowDto
                        {
                            StartTime = currentSlot.StartTime,
                            EndTime = currentSlot.EndTime,
                            IsAvailable = currentSlot.IsAvailable,
                            BookedByUserId = currentSlot.BookedByUserId
                        };
                    }
                }

                groupedWindows.Add(currentWindow);
            }

            return new RoomAvailabilityResponseDto
            {
                RoomId = roomId,
                Date = dayStart,
                Windows = groupedWindows
            };
        }

        public async Task<IReadOnlyList<BookingSummary>> GetCurrentBookingsAdminAsync(CancellationToken ct = default)
        {
            var now = DateTime.Now;

            return await _db.Bookings
                .Where(b =>
                    b.IsActive == true &&
                    b.Status != "Cancelled" &&
                    b.EndTime > now)
                .Include(b => b.Room)
                .Include(b => b.User)
                .OrderBy(b => b.StartTime)
                .Select(b => new BookingSummary
                {
                    BookingId = b.BookingId,
                    UserId = b.UserId,
                    UserName = b.User.FirstName + " " + b.User.LastName,
                    RoomId = b.RoomId,
                    RoomName = b.Room.RoomName,
                    StartTime = b.StartTime,
                    EndTime = b.EndTime,
                    Status = b.Status,
                    Purpose = b.Purpose,
                    LastUpdatedBy = b.LastUpdatedBy,
                    LastUpdated = b.LastUpdated,
                    IsActive = b.IsActive,
                    CheckedInAt = b.CheckedInAt
                })
                .ToListAsync(ct);
        }

        public async Task<IReadOnlyList<BookingSummary>> GetBookingHistoryAdminAsync(CancellationToken ct = default)
        {
            var now = DateTime.Now;

            return await _db.Bookings
                .Where(b =>
                    (b.EndTime <= now && b.Status != "NoShow" && b.Status != "Cancelled") ||
                    b.Status == "Completed")
                .Include(b => b.Room)
                .Include(b => b.User)
                .OrderByDescending(b => b.StartTime)
                .Select(b => new BookingSummary
                {
                    BookingId = b.BookingId,
                    UserId = b.UserId,
                    UserName = b.User.FirstName + " " + b.User.LastName,
                    RoomId = b.RoomId,
                    RoomName = b.Room.RoomName,
                    StartTime = b.StartTime,
                    EndTime = b.EndTime,
                    Status = b.Status,
                    Purpose = b.Purpose,
                    LastUpdatedBy = b.LastUpdatedBy,
                    LastUpdated = b.LastUpdated,
                    IsActive = b.IsActive,
                    CheckedInAt = b.CheckedInAt
                })
                .ToListAsync(ct);
        }
        public async Task<IReadOnlyList<BookingSummary>> GetCancelledBookingsAdminAsync(CancellationToken ct = default)
        {
            return await _db.Bookings
                .Where(b => b.Status == "Cancelled" || b.Status == "NoShow")
                .Include(b => b.Room)
                .Include(b => b.User)
                .OrderByDescending(b => b.LastUpdated)
                .Select(b => new BookingSummary
                {
                    BookingId = b.BookingId,
                    UserId = b.UserId,
                    UserName = b.User.FirstName + " " + b.User.LastName,
                    RoomId = b.RoomId,
                    RoomName = b.Room.RoomName,
                    StartTime = b.StartTime,
                    EndTime = b.EndTime,
                    Status = b.Status,
                    Purpose = b.Purpose,
                    LastUpdatedBy = b.LastUpdatedBy,
                    LastUpdated = b.LastUpdated,
                    IsActive = b.IsActive
                })
                .ToListAsync(ct);
        }
        public async Task<bool> CheckInBookingAsync(int bookingId, int userId, CancellationToken ct = default)
        {
            var booking = await _db.Bookings
                .FirstOrDefaultAsync(b => b.BookingId == bookingId, ct);

            if (booking == null)
                return false;

            if (booking.UserId != userId)
                throw new UnauthorizedAccessException("You can only check in to your own booking.");

            if (booking.Status == "Cancelled" || booking.Status == "Completed")
                throw new InvalidOperationException("This booking cannot be checked in.");

            var now = DateTime.Now;
            var checkInOpen = booking.StartTime.AddMinutes(-5);
            var checkInClose = booking.StartTime.AddMinutes(5);

            if (now < checkInOpen || now > checkInClose)
                throw new InvalidOperationException("Check-in is only allowed from 5 minutes before to 5 minutes after the scheduled start time.");

            booking.Status = "CheckedIn";
            booking.CheckedInAt = now;
            booking.LastUpdatedBy = userId;
            booking.LastUpdated = now;

            await _db.SaveChangesAsync(ct);
            return true;
        }

        public async Task<int> AutoCancelNoShowBookingsAsync(CancellationToken ct = default)
        {
            var now = DateTime.Now;

            var bookingsToCancel = await _db.Bookings
                .Where(b =>
                    b.IsActive == true &&
                    b.Status == "Scheduled" &&
                    b.CheckedInAt == null &&
                    b.StartTime.AddMinutes(5) <= now)
                .ToListAsync(ct);

            if (!bookingsToCancel.Any())
                return 0;

            foreach (var booking in bookingsToCancel)
            {
                booking.Status = "NoShow";
                booking.LastUpdated = now;
                booking.LastUpdatedBy = booking.UserId;
            }

            await _db.SaveChangesAsync(ct);

            foreach (var booking in bookingsToCancel)
            {
                await _waitlistService.TryAssignNextFromWaitlistAsync(booking.RoomId, booking.StartTime, booking.EndTime, ct);
            }
            return bookingsToCancel.Count;
        }

        public async Task<int> SendCheckInRemindersAsync(CancellationToken ct = default)
        {
            var now = DateTime.Now;

            var bookingsToRemind = await _db.Bookings
                .Where(b =>
                    b.IsActive == true &&
                    b.Status == "Scheduled" &&
                    b.CheckedInAt == null &&
                    b.CheckInReminderSentAt == null &&
                    b.StartTime.AddMinutes(-5) <= now &&
                    b.StartTime > now)
                .Include(b => b.Room)
                .Include(b => b.User)
                .ToListAsync(ct);

            if (!bookingsToRemind.Any())
                return 0;

            foreach (var booking in bookingsToRemind)
            {
                var checkInLink =
                    $"http://localhost:5173/my-bookings?checkInBookingId={booking.BookingId}";

                await _notificationClient.SendCheckInReminderAsync(new BookingNotificationRequestDto
                {
                    ToEmail = booking.User.Email ?? string.Empty,
                    UserName = booking.User.FirstName + " " + booking.User.LastName ?? booking.User.Email ?? "User",
                    RoomName = booking.Room.RoomName,
                    StartTime = booking.StartTime,
                    EndTime = booking.EndTime,
                    Purpose = booking.Purpose ?? string.Empty,
                    Link = checkInLink
                }, ct);

                booking.CheckInReminderSentAt = now;
                booking.LastUpdated = now;
                booking.LastUpdatedBy = booking.UserId;
            }

            await _db.SaveChangesAsync(ct);
            return bookingsToRemind.Count;
        }

        public async Task<AdminDashboardSummaryDto> GetAdminDashboardSummaryAsync(CancellationToken ct = default)
        {
            var now = DateTime.Now;

            var totalBookings = await _db.Bookings.CountAsync(ct);

            var currentBookings = await _db.Bookings.CountAsync(b =>
                b.IsActive == true &&
                b.Status != "Cancelled" &&
                b.Status != "Completed" &&
                b.Status != "NoShow" &&
                b.EndTime > now,
                ct);

            var cancelledBookings = await _db.Bookings.CountAsync(b =>
                b.Status == "Cancelled",
                ct);

            var noShowBookings = await _db.Bookings.CountAsync(b =>
                b.Status == "NoShow",
                ct);

            var totalRooms = await _db.Rooms.CountAsync(r =>
                r.IsActive == true,
                ct);

            var activeWaitlistEntries = await _db.Waitlists.CountAsync(w =>
                w.Status == "Active",
                ct);

            var topRooms = await _db.Bookings
                .Where(b => b.Room != null)
                .GroupBy(b => new { b.RoomId, b.Room.RoomName })
                .Select(g => new RoomUsageDto
                {
                    RoomId = g.Key.RoomId,
                    RoomName = g.Key.RoomName,
                    BookingCount = g.Count()
                })
                .OrderByDescending(x => x.BookingCount)
                .Take(5)
                .ToListAsync(ct);

            var peakHours = await _db.Bookings
                .Where(b => b.StartTime != null)
                .GroupBy(b => b.StartTime!.Hour)
                .Select(g => new HourlyBookingDto
                {
                    Hour = g.Key,
                    BookingCount = g.Count()
                })
                .OrderByDescending(x => x.BookingCount)
                .Take(5)
                .ToListAsync(ct);

            return new AdminDashboardSummaryDto
            {
                TotalBookings = totalBookings,
                CurrentBookings = currentBookings,
                CancelledBookings = cancelledBookings,
                NoShowBookings = noShowBookings,
                TotalRooms = totalRooms,
                ActiveWaitlistEntries = activeWaitlistEntries,
                TopRooms = topRooms,
                PeakHours = peakHours
            };
        }

        public async Task<BookingSummary> CancelAndReAssign(int bookingId, CancellationToken ct = default)
        {
            var booking = await _db.Bookings.Where(b => b.BookingId == bookingId).Include(b => b.User).FirstOrDefaultAsync();

            if (booking == null)
            {
                throw new InvalidOperationException("Booking not found.");
            }

            booking.Status = "Cancelled";
            booking.IsActive = false;

            await _db.SaveChangesAsync(ct);

            var room = await _db.Rooms.FirstOrDefaultAsync(r => r.RoomId == booking.RoomId, ct);

            if (room == null)
            {
                throw new InvalidOperationException("Original room not found.");
            }

            // Convert accessibility to the values expected by GetAlternativeRoomsAsync
            var accessFilter = (bool)room.IsAccesible ? "accessible" : "standard";

            // Convert numeric capacity to the values expected by GetAlternativeRoomsAsync
            string capacityFilter;
            if (room.Capacity >= 1 && room.Capacity <= 4)
            {
                capacityFilter = "small";
            }
            else if (room.Capacity >= 5 && room.Capacity <= 10)
            {
                capacityFilter = "medium";
            }
            else
            {
                capacityFilter = "large";
            }

            // Fetch facility names using Room_Facilities + Facilities join
            var facilities = await (
                from rf in _db.Room_Facilities
                join f in _db.Facilities on rf.FacilityId equals f.FacilityId
                where rf.RoomId == booking.RoomId
                select f.FacilityName
            )
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim())
            .Distinct()
            .ToListAsync(ct);

            var alternativeRoomRequest = new AlternativeRoomsRequestDto
            {
                ExcludeRoomId = booking.RoomId,
                StartTime = booking.StartTime,
                EndTime = booking.EndTime,
                AccessFilter = accessFilter,
                CapacityFilter = capacityFilter,
                Facilities = facilities
            };

            var alternativeRooms = await _roomService.GetAlternativeRoomsAsync(alternativeRoomRequest);

            if (alternativeRooms == null || alternativeRooms.Count == 0)
            {
                var link =
                    $"http://localhost:5173/rooms";

                await _notificationClient.SendBookingNotReassignedAsync(new BookingNotificationRequestDto
                {
                    ToEmail = booking.User.Email ?? string.Empty,
                    UserName = booking.User.FirstName + " " + booking.User.LastName ?? booking.User.Email ?? "User",
                    RoomName = booking.Room.RoomName,
                    StartTime = booking.StartTime,
                    EndTime = booking.EndTime,
                    Purpose = booking.Purpose ?? string.Empty,
                    Link = link
                }, ct);
                return new BookingSummary
                {
                    Message = "The booking has been canceled, but no matching alternative rooms were available."
                };
            }

            var newBookingRequest = new BookingRequestDto
            {
                RoomId = alternativeRooms[0].RoomId,
                StartTime = booking.StartTime,
                EndTime = booking.EndTime,
                Purpose = booking.Purpose
            };

            var newBooking = await CreateBookingAsync(newBookingRequest, booking.UserId, true);

            return newBooking;
        }

    }
}
