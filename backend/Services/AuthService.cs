using AppApi.Data;
using AppApi.DTOs;
using AppApi.Models;
using Microsoft.EntityFrameworkCore;

namespace AppApi.Services;

public interface IAuthService
{
    Task<AuthResponse?> LoginAsync(LoginRequest request);
    Task<AuthResponse?> RegisterAsync(RegisterRequest request);
}

public class AuthService(AppDbContext db, IJwtService jwt) : IAuthService
{
    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var user = await db.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.Active);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            return null;

        var (token, expiresAt) = jwt.GenerateToken(user);
        return new AuthResponse(token, user.Name, user.Email, user.Role, expiresAt);
    }

    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
    {
        if (await db.Users.AnyAsync(u => u.Email == request.Email))
            return null;

        var user = new User
        {
            Name     = request.Name,
            Email    = request.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role     = "User"
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        var (token, expiresAt) = jwt.GenerateToken(user);
        return new AuthResponse(token, user.Name, user.Email, user.Role, expiresAt);
    }
}
