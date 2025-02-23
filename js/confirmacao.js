import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

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

const botaoLogin = document.getElementById("botaoLogin");
const linkReenviar = document.getElementById("reenviarEmail");

let emailVerificado = false;

// Verifica se o e-mail foi confirmado
function verificarEmailVerificado() {
    const user = auth.currentUser;
    if (user) {
        user.reload().then(() => {
            if (user.emailVerified) {
                console.log("✅ E-mail confirmado!");
                emailVerificado = true;
                botaoLogin.removeAttribute("disabled"); // Habilita o botão de login
            } else {
                console.log("❌ E-mail ainda NÃO confirmado.");
                emailVerificado = false;
                botaoLogin.setAttribute("disabled", "true"); // Mantém o botão desativado
                setTimeout(verificarEmailVerificado, 3000); // Verifica a cada 3s
            }
        }).catch(error => {
            console.error("Erro ao recarregar usuário:", error);
        });
    }
}

// Inicia a verificação quando o usuário está autenticado
onAuthStateChanged(auth, (user) => {
    if (user) {
        verificarEmailVerificado();
    }
});

// Reenvia o e-mail de verificação caso o usuário não tenha recebido
linkReenviar.addEventListener("click", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (user) {
        try {
            await sendEmailVerification(user);
            alert("📩 E-mail de verificação reenviado! Verifique sua caixa de entrada.");
        } catch (error) {
            console.error("Erro ao reenviar e-mail:", error);
            alert("❌ Erro ao reenviar. Tente novamente.");
        }
    } else {
        alert("⚠️ Usuário não encontrado. Faça login novamente.");
    }
});

// Redireciona para a tela de login SOMENTE SE o e-mail estiver verificado
botaoLogin.addEventListener("click", (e) => {
    e.preventDefault();
    
    if (emailVerificado) {
        window.location.href = "inicio.html"; 
    } else {
        alert("⚠️ Você precisa confirmar seu e-mail antes de continuar.");
    }
});
