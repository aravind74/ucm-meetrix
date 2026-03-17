using AutoMapper;
using Meetrix.Core.Models;
using Meetrix.WebAPI.DTOs;

namespace Meetrix.WebAPI
{
    public class ApiMappingProfile : Profile
    {
        public ApiMappingProfile()
        {
            CreateMap<RoomRequestDto, RoomSummary>();
            CreateMap<RoomSummary, RoomResponseDto>();
        }
    }
}
