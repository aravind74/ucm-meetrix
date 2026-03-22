namespace Meetrix.Core.DTOs;

public sealed record LoginResponseDto(
    string Token,
    int UserId,
    string Email,
    string FullName,
    string Role
);
