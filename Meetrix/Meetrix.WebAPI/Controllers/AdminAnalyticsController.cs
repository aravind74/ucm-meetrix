using Meetrix.Core.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Meetrix.WebAPI.Controllers
{
    [Route("api/admin/analytics")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminAnalyticsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public AdminAnalyticsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardSummary(CancellationToken ct)
        {
            var result = await _bookingService.GetAdminDashboardSummaryAsync(ct);
            return Ok(result);
        }
    }
}
