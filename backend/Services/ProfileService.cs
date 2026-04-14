using AppApi.Data;
using AppApi.DTOs;
using Microsoft.EntityFrameworkCore;

namespace AppApi.Services;

public interface IProfileService
{
    Task<ProfileDto?> GetProfileAsync(int userId);
    Task<ProfileDto?> UpdateProfileAsync(int userId, UpdateProfileRequest req);
}

public class ProfileService(AppDbContext db) : IProfileService
{
    public async Task<ProfileDto?> GetProfileAsync(int userId)
    {
        var u = await db.Users.FindAsync(userId);
        return u is null ? null : ToDto(u);
    }

    public async Task<ProfileDto?> UpdateProfileAsync(int userId, UpdateProfileRequest req)
    {
        var u = await db.Users.FindAsync(userId);
        if (u is null) return null;

        u.FirstName     = req.FirstName;
        u.LastName      = req.LastName;
        u.Name          = $"{req.FirstName} {req.LastName}";
        u.Gender        = req.Gender;
        u.DocType       = req.DocType;
        u.DocNumber     = req.DocNumber;
        u.WorkStatus    = req.WorkStatus;
        u.Street        = req.Street;
        u.StreetNumber  = req.StreetNumber;
        u.AddressType   = req.AddressType;
        u.Floor         = req.AddressType == "Edificio" ? req.Floor : null;
        u.Apartment     = req.AddressType == "Edificio" ? req.Apartment : null;
        u.City          = req.City;
        u.Province      = req.Province;
        u.ProfileComplete = true;
        u.UpdatedAt     = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return ToDto(u);
    }

    private static ProfileDto ToDto(Models.User u) => new(
        u.Id, u.Name, u.Email, u.Role,
        u.FirstName, u.LastName, u.Gender,
        u.DocType, u.DocNumber, u.WorkStatus,
        u.Street, u.StreetNumber, u.AddressType,
        u.Floor, u.Apartment, u.City, u.Province,
        u.ProfileComplete);
}
