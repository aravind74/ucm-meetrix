using Meetrix.Core.Contracts;
using Meetrix.WebAPI.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Meetrix.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomsController : ControllerBase
    {
        private readonly IRoomService _roomService;

        public RoomsController(IRoomService roomService)
        {
            _roomService = roomService;
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
                r.IsAccesible,
                r.Description,
                r.LastUpdatedBy,
                r.LastUpdated,
                r.IsActive    
            ));

            return Ok(new { items = result });
        }
    }
}
