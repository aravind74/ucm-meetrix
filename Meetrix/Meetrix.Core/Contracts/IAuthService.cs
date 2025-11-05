using Meetrix.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Meetrix.Core.Contracts
{
    public interface IAuthService
    {
        Task<int> RegisterAsync(UserRegisterRequest request, CancellationToken ct = default);
        Task<(bool ok, int userId, string email, string fullName, string roleName)> ValidateCredentialsAsync(string email, string password, CancellationToken ct = default);
    }
}
