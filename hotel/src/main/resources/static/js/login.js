document.getElementById("form-login").addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const erroEl = document.getElementById("mensagem-erro");

    erroEl.style.display = "none";

    try {
        const resposta = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });

        if (!resposta.ok) {
            throw new Error("Credenciais inválidas");
        }

        const dados = await resposta.json();
        localStorage.setItem("usuarioLogado", JSON.stringify(dados));
        if (dados.token) {
            localStorage.setItem("token", dados.token);
        }

        window.location.href = "dashboard.html";
    } catch (error) {
        console.error("Erro no login:", error);
        erroEl.textContent = "E-mail ou senha incorretos. Tente novamente.";
        erroEl.style.display = "block";
    }
});