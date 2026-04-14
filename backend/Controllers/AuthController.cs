using AppApi.DTOs;
using AppApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace AppApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    /// <summary>Login – retorna JWT</summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await authService.LoginAsync(request);
        return result is null
            ? Unauthorized(new { message = "Credenciales inválidas." })
            : Ok(result);
    }

    /// <summary>Registro de nuevo usuario</summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await authService.RegisterAsync(request);
        return result is null
            ? BadRequest(new { message = "El email ya está registrado." })
            : Created(string.Empty, result);
    }
}
