using MailKit.Net.Smtp;
using MailKit.Security;
using Meetrix.NotificationService.Contracts;
using Meetrix.NotificationService.DTOs;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Meetrix.NotificationService.Services
{
    public class SmtpEmailService : IEmailService
    {
        private readonly SmtpSettings _smtpSettings;

        public SmtpEmailService(IOptions<SmtpSettings> smtpOptions)
        {
            _smtpSettings = smtpOptions.Value;
        }

        public Task SendBookingCreatedAsync(BookingNotificationRequestDto request, CancellationToken ct = default)
        {
            var subject = "Meetrix Booking Confirmed";
            var body = $"""
                Hello {request.UserName},

                Your booking has been confirmed.

                Room: {request.RoomName}
                Start: {request.StartTime}
                End: {request.EndTime}
                Purpose: {request.Purpose}

                Regards,
                Meetrix
                """;

            return SendEmailAsync(request.ToEmail, subject, body, ct);
        }

        public Task SendBookingCancelledAsync(BookingNotificationRequestDto request, CancellationToken ct = default)
        {
            var subject = "Meetrix Booking Cancelled";
            var body = $"""
                Hello {request.UserName},

                Your booking has been cancelled.

                Room: {request.RoomName}
                Start: {request.StartTime}
                End: {request.EndTime}

                Regards,
                Meetrix
                """;

            return SendEmailAsync(request.ToEmail, subject, body, ct);
        }

        public Task SendWaitlistAssignedAsync(BookingNotificationRequestDto request, CancellationToken ct = default)
        {
            var subject = "Meetrix Waitlist Assigned";
            var body = $"""
                Hello {request.UserName},

                A room has become available and has been assigned to you.

                Room: {request.RoomName}
                Start: {request.StartTime}
                End: {request.EndTime}
                Purpose: {request.Purpose}

                Regards,
                Meetrix
                """;

            return SendEmailAsync(request.ToEmail, subject, body, ct);
        }

        public Task SendCheckInReminderAsync(BookingNotificationRequestDto request, CancellationToken ct = default)
        {
            var subject = "Meetrix Check-In Reminder";
            var body = $"""
                Hello {request.UserName},

                Your booking is about to begin.

                Room: {request.RoomName}
                Start: {request.StartTime}
                End: {request.EndTime}

                Please check in using this link:
                {request.Link}

                Regards,
                Meetrix
                """;

            return SendEmailAsync(request.ToEmail, subject, body, ct);
        }

        public Task SendBookingReassignedAsync(BookingNotificationRequestDto request, CancellationToken ct = default)
        {
            var subject = "Meetrix Booking Reassigned";
            var body = $"""
                Hello {request.UserName},
                Your booking has been reassigned to a different room.
                New Room: {request.RoomName}
                Start: {request.StartTime}
                End: {request.EndTime}
                Purpose: {request.Purpose}
                Regards,
                Meetrix
                """;
            return SendEmailAsync(request.ToEmail, subject, body, ct);
        }

        public Task SendBookingNotReassignedAsync(BookingNotificationRequestDto request, CancellationToken ct = default)
        {
            var subject = "Booking Canceled and Not Reassigned";
            var body = $"""
                Hello {request.UserName},
                Your booking has been canceled and unfortunately could not be reassigned, as no matching rooms with similar facilities 
                were available. You can book a new room using the link below if you find a suitable one. We regret the inconvenience caused.

                Please book an alternative room using this link:
                {request.Link}

                Canceled Room: {request.RoomName}
                Start: {request.StartTime}
                End: {request.EndTime}
                Purpose: {request.Purpose}
                Regards,
                Meetrix
                """;
            return SendEmailAsync(request.ToEmail, subject, body, ct);
        }

        private async Task SendEmailAsync(string toEmail, string subject, string body, CancellationToken ct)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_smtpSettings.FromName, _smtpSettings.FromEmail));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;
            message.Body = new TextPart("plain") { Text = body };

            using var client = new SmtpClient();

            var secureSocketOption = _smtpSettings.UseSsl? SecureSocketOptions.SslOnConnect: SecureSocketOptions.StartTls;

            await client.ConnectAsync(_smtpSettings.Host, _smtpSettings.Port, secureSocketOption, ct);
            await client.AuthenticateAsync(_smtpSettings.UserName, _smtpSettings.Password, ct);
            await client.SendAsync(message, ct);
            await client.DisconnectAsync(true, ct);
        }
    }
}