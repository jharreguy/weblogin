using AppApi.Data;
using AppApi.DTOs;
using AppApi.Models;
using Microsoft.EntityFrameworkCore;

namespace AppApi.Services;

public interface IDoctorService
{
    Task<DoctorDto>                   CreateAsync(DoctorRequest req, int userId);
    Task<DoctorDto?>                  GetByIdAsync(int id);
    Task<IEnumerable<DoctorDto>>      GetAllAsync();
    Task<IEnumerable<DoctorSelectDto>> GetForSelectAsync();
    Task<DoctorDto?>                  UpdateAsync(int id, DoctorRequest req);
    Task<bool>                        DeleteAsync(int id);
}

public class DoctorService(AppDbContext db) : IDoctorService
{
    public async Task<DoctorDto> CreateAsync(DoctorRequest req, int userId)
    {
        var doctor = new Doctor
        {
            FirstName     = req.FirstName,
            LastName      = req.LastName,
            Dni           = req.Dni,
            LicenseNumber = req.LicenseNumber,
            Specialty     = req.Specialty,
            Phone         = req.Phone,
            Email         = req.Email,
            Street        = req.Street,
            StreetNumber  = req.StreetNumber,
            AddressType   = req.AddressType,
            Floor         = req.AddressType == "Edificio" ? req.Floor : null,
            Apartment     = req.AddressType == "Edificio" ? req.Apartment : null,
            City          = req.City,
            Province      = req.Province,
            Country       = req.Country,
            CreatedBy     = userId
        };

        db.Doctors.Add(doctor);
        await db.SaveChangesAsync();
        return ToDto(doctor);
    }

    public async Task<DoctorDto?> GetByIdAsync(int id)
    {
        var d = await db.Doctors.FindAsync(id);
        return d is null || !d.Active ? null : ToDto(d);
    }

    public async Task<IEnumerable<DoctorDto>> GetAllAsync() =>
        await db.Doctors
            .Where(d => d.Active)
            .OrderBy(d => d.LastName)
            .Select(d => ToDto(d))
            .ToListAsync();

    public async Task<IEnumerable<DoctorSelectDto>> GetForSelectAsync() =>
        await db.Doctors
            .Where(d => d.Active)
            .OrderBy(d => d.LastName)
            .Select(d => new DoctorSelectDto(
                d.Id,
                $"Dr/a. {d.LastName}, {d.FirstName}",
                d.Specialty,
                d.LicenseNumber))
            .ToListAsync();

    public async Task<DoctorDto?> UpdateAsync(int id, DoctorRequest req)
    {
        var d = await db.Doctors.FindAsync(id);
        if (d is null || !d.Active) return null;

        d.FirstName     = req.FirstName;
        d.LastName      = req.LastName;
        d.Dni           = req.Dni;
        d.LicenseNumber = req.LicenseNumber;
        d.Specialty     = req.Specialty;
        d.Phone         = req.Phone;
        d.Email         = req.Email;
        d.Street        = req.Street;
        d.StreetNumber  = req.StreetNumber;
        d.AddressType   = req.AddressType;
        d.Floor         = req.AddressType == "Edificio" ? req.Floor : null;
        d.Apartment     = req.AddressType == "Edificio" ? req.Apartment : null;
        d.City          = req.City;
        d.Province      = req.Province;
        d.Country       = req.Country;
        d.UpdatedAt     = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return ToDto(d);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var d = await db.Doctors.FindAsync(id);
        if (d is null) return false;
        d.Active    = false;
        d.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return true;
    }

    private static DoctorDto ToDto(Doctor d) => new(
        d.Id, d.FirstName, d.LastName,
        $"Dr/a. {d.LastName}, {d.FirstName}",
        d.Dni, d.LicenseNumber, d.Specialty,
        d.Phone, d.Email,
        d.Street, d.StreetNumber, d.AddressType,
        d.Floor, d.Apartment,
        d.City, d.Province, d.Country,
        d.Active, d.CreatedAt);
}
