namespace AppApi.Models;

public class User
{
    public int      Id        { get; set; }
    public string   Name      { get; set; } = string.Empty;
    public string   Email     { get; set; } = string.Empty;
    public string   Password  { get; set; } = string.Empty;
    public string   Role      { get; set; } = "User";
    public bool     Active    { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // ── Datos personales ──────────────────────────
    public string? FirstName  { get; set; }
    public string? LastName   { get; set; }
    public string? Gender     { get; set; }  // Masculino | Femenino | Otro
    public string? DocType    { get; set; }  // DNI | LLC
    public string? DocNumber  { get; set; }
    public string? WorkStatus { get; set; }  // Empleado | Desempleado | Autónomo

    // ── Domicilio ─────────────────────────────────
    public string? Street       { get; set; }
    public string? StreetNumber { get; set; }
    public string? AddressType  { get; set; }  // Casa | Edificio
    public string? Floor        { get; set; }
    public string? Apartment    { get; set; }
    public string? City         { get; set; }
    public string? Province     { get; set; }

    public bool ProfileComplete { get; set; } = false;
}
