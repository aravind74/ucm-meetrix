using Meetrix.NotificationService.DTOs;

namespace Meetrix.NotificationService.Contracts
{
    public interface IEmailService
    {
        Task SendBookingCreatedAsync(BookingNotificationRequestDto request, CancellationToken ct = default);
        Task SendBookingCancelledAsync(BookingNotificationRequestDto request, CancellationToken ct = default);
        Task SendWaitlistAssignedAsync(BookingNotificationRequestDto request, CancellationToken ct = default);
        Task SendCheckInReminderAsync(BookingNotificationRequestDto request, CancellationToken ct = default);
    }
}
