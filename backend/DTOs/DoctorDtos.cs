namespace AppApi.DTOs;

public record DoctorRequest(
    string  FirstName,
    string  LastName,
    string  Dni,
    string  LicenseNumber,
    string  Specialty,
    string? Phone,
    string? Email,
    string  Street,
    string  StreetNumber,
    string  AddressType,
    string? Floor,
    string? Apartment,
    string  City,
    string  Province,
    string  Country
);

public record DoctorDto(
    int     Id,
    string  FirstName,
    string  LastName,
    string  FullName,
    string  Dni,
    string  LicenseNumber,
    string  Specialty,
    string? Phone,
    string? Email,
    string  Street,
    string  StreetNumber,
    string  AddressType,
    string? Floor,
    string? Apartment,
    string  City,
    string  Province,
    string  Country,
    bool    Active,
    DateTime CreatedAt
);

public record DoctorSelectDto(
    int    Id,
    string FullName,
    string Specialty,
    string LicenseNumber
);
