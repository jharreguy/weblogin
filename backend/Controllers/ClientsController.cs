using System.Security.Claims;
using AppApi.DTOs;
using AppApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientsController(IClientService clientService) : ControllerBase
{
    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
               ?? User.FindFirstValue("sub") ?? "0");

    /// <summary>Listar todos los clientes</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await clientService.GetAllAsync());

    /// <summary>Buscar cliente por DNI</summary>
    [HttpGet("search/{dni}")]
    public async Task<IActionResult> SearchByDni(string dni)
    {
        var result = await clientService.GetByDniAsync(dni);
        return result is null
            ? NotFound(new { message = "No se encontró ningún cliente con ese DNI." })
            : Ok(result);
    }

    /// <summary>Obtener cliente por ID</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var client = await clientService.GetByIdAsync(id);
        return client is null ? NotFound() : Ok(client);
    }

    /// <summary>Crear nuevo cliente</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ClientRequest request)
    {
        var result = await clientService.CreateAsync(request, CurrentUserId);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Actualizar cliente</summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] ClientRequest request)
    {
        var result = await clientService.UpdateAsync(id, request);
        return result is null ? NotFound() : Ok(result);
    }

    /// <summary>Eliminar cliente (soft delete)</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await clientService.DeleteAsync(id);
        return ok ? NoContent() : NotFound();
    }
}
