using Meetrix.Core.DTOs;
using Meetrix.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Meetrix.Core.Contracts
{
    public interface IBookingService
    {
        Task<BookingSummary> CreateBookingAsync(BookingRequestDto request, int userId, CancellationToken ct = default);
        Task<IReadOnlyList<BookingSummary>> GetBookingsAsync(int userId, CancellationToken ct = default);
        Task<bool> CancelBookingAsync(int bookingId, int userId, CancellationToken ct = default);
        Task<RoomAvailabilityResponseDto> GetRoomAvailabilityAsync(int roomId, DateTime date, CancellationToken ct = default);
        Task<IReadOnlyList<BookingSummary>> GetCurrentBookingsAdminAsync(CancellationToken ct = default);
        Task<IReadOnlyList<BookingSummary>> GetBookingHistoryAdminAsync(CancellationToken ct = default);
        Task<IReadOnlyList<BookingSummary>> GetCancelledBookingsAdminAsync(CancellationToken ct = default);
        Task<bool> CheckInBookingAsync(int bookingId, int userId, CancellationToken ct = default);
        Task<int> AutoCancelNoShowBookingsAsync(CancellationToken ct = default);
        Task<int> SendCheckInRemindersAsync(CancellationToken ct = default);
        Task<AdminDashboardSummaryDto> GetAdminDashboardSummaryAsync(CancellationToken ct = default);
    }
}
