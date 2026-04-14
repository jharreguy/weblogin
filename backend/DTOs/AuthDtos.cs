namespace AppApi.DTOs;

// ── Auth ──────────────────────────────────────────────
public record LoginRequest(string Email, string Password);

public record RegisterRequest(string Name, string Email, string Password);

public record AuthResponse(
    string Token,
    string Name,
    string Email,
    string Role,
    DateTime ExpiresAt);

// ── User management ───────────────────────────────────
public record UserDto(int Id, string Name, string Email, string Role, bool Active, DateTime CreatedAt);

public record UpdateUserRequest(string Name, string Email, string? Password);
