using System.Security.Claims;
using AppApi.DTOs;
using AppApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DoctorsController(IDoctorService doctorService) : ControllerBase
{
    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
               ?? User.FindFirstValue("sub") ?? "0");

    /// <summary>Listar todos los médicos</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await doctorService.GetAllAsync());

    /// <summary>Listar médicos para selector (turno)</summary>
    [HttpGet("select")]
    public async Task<IActionResult> GetForSelect() =>
        Ok(await doctorService.GetForSelectAsync());

    /// <summary>Obtener médico por ID</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var doc = await doctorService.GetByIdAsync(id);
        return doc is null ? NotFound() : Ok(doc);
    }

    /// <summary>Crear médico</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] DoctorRequest request)
    {
        var result = await doctorService.CreateAsync(request, CurrentUserId);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Actualizar médico</summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] DoctorRequest request)
    {
        var result = await doctorService.UpdateAsync(id, request);
        return result is null ? NotFound() : Ok(result);
    }

    /// <summary>Eliminar médico (soft delete)</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await doctorService.DeleteAsync(id);
        return ok ? NoContent() : NotFound();
    }
}
