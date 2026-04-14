using System.Security.Claims;
using AppApi.DTOs;
using AppApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentsController(IAppointmentService svc) : ControllerBase
{
    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
               ?? User.FindFirstValue("sub") ?? "0");

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await svc.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var a = await svc.GetByIdAsync(id);
        return a is null ? NotFound() : Ok(a);
    }

    [HttpGet("doctor/{doctorId:int}")]
    public async Task<IActionResult> GetByDoctor(int doctorId) =>
        Ok(await svc.GetByDoctorAsync(doctorId));

    [HttpGet("client/{clientId:int}")]
    public async Task<IActionResult> GetByClient(int clientId) =>
        Ok(await svc.GetByClientAsync(clientId));

    /// <summary>Disponibilidad de un médico — ?from=yyyy-MM-dd&days=5</summary>
    [HttpGet("availability/{doctorId:int}")]
    public async Task<IActionResult> GetAvailability(
        int doctorId,
        [FromQuery] string? from,
        [FromQuery] int days = 5)
    {
        var fromDate = from ?? DateOnly.FromDateTime(DateTime.Today).ToString("yyyy-MM-dd");
        var result   = await svc.GetAvailabilityAsync(doctorId, fromDate, days);
        return Ok(result);
    }

    [HttpGet("specialties")]
    public async Task<IActionResult> GetSpecialties() =>
        Ok(await svc.GetSpecialtiesAsync());

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AppointmentRequest request)
    {
        var result = await svc.CreateAsync(request, CurrentUserId);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest req)
    {
        var result = await svc.UpdateStatusAsync(id, req.Status);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await svc.DeleteAsync(id);
        return ok ? NoContent() : NotFound();
    }
}
