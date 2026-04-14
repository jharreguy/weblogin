using AppApi.Data;
using AppApi.DTOs;
using AppApi.Models;
using Microsoft.EntityFrameworkCore;

namespace AppApi.Services;

public interface IClientService
{
    Task<ClientDto>                   CreateAsync(ClientRequest req, int userId);
    Task<ClientDto?>                  GetByIdAsync(int id);
    Task<ClientSearchResult?>         GetByDniAsync(string dni);
    Task<IEnumerable<ClientDto>>      GetAllAsync();
    Task<ClientDto?>                  UpdateAsync(int id, ClientRequest req);
    Task<bool>                        DeleteAsync(int id);
}

public class ClientService(AppDbContext db) : IClientService
{
    public async Task<ClientDto> CreateAsync(ClientRequest req, int userId)
    {
        var client = new Client
        {
            FirstName           = req.FirstName,
            LastName            = req.LastName,
            Dni                 = req.Dni,
            Phone               = req.Phone,
            Email               = req.Email,
            Street              = req.Street,
            StreetNumber        = req.StreetNumber,
            AddressType         = req.AddressType,
            Floor               = req.AddressType == "Edificio" ? req.Floor : null,
            Apartment           = req.AddressType == "Edificio" ? req.Apartment : null,
            City                = req.City,
            Province            = req.Province,
            Country             = req.Country,
            HasHealthInsurance  = req.HasHealthInsurance,
            HealthInsuranceName = req.HasHealthInsurance ? req.HealthInsuranceName : null,
            CreatedBy           = userId
        };

        db.Clients.Add(client);
        await db.SaveChangesAsync();
        return ToDto(client);
    }

    public async Task<ClientDto?> GetByIdAsync(int id)
    {
        var c = await db.Clients.FindAsync(id);
        return c is null || !c.Active ? null : ToDto(c);
    }

    public async Task<ClientSearchResult?> GetByDniAsync(string dni)
    {
        var c = await db.Clients
            .FirstOrDefaultAsync(x => x.Dni == dni && x.Active);
        if (c is null) return null;
        return new ClientSearchResult(
            c.Id, $"{c.FirstName} {c.LastName}",
            c.Dni, c.Phone,
            c.HasHealthInsurance, c.HealthInsuranceName);
    }

    public async Task<IEnumerable<ClientDto>> GetAllAsync() =>
        await db.Clients
            .Where(c => c.Active)
            .OrderBy(c => c.LastName)
            .Select(c => ToDto(c))
            .ToListAsync();

    public async Task<ClientDto?> UpdateAsync(int id, ClientRequest req)
    {
        var c = await db.Clients.FindAsync(id);
        if (c is null || !c.Active) return null;

        c.FirstName           = req.FirstName;
        c.LastName            = req.LastName;
        c.Dni                 = req.Dni;
        c.Phone               = req.Phone;
        c.Email               = req.Email;
        c.Street              = req.Street;
        c.StreetNumber        = req.StreetNumber;
        c.AddressType         = req.AddressType;
        c.Floor               = req.AddressType == "Edificio" ? req.Floor : null;
        c.Apartment           = req.AddressType == "Edificio" ? req.Apartment : null;
        c.City                = req.City;
        c.Province            = req.Province;
        c.Country             = req.Country;
        c.HasHealthInsurance  = req.HasHealthInsurance;
        c.HealthInsuranceName = req.HasHealthInsurance ? req.HealthInsuranceName : null;
        c.UpdatedAt           = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return ToDto(c);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var c = await db.Clients.FindAsync(id);
        if (c is null) return false;
        c.Active    = false;
        c.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return true;
    }

    private static ClientDto ToDto(Client c) => new(
        c.Id, c.FirstName, c.LastName,
        $"{c.FirstName} {c.LastName}",
        c.Dni, c.Phone, c.Email,
        c.Street, c.StreetNumber, c.AddressType,
        c.Floor, c.Apartment,
        c.City, c.Province, c.Country,
        c.HasHealthInsurance, c.HealthInsuranceName,
        c.Active, c.CreatedAt);
}
