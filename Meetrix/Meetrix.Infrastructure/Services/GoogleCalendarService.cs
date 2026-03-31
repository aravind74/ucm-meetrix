using Google.Apis.Auth.OAuth2;
using Google.Apis.Calendar.v3;
using Google.Apis.Calendar.v3.Data;
using Google.Apis.Services;
using Meetrix.Core.Contracts;
using Microsoft.Extensions.Configuration;

namespace Meetrix.Infrastructure.Services
{
    public class GoogleCalendarService : IGoogleCalendarService
    {
        private readonly CalendarService _calendarService;
        private readonly string _calendarId;

        public GoogleCalendarService(IConfiguration configuration)
        {
            var applicationName = configuration["GoogleCalendar:ApplicationName"];
            _calendarId = configuration["GoogleCalendar:CalendarId"]!;
            var keyPath = configuration["GoogleCalendar:ServiceAccountKeyPath"]!;

            GoogleCredential credential;
            using (var stream = new FileStream(keyPath, FileMode.Open, FileAccess.Read))
            {
                credential = GoogleCredential.FromStream(stream)
                    .CreateScoped(CalendarService.Scope.Calendar);
            }

            _calendarService = new CalendarService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = applicationName
            });
        }

        public async Task<string?> CreateBookingEventAsync(string roomName, DateTime startTime, DateTime endTime, string? purpose, CancellationToken ct = default)
        {
            var calendarEvent = new Event
            {
                Summary = $"Meetrix Booking - {roomName}",
                Description = string.IsNullOrWhiteSpace(purpose)
                    ? "Room booking created from Meetrix."
                    : $"Purpose: {purpose}",
                Start = new EventDateTime
                {
                    DateTimeDateTimeOffset = new DateTimeOffset(startTime),
                    TimeZone = "America/Chicago"
                },
                End = new EventDateTime
                {
                    DateTimeDateTimeOffset = new DateTimeOffset(endTime),
                    TimeZone = "America/Chicago"
                }
            };

            var request = _calendarService.Events.Insert(calendarEvent, _calendarId);
            var createdEvent = await request.ExecuteAsync(ct);
            return createdEvent.Id;
        }

        public async Task DeleteBookingEventAsync(string eventId, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(eventId))
                return;

            try
            {
                var request = _calendarService.Events.Delete(_calendarId, eventId);
                await request.ExecuteAsync(ct);
            }
            catch
            {

            }
        }
    }
}