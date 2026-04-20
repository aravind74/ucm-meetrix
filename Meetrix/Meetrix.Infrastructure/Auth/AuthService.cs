using Meetrix.Core.Contracts;
using Meetrix.Core.Models;
using Meetrix.Infrastructure.Auth;
using Meetrix.Infrastructure.Data;
using Meetrix.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;

namespace Meetrix.Infrastructure.Auth;

public sealed class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    public AuthService(AppDbContext db) => _db = db;

    public async Task<int> RegisterAsync(UserRegisterRequest request, CancellationToken ct = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var exists = await _db.Users.AnyAsync(u => u.Email == email, ct);
        if (exists) throw new InvalidOperationException("Email already registered.");

        var hash = BcryptPasswordHasher.Hash(request.Password);

        var entity = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = email,
            PasswordHash = hash,
            UserRoleId = 2,
            IsDifferentlyAbled = request.IsDifferentlyAbled,
            IsActive = true,
            LastUpdated = DateTime.UtcNow,
            LastUpdatedBy = request.LastUpdatedBy
        };

        _db.Users.Add(entity);
        await _db.SaveChangesAsync(ct);
        return entity.UserId;
    }

    public async Task<(bool ok, int userId, string email, string fullName, string roleName, bool? isDifferentlyAbled)> ValidateCredentialsAsync(string email, string password, CancellationToken ct = default)
    {
        email = email.Trim().ToLowerInvariant();

        var user = await _db.Users
            .Include(u => u.UserRole)
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.Email == email && u.IsActive == true, ct);

        if (user is null) return (false, 0, "", "", "", false);

        var ok = BcryptPasswordHasher.Verify(password, user.PasswordHash!);
        if (!ok) return (false, 0, "", "", "", false);

        var fullName = string.Join(' ', new[] { user.FirstName, user.LastName }.Where(s => !string.IsNullOrWhiteSpace(s)));
        var roleName = user.UserRole?.RoleName ?? "Employee";
        return (true, user.UserId, user.Email!, fullName, roleName, user.IsDifferentlyAbled);
    }
}