using System.Security.Claims;
using AppApi.DTOs;
using AppApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController(IProfileService profileService) : ControllerBase
{
    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
               ?? User.FindFirstValue("sub")
               ?? "0");

    /// <summary>Obtener perfil del usuario logueado</summary>
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var profile = await profileService.GetProfileAsync(CurrentUserId);
        return profile is null ? NotFound() : Ok(profile);
    }

    /// <summary>Actualizar perfil del usuario logueado</summary>
    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateProfileRequest request)
    {
        var result = await profileService.UpdateProfileAsync(CurrentUserId, request);
        return result is null ? NotFound() : Ok(result);
    }
}
