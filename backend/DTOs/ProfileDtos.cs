namespace AppApi.DTOs;

public record UpdateProfileRequest(
    string  FirstName,
    string  LastName,
    string  Gender,
    string  DocType,
    string  DocNumber,
    string  WorkStatus,
    string  Street,
    string  StreetNumber,
    string  AddressType,
    string? Floor,
    string? Apartment,
    string  City,
    string  Province
);

public record ProfileDto(
    int     Id,
    string  Name,
    string  Email,
    string  Role,
    string? FirstName,
    string? LastName,
    string? Gender,
    string? DocType,
    string? DocNumber,
    string? WorkStatus,
    string? Street,
    string? StreetNumber,
    string? AddressType,
    string? Floor,
    string? Apartment,
    string? City,
    string? Province,
    bool    ProfileComplete
);
