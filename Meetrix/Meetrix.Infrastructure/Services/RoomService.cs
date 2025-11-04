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
                    IsAccesible = r.IsAccesible,
                    Floor = r.Floor,
                    LastUpdated = r.LastUpdated,
                    LastUpdatedBy = r.LastUpdatedBy,
                    IsActive = r.IsActive,
                })
                .AsNoTracking()
                .ToListAsync(ct);

            return result;
        }
    }
}
