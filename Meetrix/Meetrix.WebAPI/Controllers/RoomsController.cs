using AutoMapper;
using Azure.Core;
using Meetrix.Core.Contracts;
using Meetrix.Core.DTOs;
using Meetrix.Core.Models;
using Meetrix.Infrastructure.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Meetrix.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomsController : ControllerBase
    {
        private readonly IRoomService _roomService;
        private readonly IMapper _mapper;

        public RoomsController(IRoomService roomService, IMapper mapper)
        {
            _roomService = roomService;
            _mapper = mapper;
        }

        // POST: api/rooms
        [HttpPost]
        public async Task<IActionResult> CreateRoom([FromBody] RoomRequestDto request, CancellationToken ct)
        {

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserIdFromClaims();

            try
            {
                var result = await _roomService.CreateRoomAsync(request, userId, ct);
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

        // GET /api/rooms?minCapacity=6&isAccessible=true
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int? minCapacity, [FromQuery] bool? isAccessible, CancellationToken ct)
        {
            var result = await _roomService.GetRoomsAsync(minCapacity, isAccessible, ct);
            return Ok(new { items = result });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateRoom(int id, [FromBody] RoomSummary request, CancellationToken ct)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (id != request.RoomId)
                return BadRequest("Route id and RoomId do not match.");

            int userId = GetUserIdFromClaims();

            var success = await _roomService.UpdateRoomAsync(request, userId, ct);

            if (!success)
                return NotFound();

            return NoContent();
        }


        // DELETE: api/rooms/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            int userId = GetUserIdFromClaims(); // 0 if not wired

            var success = await _roomService.DeleteRoomAsync(id, userId);

            if (!success)
                return NotFound();

            return NoContent();
        }

        private int GetUserIdFromClaims()
        {
            // Try NameIdentifier first (since you set it)
            var claim =
                User.FindFirst(ClaimTypes.NameIdentifier) ??
                User.FindFirst(JwtRegisteredClaimNames.Sub);

            if (claim == null)
                return 0;

            return int.TryParse(claim.Value, out var id) ? id : 0;
        }

    }
}
