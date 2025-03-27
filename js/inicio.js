import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyA6lwFb8AaEE8T0l5jn9hEtvUWsAoPp9pA",
    authDomain: "elevsaf.firebaseapp.com",
    databaseURL: "https://elevsaf-default-rtdb.firebaseio.com",
    projectId: "elevsaf",
    storageBucket: "elevsaf.firebasestorage.app",
    messagingSenderId: "231722044544",
    appId: "1:231722044544:web:bc6ba860df9a5b8db76a65",
    measurementId: "G-46KJ23622F"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const form = document.querySelector(".form");
const editTextEmail = document.getElementById("editTextUsername");
const editTextPassword = document.getElementById("editTextPassword");

if (!form || !editTextEmail || !editTextPassword) {
    console.error("⚠️ Elementos do formulário não encontrados! Verifique os IDs no HTML.");
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = editTextEmail.value.trim();
    const senha = editTextPassword.value.trim();

    if (!email || !senha) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        console.log("🔄 Tentando fazer login...");
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        if (!user.emailVerified) {
            alert("⚠️ Seu e-mail ainda não foi verificado. Verifique sua caixa de entrada.");
            return;
        }

        console.log("✅ Login realizado com sucesso!");
        alert("Login realizado com sucesso!");
        window.location.href = "index.html"; // Redireciona para o painel do usuário

    } catch (error) {
        console.error("❌ Erro no login:", error);

        if (error.code === "auth/user-not-found") {
            alert("Usuário não encontrado. Verifique o e-mail.");
        } else if (error.code === "auth/wrong-password") {
            alert("Senha incorreta. Tente novamente.");
        } else {
            alert("Erro ao fazer login. Tente novamente.");
        }
    }

    function fazerLogin() {
        // Simula um login bem-sucedido
        localStorage.setItem("usuarioLogado", "true");
        window.location.href = "index.html"; // Redireciona para a tela inicial
    }
    
});
