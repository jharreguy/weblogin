namespace AppApi.DTOs;

public record AppointmentRequest(
    int     ClientId,
    int     DoctorId,
    string  AppointmentDate,   // "yyyy-MM-dd"
    string  AppointmentTime,   // "HH:mm"
    int     DurationMinutes,
    string? Notes
);

public record AppointmentDto(
    int     Id,
    int     ClientId,
    string  ClientName,
    int     DoctorId,
    string  DoctorName,
    string  Specialty,
    string  AppointmentDate,
    string  AppointmentTime,
    int     DurationMinutes,
    string  Status,
    string? Notes,
    DateTime CreatedAt
);

public record UpdateStatusRequest(string Status);

public record AvailableSlotDto(string Time, bool Available);

public record DoctorAvailabilityDto(
    string                    Date,
    string                    DayName,
    List<AvailableSlotDto>    Slots
);

public record SpecialtyDto(string Name);
