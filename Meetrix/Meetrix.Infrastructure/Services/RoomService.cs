using Meetrix.Core.Contracts;
using Meetrix.Core.DTOs;
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

        public async Task<RoomSummary> CreateRoomAsync(RoomRequestDto request, int userId, CancellationToken ct = default)
        {
            var entity = new Infrastructure.Models.Room
            {
                RoomName = request.RoomName,
                Capacity = request.Capacity,
                Floor = request.Floor,
                Description = request.Description,
                IsAccesible = request.IsAccessible,
                LastUpdatedBy = userId,
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
            var rows = await (
                from r in _db.Rooms
                join rf in _db.Room_Facilities on r.RoomId equals rf.RoomId into roomFacilityGroup
                from rf in roomFacilityGroup.DefaultIfEmpty()
                join f in _db.Facilities on rf.FacilityId equals f.FacilityId into facilityGroup
                from f in facilityGroup.DefaultIfEmpty()
                where r.IsActive == true
                select new
                {
                    r.RoomId,
                    r.RoomName,
                    r.Capacity,
                    r.Floor,
                    r.IsAccesible,
                    r.Description,
                    r.LastUpdatedBy,
                    r.LastUpdated,
                    r.IsActive,
                    FacilityName = f != null ? f.FacilityName : null
                }
            ).ToListAsync(ct);

            var rooms = rows
                .GroupBy(x => new
                {
                    x.RoomId,
                    x.RoomName,
                    x.Capacity,
                    x.Floor,
                    x.IsAccesible,
                    x.Description,
                    x.LastUpdatedBy,
                    x.LastUpdated,
                    x.IsActive
                })
                .Select(g => new RoomSummary
                {
                    RoomId = g.Key.RoomId,
                    RoomName = g.Key.RoomName,
                    Capacity = g.Key.Capacity,
                    Floor = g.Key.Floor,
                    IsAccessible = g.Key.IsAccesible,
                    Description = g.Key.Description,
                    LastUpdatedBy = g.Key.LastUpdatedBy,
                    LastUpdated = g.Key.LastUpdated,
                    IsActive = g.Key.IsActive,
                    Facilities = g
                        .Where(x => !string.IsNullOrWhiteSpace(x.FacilityName))
                        .Select(x => x.FacilityName!)
                        .Distinct()
                        .ToList()
                })
                .OrderBy(x => x.RoomName)
                .ToList();

            return rooms;
        }

        public async Task<bool> UpdateRoomAsync(RoomSummary request, int userId, CancellationToken ct)
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
            room.LastUpdatedBy = userId;

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
