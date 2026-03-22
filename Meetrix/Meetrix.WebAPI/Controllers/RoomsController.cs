using AutoMapper;
using Meetrix.Core.Contracts;
using Meetrix.Core.DTOs;
using Meetrix.Core.Models;
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
        public async Task<IActionResult> CreateRoom([FromBody] RoomRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // DTO → Core
            var room = _mapper.Map<RoomSummary>(dto);

            room.LastUpdatedBy = GetUserIdFromClaims();

            // Core → Service → DB
            var created = await _roomService.CreateRoomAsync(room);

            // Core → DTO
            var response = _mapper.Map<RoomResponseDto>(created);

            return CreatedAtAction(nameof(Get), new { id = response.RoomId }, response);
        }

        // GET /api/rooms?minCapacity=6&isAccessible=true
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int? minCapacity, [FromQuery] bool? isAccessible, CancellationToken ct)
        {
            var rooms = await _roomService.GetRoomsAsync(minCapacity, isAccessible, ct);

            var result = rooms.Select(r => new RoomResponseDto(
                r.RoomId,
                r.RoomName,
                r.Capacity,
                r.Floor,
                r.IsAccessible,
                r.Description,
                r.LastUpdatedBy,
                r.LastUpdated,
                r.IsActive    
            ));

            return Ok(new { items = result });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateRoom(int id, [FromBody] RoomResponseDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (id != dto.RoomId)
                return BadRequest("Route id and RoomId do not match.");

            int userId = GetUserIdFromClaims();

            var success = await _roomService.UpdateRoomAsync(
                new RoomSummary
                {
                    RoomId = dto.RoomId,
                    RoomName = dto.RoomName,
                    Capacity = dto.Capacity,
                    Floor = dto.Floor,
                    Description = dto.Description,
                    IsAccessible = dto.IsAccessible,
                    LastUpdatedBy = userId,
                }
            );

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
