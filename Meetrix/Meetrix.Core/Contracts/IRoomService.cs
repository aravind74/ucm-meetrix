using Meetrix.Core.DTOs;
using Meetrix.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Meetrix.Core.Contracts
{
    public interface IRoomService
    {
        Task<RoomSummary> CreateRoomAsync(RoomRequestDto request, int userId, CancellationToken ct = default);
        Task<IReadOnlyList<RoomSummary>> GetRoomsAsync(int? minCapacity, bool? isAccessible, CancellationToken ct = default);
        Task<bool> UpdateRoomAsync(RoomSummary request, int userId, CancellationToken ct);
        Task<bool> DeleteRoomAsync(int roomId, int updatedByUserId);
        Task<List<RoomSummary>> GetAlternativeRoomsAsync(AlternativeRoomsRequestDto request);
    }
}
