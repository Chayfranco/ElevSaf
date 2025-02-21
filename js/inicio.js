// Importa as funções necessárias do Firebase
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

// Configurações do Firebase
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

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Função para lidar com o login
document.getElementById("buttonLogin").addEventListener("click", (e) => {
    e.preventDefault(); // Previne o comportamento padrão de submit do form

    // Obtém os valores dos campos de email e senha
    const email = document.getElementById("editTextUsername").value;
    const password = document.getElementById("editTextPassword").value;

    // Realiza o login com email e senha
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Login bem-sucedido
            window.location.href = "index.html"; // Redireciona para a página inicial
        })
        .catch((error) => {
            // Em caso de erro, exibe uma mensagem apropriada
            const errorMessage = error.message;
            alert("Erro ao fazer login: " + errorMessage);
        });
});
