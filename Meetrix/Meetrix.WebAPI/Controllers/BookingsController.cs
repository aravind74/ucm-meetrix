using Meetrix.Core.Contracts;
using Meetrix.Core.DTOs;
using Meetrix.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Meetrix.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        public BookingsController(IBookingService bookingService) 
        {
            _bookingService = bookingService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] BookingRequestDto request, CancellationToken ct)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserIdFromClaims();

            try
            {
                var result = await _bookingService.CreateBookingAsync(request, userId, ct);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetBooking(CancellationToken ct)
        {
            var userId = GetUserIdFromClaims();
            var result = await _bookingService.GetBookingsAsync(userId, ct);
            return Ok(new { items = result });
        }

        [HttpPut("{id:int}/cancel")]
        public async Task<IActionResult> CancelBooking(int id, CancellationToken ct)
        {
            var userId = GetUserIdFromClaims();

            try
            {
                var success = await _bookingService.CancelBookingAsync(id, userId, ct);
                if (!success)
                    return NotFound();

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }

        [HttpGet("availability")]
        public async Task<IActionResult> GetRoomAvailability([FromQuery] int roomId, [FromQuery] DateTime date, CancellationToken ct)
        {
            try
            {
                var result = await _bookingService.GetRoomAvailabilityAsync(roomId, date, ct);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPost("{id:int}/check-in")]
        public async Task<IActionResult> CheckInBooking(int id, CancellationToken ct)
        {
            var userId = GetUserIdFromClaims();

            try
            {
                var success = await _bookingService.CheckInBookingAsync(id, userId, ct);

                if (!success)
                    return NotFound();

                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private int GetUserIdFromClaims()
        {
            var claim =
                User.FindFirst(ClaimTypes.NameIdentifier) ??
                User.FindFirst(JwtRegisteredClaimNames.Sub);

            if (claim == null)
                return 0;

            return int.TryParse(claim.Value, out var id) ? id : 0;
        }


    }
}
