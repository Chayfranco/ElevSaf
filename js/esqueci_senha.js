// Importando as dependências do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.0/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.12.0/firebase-auth.js";

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

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Função para enviar o código de recuperação
const recuperarSenha = (e) => {
    e.preventDefault();  // Evita o comportamento padrão do formulário

    const email = document.getElementById("emailRecuperacao").value;

    if (email === "") {
        alert("Por favor, insira seu e-mail.");
        return;
    }

    sendPasswordResetEmail(auth, email)
        .then(() => {
            alert("O código de recuperação foi enviado para o seu e-mail.");
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            if (errorCode === "auth/invalid-email") {
                alert("O e-mail fornecido é inválido.");
            } else if (errorCode === "auth/user-not-found") {
                alert("Nenhum usuário encontrado com esse e-mail.");
            } else {
                alert("Ocorreu um erro: " + errorMessage);
            }
        });
};

// Adicionar o evento ao formulário
const recuperarSenhaForm = document.getElementById("recuperarSenhaForm");
recuperarSenhaForm.addEventListener("submit", recuperarSenha);
