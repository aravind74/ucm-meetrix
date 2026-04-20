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

        public async Task<List<RoomSummary>> GetAlternativeRoomsAsync(AlternativeRoomsRequestDto request)
        {
            if (request.StartTime >= request.EndTime)
            {
                return new List<RoomSummary>();
            }

            // Step 1: Start with candidate rooms
            var roomsQuery = _db.Rooms
                .Where(r => r.RoomId != request.ExcludeRoomId)
                .AsQueryable();

            // Accessibility filter
            if (request.AccessFilter.Equals("accessible", StringComparison.OrdinalIgnoreCase))
            {
                roomsQuery = roomsQuery.Where(r => r.IsAccesible == true);
            }
            else if (request.AccessFilter.Equals("standard", StringComparison.OrdinalIgnoreCase))
            {
                roomsQuery = roomsQuery.Where(r => r.IsAccesible == false);
            }

            // Capacity filter
            if (request.CapacityFilter.Equals("small", StringComparison.OrdinalIgnoreCase))
            {
                roomsQuery = roomsQuery.Where(r => r.Capacity >= 1 && r.Capacity <= 4);
            }
            else if (request.CapacityFilter.Equals("medium", StringComparison.OrdinalIgnoreCase))
            {
                roomsQuery = roomsQuery.Where(r => r.Capacity >= 5 && r.Capacity <= 10);
            }
            else if (request.CapacityFilter.Equals("large", StringComparison.OrdinalIgnoreCase))
            {
                roomsQuery = roomsQuery.Where(r => r.Capacity >= 11);
            }

            var candidateRooms = await roomsQuery
                .Select(r => new
                {
                    r.RoomId,
                    r.RoomName,
                    r.Capacity,
                    r.Floor,
                    r.Description,
                    r.IsAccesible
                })
                .ToListAsync();

            if (!candidateRooms.Any())
            {
                return new List<RoomSummary>();
            }

            var candidateRoomIds = candidateRooms.Select(r => r.RoomId).ToList();

            // Step 2: Get facilities for candidate rooms using Room_Facility + Facility
            var roomFacilityMappings = await (
                from rf in _db.Room_Facilities
                join f in _db.Facilities on rf.FacilityId equals f.FacilityId
                where candidateRoomIds.Contains(rf.RoomId)
                select new
                {
                    rf.RoomId,
                    f.FacilityName
                }
            ).ToListAsync();

            var facilitiesByRoomId = roomFacilityMappings
                .GroupBy(x => x.RoomId)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(x => x.FacilityName?.Trim())
                          .Where(x => !string.IsNullOrWhiteSpace(x))
                          .Distinct(StringComparer.OrdinalIgnoreCase)
                          .ToList()
                );

            // Step 3: Apply selected facilities filter
            if (request.Facilities != null && request.Facilities.Count > 0)
            {
                candidateRooms = candidateRooms
                    .Where(room =>
                    {
                        var roomFacilities = facilitiesByRoomId.TryGetValue(room.RoomId, out var list)
                            ? list
                            : new List<string>();

                        return request.Facilities.All(selected =>
                            roomFacilities.Any(rf =>
                                string.Equals(rf, selected?.Trim(), StringComparison.OrdinalIgnoreCase)));
                    })
                    .ToList();

                if (!candidateRooms.Any())
                {
                    return new List<RoomSummary>();
                }

                candidateRoomIds = candidateRooms.Select(r => r.RoomId).ToList();
            }

            // Step 4: Exclude conflicting bookings
            var conflictingRoomIds = await _db.Bookings
                .Where(b =>
                    candidateRoomIds.Contains(b.RoomId) &&
                    b.IsActive == true &&
                    b.Status != "Cancelled" &&
                    request.StartTime < b.EndTime &&
                    request.EndTime > b.StartTime)
                .Select(b => b.RoomId)
                .Distinct()
                .ToListAsync();

            // Step 5: Build final response
            var result = candidateRooms
                .Where(r => !conflictingRoomIds.Contains(r.RoomId))
                .Select(r => new RoomSummary
                {
                    RoomId = r.RoomId,
                    RoomName = r.RoomName,
                    Capacity = r.Capacity,
                    Floor = r.Floor,
                    Description = r.Description,
                    IsAccessible = r.IsAccesible,
                    Facilities = facilitiesByRoomId.TryGetValue(r.RoomId, out var facilities)
                        ? facilities.OrderBy(x => x).ToList()
                        : new List<string>()
                })
                .OrderBy(r => r.Capacity)
                .ThenBy(r => r.RoomName)
                .ToList();

            return result;
        }
    }
}
