namespace Meetrix.WebAPI.DTOs
{
    public sealed record RoomResponseDto (
        int RoomId,
        string RoomName,
        int? Capacity,
        int? Floor,
        bool? IsAccessible,
        string Description,
        int? LastUpdatedBy,
        DateTime? LastUpdated,
        bool? IsActive
    );
}
