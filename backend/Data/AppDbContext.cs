using AppApi.Models;
using Microsoft.EntityFrameworkCore;

namespace AppApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User>               Users               => Set<User>();
    public DbSet<Client>             Clients             => Set<Client>();
    public DbSet<Doctor>             Doctors             => Set<Doctor>();
    public DbSet<Appointment>        Appointments        => Set<Appointment>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("Users");
            e.HasKey(u => u.Id);
            e.Property(u => u.Email).HasMaxLength(150).IsRequired();
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Name).HasMaxLength(100).IsRequired();
            e.Property(u => u.Password).HasMaxLength(255).IsRequired();
            e.Property(u => u.Role).HasMaxLength(20).HasDefaultValue("User");
        });

        modelBuilder.Entity<Client>(e =>
        {
            e.ToTable("Clients");
            e.HasKey(c => c.Id);
            e.Property(c => c.Dni).HasMaxLength(20).IsRequired();
            e.HasIndex(c => c.Dni).IsUnique();
            e.Property(c => c.FirstName).HasMaxLength(100).IsRequired();
            e.Property(c => c.LastName).HasMaxLength(100).IsRequired();
            e.HasOne(c => c.Creator)
             .WithMany()
             .HasForeignKey(c => c.CreatedBy)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Doctor>(e =>
        {
            e.ToTable("Doctors");
            e.HasKey(d => d.Id);
            e.Property(d => d.Dni).HasMaxLength(20).IsRequired();
            e.HasIndex(d => d.Dni).IsUnique();
            e.Property(d => d.LicenseNumber).HasMaxLength(50).IsRequired();
            e.HasIndex(d => d.LicenseNumber).IsUnique();
            e.Property(d => d.FirstName).HasMaxLength(100).IsRequired();
            e.Property(d => d.LastName).HasMaxLength(100).IsRequired();
            e.Property(d => d.Specialty).HasMaxLength(150).IsRequired();
            e.HasOne(d => d.Creator)
             .WithMany()
             .HasForeignKey(d => d.CreatedBy)
             .OnDelete(DeleteBehavior.Restrict);
        });

   modelBuilder.Entity<Appointment>(e =>
{
    e.ToTable("Appointments");
    e.HasKey(a => a.Id);
    e.Property(a => a.Status).HasMaxLength(20).HasDefaultValue("Pendiente");
    e.Property(a => a.AppointmentDate).HasColumnType("date");
    e.Property(a => a.AppointmentTime).HasColumnType("time");
    e.HasOne(a => a.Client)
     .WithMany()
     .HasForeignKey(a => a.ClientId)
     .OnDelete(DeleteBehavior.Restrict);
    e.HasOne(a => a.Doctor)
     .WithMany()
     .HasForeignKey(a => a.DoctorId)
     .OnDelete(DeleteBehavior.Restrict);
    e.HasOne(a => a.Creator)
     .WithMany()
     .HasForeignKey(a => a.CreatedBy)
     .OnDelete(DeleteBehavior.Restrict);
});
    }
}
