import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue, push, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA6lwFb8AaEE8T0l5jn9hEtvUWsAoPp9A",
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
// ID permitido
const allowedUserId = "wqcbJ139uRXyk8wts5CAzP489W32";
// Elementos do DOM
const distanciaSensorInput = document.getElementById("distanciaSensor");
const distanciaAguaInput = document.getElementById("distanciaAgua");
const alertMessage = document.getElementById("alertMessage");
const tabelaHistorico = document.getElementById("tabela-historico");

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

let ultimoRegistro = null;

// Função para obter data e hora formatada
function obterDataHoraAtual() {
    const agora = new Date();
    return agora.toLocaleString("pt-BR");
}

// Função para adicionar uma linha na tabela
function adicionarLinhaTabela(dataHora, distanciaReal, distanciaAgua, resultado) {
    const novaLinha = document.createElement("tr");
    novaLinha.innerHTML = `
        <td>${dataHora}</td>
        <td>${distanciaReal} mm</td>
        <td>${distanciaAgua} mm</td>
        <td>${resultado}</td>
    `;
    tabelaHistorico.prepend(novaLinha);
}

// Função para salvar o histórico no Firebase
function salvarNoBancoDeDados(distanciaReal, distanciaAgua, resultado) {
    const dataHora = obterDataHoraAtual();
    const novoRegistroRef = push(ref(database, "historico"));
    set(novoRegistroRef, {
        dataHora,
        distanciaReal,
        distanciaAgua,
        resultado
    });
    adicionarLinhaTabela(dataHora, distanciaReal, distanciaAgua, resultado);
}

// Função para atualizar o alerta e registrar histórico
function atualizarAlerta(distanciaReal, distanciaAgua) {
    let resultado = "";

    if (distanciaAgua === 0) {
        resultado = "Não há água";
        alertMessage.style.color = "green";
    } else if (distanciaReal - distanciaAgua > 0) {
        resultado = "Há água no poço";
        alertMessage.style.color = "orange";
    } else {
        resultado = "Possível alagamento!";
        alertMessage.style.color = "red";
    }

    alertMessage.textContent = `Monitoramento: ${resultado}`;

    // Atualiza o histórico apenas se os valores mudaram
    const novoRegistro = { distanciaReal, distanciaAgua, resultado };
    if (JSON.stringify(novoRegistro) !== JSON.stringify(ultimoRegistro)) {
        ultimoRegistro = novoRegistro;
        salvarNoBancoDeDados(distanciaReal, distanciaAgua, resultado);
    }
}

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

// Atualizar o histórico a cada 5 minutos mesmo sem mudança de valores
setInterval(() => {
    if (ultimoRegistro) {
        salvarNoBancoDeDados(ultimoRegistro.distanciaReal, ultimoRegistro.distanciaAgua, ultimoRegistro.resultado);
    }
}, 5 * 60 * 1000); // 5 minutos
