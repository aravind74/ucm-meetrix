using AutoMapper;
using Meetrix.Core.Models;
using Meetrix.Infrastructure.Models;

public class InfrastructureMappingProfile : Profile
{
    public InfrastructureMappingProfile()
    {
        CreateMap<RoomSummary, Room>().ReverseMap();
    }
}