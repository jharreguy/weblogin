using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AppApi.Models;
using Microsoft.IdentityModel.Tokens;

namespace AppApi.Services;

public interface IJwtService
{
    (string token, DateTime expiresAt) GenerateToken(User user);
    ClaimsPrincipal? ValidateToken(string token);
}

public class JwtService(IConfiguration config) : IJwtService
{
    public (string token, DateTime expiresAt) GenerateToken(User user)
    {
        var key     = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var creds   = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var hours   = int.Parse(config["Jwt:ExpirationHours"] ?? "8");
        var expires = DateTime.UtcNow.AddHours(hours);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub,   user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Name,  user.Name),
            new Claim(ClaimTypes.Role,               user.Role),
            new Claim(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer:             config["Jwt:Issuer"],
            audience:           config["Jwt:Audience"],
            claims:             claims,
            expires:            expires,
            signingCredentials: creds);

        return (new JwtSecurityTokenHandler().WriteToken(token), expires);
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        var key     = Encoding.UTF8.GetBytes(config["Jwt:Key"]!);

        try
        {
            return handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuer           = true,
                ValidateAudience         = true,
                ValidateLifetime         = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer              = config["Jwt:Issuer"],
                ValidAudience            = config["Jwt:Audience"],
                IssuerSigningKey         = new SymmetricSecurityKey(key)
            }, out _);
        }
        catch { return null; }
    }
}
