using Meetrix.Core.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Meetrix.WebAPI.Controllers
{
    [Route("api/[controller]/bookings")]
    [ApiController]
    [Authorize (Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public AdminController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentBookings(CancellationToken ct)
        {
            var result = await _bookingService.GetCurrentBookingsAdminAsync(ct);
            return Ok(new { items = result });
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetBookingHistory(CancellationToken ct)
        {
            var result = await _bookingService.GetBookingHistoryAdminAsync(ct);
            return Ok(new { items = result });
        }

        [HttpGet("cancelled")]
        public async Task<IActionResult> GetCancelledBookings(CancellationToken ct)
        {
            var result = await _bookingService.GetCancelledBookingsAdminAsync(ct);
            return Ok(new { items = result });
        }
    }
}
