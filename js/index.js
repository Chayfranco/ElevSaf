import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, updateProfile, updatePassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA6lwFb8AaEE8T0l5jn9hEtvUWsAoPp9pA",
  authDomain: "elevsaf.firebaseapp.com",
  databaseURL: "https://elevsaf-default-rtdb.firebaseio.com",
  projectId: "elevsaf",
  storageBucket: "elevsaf.appspot.com",
  messagingSenderId: "231722044544",
  appId: "1:231722044544:web:bc6ba860df9a5b8db76a65",
  measurementId: "G-46KJ23622F"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Código que você já tem para manipular o perfil do usuário e as outras funcionalidades...

document.addEventListener("DOMContentLoaded", function () {
    let slideIndex = 0;
    const slides = document.querySelector(".slides");
    const totalSlides = document.querySelectorAll(".slide").length;

    function showSlide(index) {
        slideIndex = index % totalSlides;
        const offset = -slideIndex * 100;
        slides.style.transform = `translateX(${offset}%)`;
    }

    function nextSlide() {
        showSlide(slideIndex + 1);
    }

    function prevSlide() {
        showSlide((slideIndex - 1 + totalSlides) % totalSlides);
    }

    setInterval(nextSlide, 4500);

    document.getElementById("prevSlide").addEventListener("click", prevSlide);
    document.getElementById("nextSlide").addEventListener("click", nextSlide);

    // Seleciona os elementos do menu
    const liEntrar = document.getElementById("liEntrar");
    const liCadastrar = document.getElementById("liCadastrar");
    const liLogout = document.getElementById("liLogout");

    // Função que atualiza a visibilidade dos botões com base no status do usuário
    function atualizarBotoes(user) {
        if (user) {
            // Se o usuário está logado
            if (liEntrar) liEntrar.style.display = "none";
            if (liCadastrar) liCadastrar.style.display = "none";
            if (liLogout) liLogout.style.display = "inline-block";
        } else {
            // Se o usuário não está logado
            if (liEntrar) liEntrar.style.display = "inline-block";
            if (liCadastrar) liCadastrar.style.display = "inline-block";
            if (liLogout) liLogout.style.display = "none";
        }
    }

    // Verifica o estado de autenticação do usuário ao carregar a página
    auth.onAuthStateChanged((user) => {
        atualizarBotoes(user);
    });

    // Função para fazer login
    window.fazerLogin = function () {
        localStorage.setItem("usuarioLogado", "true");
    };

    // Função para fazer logout
    window.fazerLogout = function () {
        signOut(auth).then(() => {
            // O usuário foi desconectado, o evento `onAuthStateChanged` será disparado e atualizará os botões
        }).catch((error) => {
            console.error("Erro ao sair: ", error);
        });
    };
});
