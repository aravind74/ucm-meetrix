using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Meetrix.Core.Contracts
{
    public interface IGoogleCalendarService
    {
        Task<string?> CreateBookingEventAsync(string roomName, DateTime startTime, DateTime endTime, string? purpose, CancellationToken ct = default);
        Task DeleteBookingEventAsync(string eventId, CancellationToken ct = default);
    }
}
