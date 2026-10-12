var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Só controllers de API (as telas agora são do React, em /frontend).
builder.Services.AddControllers();
builder.Services.AddProblemDetails();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler();
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

// Arquivos do wwwroot: o build do React (index.html + assets/) e as imagens.
// UseStaticFiles lê do disco a cada requisição, então um novo build do React aparece sem recompilar o .NET.
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

// API: os controllers devem usar [ApiController] e [Route("api/...")], ex.: [Route("api/auth")].
app.MapControllers();

// Rota de API inexistente responde 404 (e não o index.html do React).
app.Map("/api/{**rota}", () => Results.NotFound());

// Qualquer rota que não for /api nem arquivo (ex.: /login, /cadastro) devolve o index.html,
// e o React Router decide qual tela mostrar.
app.MapFallbackToFile("index.html");

app.Run();
