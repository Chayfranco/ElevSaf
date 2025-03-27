import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Configuração do Firebase
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
const database = getDatabase(app);
const auth = getAuth();

// Elementos do DOM
const distanciaSensorInput = document.getElementById("distanciaSensor");
const distanciaAguaInput = document.getElementById("distanciaAgua");
const alertMessage = document.getElementById("alertMessage");

// ID permitido
const allowedUserId = "wqcbJ139uRXyk8wts5CAzP489W32";

// Função para atualizar o alerta
function atualizarAlerta(distanciaReal, distanciaAgua) {
    const diferenca = distanciaReal - distanciaAgua;

    if (distanciaAgua === 0) {
        alertMessage.textContent = "Monitoramento: Não há água";
        alertMessage.style.color = "green";
    } else if (diferenca > 0) {
        alertMessage.textContent = "Monitoramento: Há água no poço";
        alertMessage.style.color = "orange";
    } else if (diferenca <= 0) {
        alertMessage.textContent = "Monitoramento: Possível alagamento!";
        alertMessage.style.color = "red";
    }
}

// Função para verificar se o usuário está logado e tem o ID correto
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Verificar se o UID do usuário corresponde ao permitido
        if (user.uid === allowedUserId) {
            // Atualizar os valores em tempo real
            onValue(ref(database, "sensor/distanciaReal"), (snapshot) => {
                const distanciaReal = snapshot.val();
                distanciaSensorInput.value = distanciaReal;

                onValue(ref(database, "sensor/distanciaAgua"), (snapshot) => {
                    const distanciaAgua = snapshot.val();
                    distanciaAguaInput.value = distanciaAgua;
                    atualizarAlerta(distanciaReal, distanciaAgua);
                });
            });
        } else {
            alertMessage.textContent = "Acesso negado: Usuário não autorizado.";
            alertMessage.style.color = "red";
        }
    } else {
        alertMessage.textContent = "Acesso negado: Você não está logado.";
        alertMessage.style.color = "red";
    }
});