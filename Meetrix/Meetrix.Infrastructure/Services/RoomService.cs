using Meetrix.Core.Contracts;
using Meetrix.Core.Models;
using Meetrix.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Meetrix.Infrastructure.Services
{
    public class RoomService : IRoomService
    {
        private readonly AppDbContext _db;
        public RoomService(AppDbContext db) => _db = db;

        public async Task<RoomSummary> CreateRoomAsync(RoomSummary room)
        {
            var entity = new Infrastructure.Models.Room
            {
                RoomName = room.RoomName,
                Capacity = room.Capacity,
                Floor = room.Floor,
                Description = room.Description,
                IsAccesible = room.IsAccessible,
                LastUpdatedBy = room.LastUpdatedBy,
                LastUpdated = DateTime.UtcNow,
                IsActive = true
            };

            _db.Rooms.Add(entity);
            await _db.SaveChangesAsync();

            // Map back to Core model manually
            return new RoomSummary
            {
                RoomId = entity.RoomId,
                RoomName = entity.RoomName,
                Capacity = entity.Capacity,
                Floor = entity.Floor,
                Description = entity.Description,
                IsAccessible = entity.IsAccesible,
                LastUpdated = entity.LastUpdated,
                LastUpdatedBy = entity.LastUpdatedBy,
                IsActive = entity.IsActive
            };
        }

        public async Task<IReadOnlyList<RoomSummary>> GetRoomsAsync(int? minCapacity, bool? isAccessible, CancellationToken ct = default)
        {
            var query = _db.Rooms.AsQueryable();

            if (minCapacity is > 0)
                query = query.Where(r => r.Capacity >= minCapacity);

            if (isAccessible is not null)
                query = query.Where(r => r.IsAccesible == isAccessible);

            var result = await query
                .Select(r => new RoomSummary
                {
                    RoomId = r.RoomId,
                    RoomName = r.RoomName,
                    Capacity = r.Capacity,
                    IsAccessible = r.IsAccesible,
                    Floor = r.Floor,
                    Description = r.Description,
                    LastUpdated = r.LastUpdated,
                    LastUpdatedBy = r.LastUpdatedBy,
                    IsActive = r.IsActive,
                })
                .AsNoTracking()
                .OrderBy(r => r.RoomName)
                .ToListAsync(ct);

            return result;
        }

        public async Task<bool> UpdateRoomAsync(RoomSummary request)
        {
            var room = await _db.Rooms
                .FirstOrDefaultAsync(r => r.RoomId == request.RoomId && r.IsActive == true);

            if (room == null)
                return false;

            room.RoomName = request.RoomName.Trim();
            room.Capacity = request.Capacity;
            room.Floor = request.Floor;
            room.Description = request.Description;
            room.IsAccesible = request.IsAccessible;
            room.LastUpdated = DateTime.UtcNow;
            room.LastUpdatedBy = request.LastUpdatedBy;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteRoomAsync(int roomId, int updatedByUserId)
        {
            var room = await _db.Rooms
                .FirstOrDefaultAsync(r => r.RoomId == roomId && r.IsActive == true);

            if (room == null)
                return false;

            room.IsActive = false;
            room.LastUpdated = DateTime.UtcNow;
            room.LastUpdatedBy = updatedByUserId;

            await _db.SaveChangesAsync();
            return true;
        }
    }
}
