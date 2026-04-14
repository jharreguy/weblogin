-- =============================================
-- INIT COMPLETO — se ejecuta al crear el contenedor
-- =============================================
CREATE DATABASE IF NOT EXISTS AppDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE AppDB;

-- ── Users ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Users (
    Id          INT AUTO_INCREMENT PRIMARY KEY,
    Name        VARCHAR(100) NOT NULL,
    Email       VARCHAR(150) NOT NULL UNIQUE,
    Password    VARCHAR(255) NOT NULL,
    Role        ENUM('Admin','User') NOT NULL DEFAULT 'User',
    Active      TINYINT(1) NOT NULL DEFAULT 1,
    FirstName   VARCHAR(100) NULL,
    LastName    VARCHAR(100) NULL,
    Gender      VARCHAR(20)  NULL,
    DocType     VARCHAR(10)  NULL,
    DocNumber   VARCHAR(30)  NULL,
    WorkStatus  VARCHAR(20)  NULL,
    Street      VARCHAR(200) NULL,
    StreetNumber VARCHAR(20) NULL,
    AddressType VARCHAR(20)  NULL,
    Floor       VARCHAR(10)  NULL,
    Apartment   VARCHAR(10)  NULL,
    City        VARCHAR(100) NULL,
    Province    VARCHAR(100) NULL,
    ProfileComplete TINYINT(1) NOT NULL DEFAULT 0,
    CreatedAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── PasswordResetTokens ───────────────────────────────
CREATE TABLE IF NOT EXISTS PasswordResetTokens (
    Id        INT AUTO_INCREMENT PRIMARY KEY,
    UserId    INT NOT NULL,
    Token     VARCHAR(6) NOT NULL,
    ExpiresAt DATETIME NOT NULL,
    Used      TINYINT(1) NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reset_user FOREIGN KEY (UserId)
        REFERENCES Users(Id) ON DELETE CASCADE
);

-- ── Clients ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Clients (
    Id              INT AUTO_INCREMENT PRIMARY KEY,
    FirstName       VARCHAR(100) NOT NULL,
    LastName        VARCHAR(100) NOT NULL,
    Dni             VARCHAR(20)  NOT NULL UNIQUE,
    Phone           VARCHAR(30)  NOT NULL,
    Email           VARCHAR(150) NULL,
    Street          VARCHAR(200) NOT NULL,
    StreetNumber    VARCHAR(20)  NOT NULL,
    AddressType     ENUM('Casa','Edificio') NOT NULL DEFAULT 'Casa',
    Floor           VARCHAR(10)  NULL,
    Apartment       VARCHAR(10)  NULL,
    City            VARCHAR(100) NOT NULL,
    Province        VARCHAR(100) NOT NULL,
    Country         VARCHAR(100) NOT NULL DEFAULT 'Argentina',
    HasHealthInsurance  TINYINT(1)   NOT NULL DEFAULT 0,
    HealthInsuranceName VARCHAR(150) NULL,
    Active          TINYINT(1)   NOT NULL DEFAULT 1,
    CreatedBy       INT          NOT NULL,
    CreatedAt       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_client_user FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE RESTRICT
);

-- ── Doctors ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Doctors (
    Id              INT AUTO_INCREMENT PRIMARY KEY,
    FirstName       VARCHAR(100) NOT NULL,
    LastName        VARCHAR(100) NOT NULL,
    Dni             VARCHAR(20)  NOT NULL UNIQUE,
    LicenseNumber   VARCHAR(50)  NOT NULL UNIQUE,
    Specialty       VARCHAR(150) NOT NULL,
    Phone           VARCHAR(30)  NULL,
    Email           VARCHAR(150) NULL,
    Street          VARCHAR(200) NOT NULL,
    StreetNumber    VARCHAR(20)  NOT NULL,
    AddressType     ENUM('Casa','Edificio') NOT NULL DEFAULT 'Casa',
    Floor           VARCHAR(10)  NULL,
    Apartment       VARCHAR(10)  NULL,
    City            VARCHAR(100) NOT NULL,
    Province        VARCHAR(100) NOT NULL,
    Country         VARCHAR(100) NOT NULL DEFAULT 'Argentina',
    Active          TINYINT(1)   NOT NULL DEFAULT 1,
    CreatedBy       INT          NOT NULL,
    CreatedAt       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_doctor_user FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE RESTRICT
);

-- ── Appointments ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS Appointments (
    Id              INT AUTO_INCREMENT PRIMARY KEY,
    ClientId        INT          NOT NULL,
    DoctorId        INT          NOT NULL,
    AppointmentDate DATE         NOT NULL,
    AppointmentTime TIME         NOT NULL,
    DurationMinutes INT          NOT NULL DEFAULT 50,
    Status          ENUM('Pendiente','Confirmado','Cancelado','Realizado') NOT NULL DEFAULT 'Pendiente',
    Notes           TEXT         NULL,
    CreatedBy       INT          NOT NULL,
    CreatedAt       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_appt_client FOREIGN KEY (ClientId)  REFERENCES Clients(Id) ON DELETE RESTRICT,
    CONSTRAINT fk_appt_doctor FOREIGN KEY (DoctorId)  REFERENCES Doctors(Id) ON DELETE RESTRICT,
    CONSTRAINT fk_appt_user   FOREIGN KEY (CreatedBy) REFERENCES Users(Id)   ON DELETE RESTRICT,
    UNIQUE KEY uq_doctor_datetime (DoctorId, AppointmentDate, AppointmentTime)
);

-- ── Índices ───────────────────────────────────────────
CREATE INDEX idx_clients_dni      ON Clients(Dni);
CREATE INDEX idx_doctors_dni      ON Doctors(Dni);
CREATE INDEX idx_appt_date        ON Appointments(AppointmentDate);
CREATE INDEX idx_appt_status      ON Appointments(Status);

-- ── Usuario admin inicial ─────────────────────────────
-- Contraseña: Admin123!
INSERT IGNORE INTO Users (Name, Email, Password, Role) VALUES
('Administrador', 'admin@app.com',
 '$2a$11$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'Admin');
