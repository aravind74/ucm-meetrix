using Meetrix.Core.Contracts;
using Meetrix.Core.Models;
using Meetrix.WebAPI.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Meetrix.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IConfiguration _configuration;
        public AuthController(IAuthService authService, IConfiguration configuration)
        {
            _authService = authService;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto registerDto, CancellationToken ct)
        {
            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var req = new UserRegisterRequest
            {
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Email = registerDto.Email,
                Password = registerDto.Password,
                IsDifferentlyAbled = registerDto.IsDifferentlyAbled,
                LastUpdatedBy = registerDto.LastUpdatedBy,
            };
            var userId = await _authService.RegisterAsync(req, ct);
            return Ok(new {userId});
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto, CancellationToken ct)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var res = await _authService.ValidateCredentialsAsync(dto.Email, dto.Password, ct);
            if (!res.ok) return Unauthorized("Invalid credentials.");

            // Build JWT
            var issuer = _configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer missing");
            var audience = _configuration["Jwt:Audience"] ?? throw new InvalidOperationException("Jwt:Audience missing");
            var keyStr = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key missing");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyStr));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, res.userId.ToString()),
            new(JwtRegisteredClaimNames.Sub, res.userId.ToString()),
            new(JwtRegisteredClaimNames.Email, res.email),
            new(ClaimTypes.Role, res.roleName)
        };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(6),
                signingCredentials: creds
            );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);
            return Ok(new LoginResponseDto(jwt, res.userId, res.email, res.fullName, res.roleName));
        }
    }
}
