/*using MailKit.Net.Smtp;
using MimeKit;

namespace AppApi.Services;

public interface IEmailService
{
    Task SendPinAsync(string toEmail, string toName, string pin);
}

public class EmailService(IConfiguration config) : IEmailService
{
    public async Task SendPinAsync(string toEmail, string toName, string pin)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("AppName", config["Email:From"]));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = "Tu PIN para recuperar contraseña";

        message.Body = new TextPart("html")
        {
            Text = $"""
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:2rem">
              <h2 style="color:#6366f1">Recuperar contraseña</h2>
              <p>Hola <strong>{toName}</strong>, tu PIN de recuperación es:</p>
              <div style="font-size:2.5rem;font-weight:bold;letter-spacing:.5rem;
                          text-align:center;padding:1.5rem;margin:1.5rem 0;
                          background:#f1f5f9;border-radius:12px;color:#1e293b">
                {pin}
              </div>
              <p style="color:#64748b;font-size:.9rem">
                Este PIN expira en <strong>15 minutos</strong>.<br>
                Si no lo solicitaste, ignorá este correo.
              </p>
            </div>
            """
        };

        using var client = new SmtpClient();
        await client.ConnectAsync(
            config["Email:Host"],
            int.Parse(config["Email:Port"]!),
            MailKit.Security.SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(config["Email:User"], config["Email:Password"]);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
*/
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace AppApi.Services;

public interface IEmailService
{
    Task SendPinAsync(string toEmail, string toName, string pin);
}

public class EmailService(IConfiguration config) : IEmailService
{
    public async Task SendPinAsync(string toEmail, string toName, string pin)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("AppName", config["Email:From"]));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = "Tu PIN para recuperar contraseña";

        message.Body = new TextPart("html")
        {
            Text = $"""
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:2rem">
              <h2 style="color:#6366f1">Recuperar contraseña</h2>
              <p>Hola <strong>{toName}</strong>, tu PIN de recuperación es:</p>
              <div style="font-size:2.5rem;font-weight:bold;letter-spacing:.5rem;
                          text-align:center;padding:1.5rem;margin:1.5rem 0;
                          background:#f1f5f9;border-radius:12px;color:#1e293b">
                {pin}
              </div>
              <p style="color:#64748b;font-size:.9rem">
                Este PIN expira en <strong>15 minutos</strong>.<br>
                Si no lo solicitaste, ignorá este correo.
              </p>
            </div>
            """
        };

        using var client = new SmtpClient();

        // ↓ Ignorar validación de certificado SSL (solo desarrollo)
        client.ServerCertificateValidationCallback = (s, c, h, e) => true;

        await client.ConnectAsync(
            config["Email:Host"],
            int.Parse(config["Email:Port"]!),
            SecureSocketOptions.StartTls);

        await client.AuthenticateAsync(
            config["Email:User"],
            config["Email:Password"]);

        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}