using AppApi.Data;
using AppApi.Models;
using Microsoft.EntityFrameworkCore;

namespace AppApi.Services;

public interface IPasswordResetService
{
    Task<bool> RequestPinAsync(string email);
    Task<bool> VerifyPinAsync(string email, string pin, string newPassword);
}

public class PasswordResetService(AppDbContext db, IEmailService email) : IPasswordResetService
{
    public async Task<bool> RequestPinAsync(string userEmail)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == userEmail && u.Active);
        if (user is null) return true; // no revelar si el email existe

        // Invalidar PINs anteriores
        var old = db.PasswordResetTokens.Where(t => t.UserId == user.Id && !t.Used);
        db.PasswordResetTokens.RemoveRange(old);

        // Generar PIN de 6 dígitos
        var pin = new Random().Next(100000, 999999).ToString();

        db.PasswordResetTokens.Add(new PasswordResetToken
        {
            UserId    = user.Id,
            Token     = pin,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15)
        });

        await db.SaveChangesAsync();
        await email.SendPinAsync(user.Email, user.Name, pin);
        return true;
    }

    public async Task<bool> VerifyPinAsync(string userEmail, string pin, string newPassword)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
        if (user is null) return false;

        var record = await db.PasswordResetTokens.FirstOrDefaultAsync(t =>
            t.UserId    == user.Id &&
            t.Token     == pin &&
            !t.Used     &&
            t.ExpiresAt > DateTime.UtcNow);

        if (record is null) return false;

        user.Password  = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.UpdatedAt = DateTime.UtcNow;
        record.Used    = true;

        await db.SaveChangesAsync();
        return true;
    }
}