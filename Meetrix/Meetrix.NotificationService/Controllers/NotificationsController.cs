using Meetrix.NotificationService.Contracts;
using Meetrix.NotificationService.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace Meetrix.NotificationService.Controllers
{
    [Route("api/notifications")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly IEmailService _emailService;

        public NotificationsController(IEmailService emailService)
        {
            _emailService = emailService;
        }

        [HttpPost("booking-created")]
        public async Task<IActionResult> SendBookingCreated(
            [FromBody] BookingNotificationRequestDto request,
            CancellationToken ct)
        {
            await _emailService.SendBookingCreatedAsync(request, ct);
            return Ok(new { message = "Booking confirmation email sent." });
        }

        [HttpPost("booking-cancelled")]
        public async Task<IActionResult> SendBookingCancelled(
            [FromBody] BookingNotificationRequestDto request,
            CancellationToken ct)
        {
            await _emailService.SendBookingCancelledAsync(request, ct);
            return Ok(new { message = "Booking cancellation email sent." });
        }

        [HttpPost("waitlist-assigned")]
        public async Task<IActionResult> SendWaitlistAssigned(
            [FromBody] BookingNotificationRequestDto request,
            CancellationToken ct)
        {
            await _emailService.SendWaitlistAssignedAsync(request, ct);
            return Ok(new { message = "Waitlist assignment email sent." });
        }

        [HttpPost("checkin-reminder")]
        public async Task<IActionResult> SendCheckInReminder([FromBody] BookingNotificationRequestDto request, CancellationToken ct)
        {
            await _emailService.SendCheckInReminderAsync(request, ct);
            return Ok(new { message = "Check-in reminder email sent." });
        }
    }
}