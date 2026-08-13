const pagina = location.pathname.split("/").pop() || "dashboard.html";
document.querySelectorAll(".menu a").forEach((link) => {
  if (link.getAttribute("href") === pagina) link.classList.add("ativo");
});
document.querySelectorAll("[data-confirmar]").forEach((botao) =>
  botao.addEventListener("click", () => {
    if (confirm(botao.dataset.confirmar))
      alert("Operação realizada com sucesso.");
  }),
);
document.querySelectorAll("form[data-demo]").forEach((form) =>
  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const mensagem =
      form.querySelector(".mensagem") || document.querySelector(".mensagem");
    if (mensagem) {
      mensagem.textContent = "Dados salvos com sucesso!";
      mensagem.classList.add("visivel");
    }
    form.reset();
  }),
);
document.querySelector("[data-logout]")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  location.href = "login.html";
});
