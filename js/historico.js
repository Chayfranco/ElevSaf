import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue, push, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
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
const tabelaHistorico = document.getElementById("tabela-historico");
const ctx = document.getElementById('graficoDistancia').getContext('2d');

// Histórico do gráfico
let labels = [];
let distanciaRealData = [];
let distanciaAguaData = [];

// Configuração do gráfico
const graficoDistancia = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [{
            label: 'Distância Real',
            data: distanciaRealData,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }, {
            label: 'Distância da Água',
            data: distanciaAguaData,
            fill: false,
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
        }]
    }
});

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
    const dataHora = new Date().toLocaleString("pt-BR");
    const novoRegistroRef = push(ref(database, "historico"));
    set(novoRegistroRef, {
        dataHora,
        distanciaReal,
        distanciaAgua,
        resultado
    });
    adicionarLinhaTabela(dataHora, distanciaReal, distanciaAgua, resultado);
}

// Função para monitorar os sensores
function monitorarSensores() {
    onValue(ref(database, "sensor/distanciaReal"), (snapshot) => {
        const distanciaReal = snapshot.val();

        onValue(ref(database, "sensor/distanciaAgua"), (snapshot) => {
            const distanciaAgua = snapshot.val();

            // Atualizar gráfico
            const dataHora = new Date().toLocaleString("pt-BR");
            if (labels.length > 5) { // Limitar o gráfico a 10 pontos
                labels.shift();
                distanciaRealData.shift();
                distanciaAguaData.shift();
            }
            labels.push(dataHora);
            distanciaRealData.push(distanciaReal);
            distanciaAguaData.push(distanciaAgua);

            graficoDistancia.update(); // Atualiza o gráfico

            // Atualizar o alerta e registrar histórico
            let resultado = "";
            if (distanciaAgua === 0) {
                resultado = "Não há água";
            } else if (distanciaReal - distanciaAgua > 0) {
                resultado = "Há água no poço";
            } else {
                resultado = "Possível alagamento!";
            }

            salvarNoBancoDeDados(distanciaReal, distanciaAgua, resultado);
        });
    });
}

// Função para verificar autenticação do usuário
onAuthStateChanged(auth, (user) => {
    if (user) {
        monitorarSensores();
    } else {
        console.log("Usuário não autenticado.");
    }
});
