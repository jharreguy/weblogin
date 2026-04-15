# ── Build stage ──────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY AppApi.csproj .
RUN dotnet restore AppApi.csproj

COPY . .
RUN dotnet publish AppApi.csproj -c Release -o /app/publish

# ── Runtime stage ─────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "AppApi.dll"]
