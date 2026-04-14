using AppApi.Data;
using AppApi.DTOs;
using AppApi.Models;
using Microsoft.EntityFrameworkCore;

namespace AppApi.Services;

public interface IAppointmentService
{
    Task<AppointmentDto>               CreateAsync(AppointmentRequest req, int userId);
    Task<AppointmentDto?>              GetByIdAsync(int id);
    Task<IEnumerable<AppointmentDto>>  GetAllAsync();
    Task<IEnumerable<AppointmentDto>>  GetByDoctorAsync(int doctorId);
    Task<IEnumerable<AppointmentDto>>  GetByClientAsync(int clientId);
    Task<AppointmentDto?>              UpdateStatusAsync(int id, string status);
    Task<bool>                         DeleteAsync(int id);
    Task<List<DoctorAvailabilityDto>>  GetAvailabilityAsync(int doctorId, string fromDate, int days);
    Task<IEnumerable<string>>          GetSpecialtiesAsync();
}

public class AppointmentService(AppDbContext db) : IAppointmentService
{
    private static readonly TimeSpan WorkStart = new(8, 0, 0);
    private static readonly TimeSpan WorkEnd   = new(15, 0, 0);
    private const int SlotMinutes = 50;

    public async Task<AppointmentDto> CreateAsync(AppointmentRequest req, int userId)
    {
        var date = DateTime.Parse(req.AppointmentDate).Date;
        var time = TimeSpan.Parse(req.AppointmentTime);

        var appt = new Appointment
        {
            ClientId        = req.ClientId,
            DoctorId        = req.DoctorId,
            AppointmentDate = date,
            AppointmentTime = time,
            DurationMinutes = req.DurationMinutes,
            Notes           = req.Notes,
            CreatedBy       = userId
        };

        db.Appointments.Add(appt);
        await db.SaveChangesAsync();

        await db.Entry(appt).Reference(a => a.Client).LoadAsync();
        await db.Entry(appt).Reference(a => a.Doctor).LoadAsync();
        return ToDto(appt);
    }

    public async Task<AppointmentDto?> GetByIdAsync(int id)
    {
        var a = await db.Appointments
            .Include(x => x.Client)
            .Include(x => x.Doctor)
            .FirstOrDefaultAsync(x => x.Id == id);
        return a is null ? null : ToDto(a);
    }

    public async Task<IEnumerable<AppointmentDto>> GetAllAsync() =>
        (await db.Appointments
            .Include(a => a.Client)
            .Include(a => a.Doctor)
            .OrderByDescending(a => a.AppointmentDate)
            .ThenBy(a => a.AppointmentTime)
            .ToListAsync())
        .Where(a => a.Client != null && a.Doctor != null)
        .Select(ToDto);

    public async Task<IEnumerable<AppointmentDto>> GetByDoctorAsync(int doctorId) =>
        (await db.Appointments
            .Include(a => a.Client)
            .Include(a => a.Doctor)
            .Where(a => a.DoctorId == doctorId)
            .OrderByDescending(a => a.AppointmentDate)
            .ThenBy(a => a.AppointmentTime)
            .ToListAsync())
        .Select(ToDto);

    public async Task<IEnumerable<AppointmentDto>> GetByClientAsync(int clientId) =>
        (await db.Appointments
            .Include(a => a.Client)
            .Include(a => a.Doctor)
            .Where(a => a.ClientId == clientId)
            .OrderByDescending(a => a.AppointmentDate)
            .ThenBy(a => a.AppointmentTime)
            .ToListAsync())
        .Select(ToDto);

    public async Task<AppointmentDto?> UpdateStatusAsync(int id, string status)
    {
        var a = await db.Appointments
            .Include(x => x.Client)
            .Include(x => x.Doctor)
            .FirstOrDefaultAsync(x => x.Id == id);
        if (a is null) return null;

        a.Status    = status;
        a.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return ToDto(a);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var a = await db.Appointments.FindAsync(id);
        if (a is null) return false;
        db.Appointments.Remove(a);
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<List<DoctorAvailabilityDto>> GetAvailabilityAsync(
        int doctorId, string fromDate, int days)
    {
        var start = DateTime.Parse(fromDate).Date;
        var end   = start.AddDays(days);

        var taken = await db.Appointments
            .Where(a => a.DoctorId == doctorId
                     && a.AppointmentDate >= start
                     && a.AppointmentDate < end
                     && a.Status != "Cancelado")
            .Select(a => new { a.AppointmentDate, a.AppointmentTime })
            .ToListAsync();

        var result = new List<DoctorAvailabilityDto>();

        for (var d = start; d < end; d = d.AddDays(1))
        {
            if (d.DayOfWeek == DayOfWeek.Saturday || d.DayOfWeek == DayOfWeek.Sunday)
                continue;

            var slots  = new List<AvailableSlotDto>();
            var cursor = WorkStart;

            while (cursor.Add(TimeSpan.FromMinutes(SlotMinutes)) <= WorkEnd)
            {
                var isTaken = taken.Any(t =>
                    t.AppointmentDate.Date == d && t.AppointmentTime == cursor);

                slots.Add(new AvailableSlotDto(
                    $"{cursor.Hours:D2}:{cursor.Minutes:D2}", !isTaken));
                cursor = cursor.Add(TimeSpan.FromMinutes(SlotMinutes));
            }

            result.Add(new DoctorAvailabilityDto(
                d.ToString("yyyy-MM-dd"),
                DayName(d.DayOfWeek),
                slots));
        }

        return result;
    }

    public async Task<IEnumerable<string>> GetSpecialtiesAsync() =>
        await db.Doctors
            .Where(d => d.Active)
            .Select(d => d.Specialty)
            .Distinct()
            .OrderBy(s => s)
            .ToListAsync();

    private static string DayName(DayOfWeek d) => d switch
    {
        DayOfWeek.Monday    => "Lunes",
        DayOfWeek.Tuesday   => "Martes",
        DayOfWeek.Wednesday => "Miércoles",
        DayOfWeek.Thursday  => "Jueves",
        DayOfWeek.Friday    => "Viernes",
        _                   => d.ToString()
    };

    private static AppointmentDto ToDto(Appointment a) => new(
        a.Id,
        a.ClientId,  $"{a.Client?.FirstName} {a.Client?.LastName}",
        a.DoctorId,  $"Dr/a. {a.Doctor?.LastName}, {a.Doctor?.FirstName}",
        a.Doctor?.Specialty ?? "",
        a.AppointmentDate.ToString("yyyy-MM-dd"),
        $"{a.AppointmentTime.Hours:D2}:{a.AppointmentTime.Minutes:D2}",
        a.DurationMinutes,
        a.Status,
        a.Notes,
        a.CreatedAt);
}