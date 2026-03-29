using Meetrix.Core.Contracts;
using Meetrix.Core.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Meetrix.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class WaitlistController : ControllerBase
    {
        private readonly IWaitlistService _waitlistService;

        public WaitlistController(IWaitlistService waitlistService)
        {
            _waitlistService = waitlistService;
        }

        [HttpPost]
        public async Task<IActionResult> JoinWaitlist(
            [FromBody] WaitlistRequestDto request,
            CancellationToken ct)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserIdFromClaims();

            try
            {
                var result = await _waitlistService.JoinWaitlistAsync(request, userId, ct);
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
        public async Task<IActionResult> GetMyWaitlist(CancellationToken ct)
        {
            var userId = GetUserIdFromClaims();
            var result = await _waitlistService.GetMyWaitlistAsync(userId, ct);
            return Ok(new { items = result });
        }

        [HttpPut("{id:int}/cancel")]
        public async Task<IActionResult> CancelWaitlist(int id, CancellationToken ct)
        {
            var userId = GetUserIdFromClaims();

            try
            {
                var success = await _waitlistService.CancelWaitlistAsync(id, userId, ct);

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