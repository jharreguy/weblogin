namespace AppApi.DTOs;

public record ClientRequest(
    string  FirstName,
    string  LastName,
    string  Dni,
    string  Phone,
    string? Email,
    string  Street,
    string  StreetNumber,
    string  AddressType,
    string? Floor,
    string? Apartment,
    string  City,
    string  Province,
    string  Country,
    bool    HasHealthInsurance,
    string? HealthInsuranceName
);

public record ClientDto(
    int     Id,
    string  FirstName,
    string  LastName,
    string  FullName,
    string  Dni,
    string  Phone,
    string? Email,
    string  Street,
    string  StreetNumber,
    string  AddressType,
    string? Floor,
    string? Apartment,
    string  City,
    string  Province,
    string  Country,
    bool    HasHealthInsurance,
    string? HealthInsuranceName,
    bool    Active,
    DateTime CreatedAt
);

public record ClientSearchResult(
    int    Id,
    string FullName,
    string Dni,
    string Phone,
    bool   HasHealthInsurance,
    string? HealthInsuranceName
);
