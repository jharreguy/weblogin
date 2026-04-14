namespace AppApi.Models;

public class Appointment
{
    public int      Id               { get; set; }
    public int      ClientId         { get; set; }
    public int      DoctorId         { get; set; }

    public DateTime AppointmentDate  { get; set; }  // solo la fecha
    public TimeSpan AppointmentTime  { get; set; }  // solo la hora
    public int      DurationMinutes  { get; set; } = 50;
    public string   Status           { get; set; } = "Pendiente";
    public string?  Notes            { get; set; }

    public int      CreatedBy        { get; set; }
    public DateTime CreatedAt        { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt        { get; set; } = DateTime.UtcNow;

    public Client?  Client           { get; set; }
    public Doctor?  Doctor           { get; set; }
    public User?    Creator          { get; set; }
}