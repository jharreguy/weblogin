namespace AppApi.Models;

public class Doctor
{
    public int      Id            { get; set; }

    // Datos personales
    public string   FirstName     { get; set; } = string.Empty;
    public string   LastName      { get; set; } = string.Empty;
    public string   Dni           { get; set; } = string.Empty;
    public string   LicenseNumber { get; set; } = string.Empty; // Matrícula
    public string   Specialty     { get; set; } = string.Empty;
    public string?  Phone         { get; set; }
    public string?  Email         { get; set; }

    // Domicilio
    public string   Street        { get; set; } = string.Empty;
    public string   StreetNumber  { get; set; } = string.Empty;
    public string   AddressType   { get; set; } = "Casa";
    public string?  Floor         { get; set; }
    public string?  Apartment     { get; set; }
    public string   City          { get; set; } = string.Empty;
    public string   Province      { get; set; } = string.Empty;
    public string   Country       { get; set; } = "Argentina";

    // Control
    public bool     Active        { get; set; } = true;
    public int      CreatedBy     { get; set; }
    public DateTime CreatedAt     { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt     { get; set; } = DateTime.UtcNow;

    // Navigation
    public User?    Creator       { get; set; }
}
