using AppApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace AppApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PasswordResetController(IPasswordResetService svc) : ControllerBase
{
    [HttpPost("request")]
    public async Task<IActionResult> Request([FromBody] RequestPinDto dto)
    {
        await svc.RequestPinAsync(dto.Email);
        return Ok(new { message = "Si el email existe, recibirás un PIN en tu correo." });
    }

    [HttpPost("verify")]
    public async Task<IActionResult> Verify([FromBody] VerifyPinDto dto)
    {
        var ok = await svc.VerifyPinAsync(dto.Email, dto.Pin, dto.NewPassword);
        return ok
            ? Ok(new { message = "Contraseña actualizada correctamente." })
            : BadRequest(new { message = "PIN inválido o expirado." });
    }
}

public record RequestPinDto(string Email);
public record VerifyPinDto(string Email, string Pin, string NewPassword);