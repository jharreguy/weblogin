using AppApi.Data;
using AppApi.DTOs;
using Microsoft.EntityFrameworkCore;

namespace AppApi.Services;

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllAsync();
    Task<UserDto?> GetByIdAsync(int id);
    Task<UserDto?> UpdateAsync(int id, UpdateUserRequest request);
    Task<bool> DeleteAsync(int id);
}

public class UserService(AppDbContext db) : IUserService
{
    public async Task<IEnumerable<UserDto>> GetAllAsync() =>
        await db.Users
            .Where(u => u.Active)
            .Select(u => new UserDto(u.Id, u.Name, u.Email, u.Role, u.Active, u.CreatedAt))
            .ToListAsync();

    public async Task<UserDto?> GetByIdAsync(int id)
    {
        var u = await db.Users.FindAsync(id);
        return u is null ? null : new UserDto(u.Id, u.Name, u.Email, u.Role, u.Active, u.CreatedAt);
    }

    public async Task<UserDto?> UpdateAsync(int id, UpdateUserRequest request)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null) return null;

        user.Name      = request.Name;
        user.Email     = request.Email;
        user.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(request.Password))
            user.Password = BCrypt.Net.BCrypt.HashPassword(request.Password);

        await db.SaveChangesAsync();
        return new UserDto(user.Id, user.Name, user.Email, user.Role, user.Active, user.CreatedAt);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null) return false;

        user.Active    = false;
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return true;
    }
}
