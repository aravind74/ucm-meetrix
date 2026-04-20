using Meetrix.Core.Contracts;
using Meetrix.Core.DTOs;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;

namespace Meetrix.Infrastructure.Services
{
    public class NotificationClient : INotificationClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<NotificationClient> _logger;

        public NotificationClient(HttpClient httpClient, ILogger<NotificationClient> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task SendBookingCreatedAsync(BookingNotificationRequestDto request, CancellationToken ct = default)
        {
            await PostAsync("api/notifications/booking-created", request, ct);
        }

        public async Task SendBookingCancelledAsync(BookingNotificationRequestDto request, CancellationToken ct = default)
        {
            await PostAsync("api/notifications/booking-cancelled", request, ct);
        }

        public async Task SendWaitlistAssignedAsync(BookingNotificationRequestDto request, CancellationToken ct = default)
        {
            await PostAsync("api/notifications/waitlist-assigned", request, ct);
        }

        public async Task SendCheckInReminderAsync(BookingNotificationRequestDto request, CancellationToken ct = default)
        {
            await PostAsync("api/notifications/checkin-reminder", request, ct);
        }

        public async Task SendBookingReassignedAsync(BookingNotificationRequestDto request, CancellationToken ct = default)
        {
            await PostAsync("api/notifications/booking-reassigned", request, ct);
        }

        public async Task SendBookingNotReassignedAsync(BookingNotificationRequestDto request, CancellationToken ct = default)
        {
            await PostAsync("/api/notifications/booking-not-reassigned", request, ct);
        }

        private async Task PostAsync(string endpoint, BookingNotificationRequestDto request, CancellationToken ct)
        {
            try
            {
                var response = await _httpClient.PostAsJsonAsync(endpoint, request, ct);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync(ct);
                    _logger.LogWarning(
                        "NotificationService call to {Endpoint} failed with status {StatusCode}. Response: {Response}",
                        endpoint,
                        response.StatusCode,
                        error);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to call NotificationService endpoint {Endpoint}", endpoint);
            }
        }
    }
}
