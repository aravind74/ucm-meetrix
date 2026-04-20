using Meetrix.Core.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Meetrix.Core.Contracts
{
    public interface INotificationClient
    {
        Task SendBookingCreatedAsync(BookingNotificationRequestDto request, CancellationToken ct = default);
        Task SendBookingCancelledAsync(BookingNotificationRequestDto request, CancellationToken ct = default);
        Task SendWaitlistAssignedAsync(BookingNotificationRequestDto request, CancellationToken ct = default);
        Task SendCheckInReminderAsync(BookingNotificationRequestDto request, CancellationToken ct = default);
        Task SendBookingReassignedAsync(BookingNotificationRequestDto request, CancellationToken ct = default);
        Task SendBookingNotReassignedAsync(BookingNotificationRequestDto requestDto, CancellationToken ct = default);
    }
}
