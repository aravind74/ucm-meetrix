using Meetrix.Core.DTOs;
using Meetrix.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Meetrix.Core.Contracts
{
    public interface IWaitlistService
    {
        Task<WaitlistSummary> JoinWaitlistAsync(WaitlistRequestDto request, int userId, CancellationToken ct = default);
        Task<IReadOnlyList<WaitlistSummary>> GetMyWaitlistAsync(int userId, CancellationToken ct = default);
        Task<bool> CancelWaitlistAsync(int waitlistId, int userId, CancellationToken ct = default);
        Task<bool> TryAssignNextFromWaitlistAsync(int roomId, DateTime startTime, DateTime endTime, CancellationToken ct = default);
    }
}
