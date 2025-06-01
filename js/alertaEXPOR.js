import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA6lwFb8AaEE8T0l5jn9hEtvUWsAoPp9a",
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

// DOM
const distanciaSensorInput = document.getElementById("distanciaSensor");
const distanciaAguaInput = document.getElementById("distanciaAgua");
const alertMessage = document.getElementById("alertMessage");
const audio = document.getElementById("alertaAudio");

// Variáveis de controle
let contadorValores = {};
let valorFixadoAgua = null;
let distanciaRealAnterior = null;

const TOLERANCIA = 10; // ±10mm de tolerância

// Função para checar se distância da água está dentro da tolerância da distância real
function dentroDaTolerancia(distanciaReal, distanciaAgua) {
    return Math.abs(distanciaReal - distanciaAgua) <= TOLERANCIA;
}

// Atualiza distância real no Firebase
function atualizarDistanciaRealFirebase(novoValor) {
    const distanciaRealRef = ref(database, "sensor/distanciaReal");
    set(distanciaRealRef, parseInt(novoValor));
}

// Ao digitar nova distância real, resetar leitura e fixação
distanciaSensorInput.addEventListener("input", (event) => {
    const novoValor = event.target.value;
    if (novoValor !== "" && novoValor !== distanciaRealAnterior) {
        atualizarDistanciaRealFirebase(novoValor);
        contadorValores = {};
        valorFixadoAgua = null;
        distanciaRealAnterior = novoValor;
        console.log("🔄 Nova distância real definida. Reiniciando leitura da distância até a água.");
    }
});

// Lógica de fixação da distância até a água
function processarDistanciaAgua(valor) {
    if (valorFixadoAgua !== null) {
        return valorFixadoAgua;
    }

    contadorValores[valor] = (contadorValores[valor] || 0) + 1;

    if (contadorValores[valor] === 2) {
        valorFixadoAgua = valor;
        console.log("📌 Valor da distância até a água fixado em:", valorFixadoAgua);
    }

    return valor;
}

// Avaliação e alerta
function atualizarAlerta() {
    const distanciaReal = parseInt(distanciaSensorInput.value);
    const distanciaAgua = parseInt(distanciaAguaInput.value);

    const alturaMaxElevador = 350;
    const desvio = 10;

    if (isNaN(distanciaReal) || isNaN(distanciaAgua)) {
        exibirAlerta("Aguardando dados...", "gray");
        return;
    }

    let texto = "";
    let cor = "";

    // Se leitura inválida
    if (distanciaAgua === 8191) {
        texto = "⚠️ Erro na leitura do sensor!";
        cor = "orange";

    // Se distância da água dentro da tolerância da distância real (considera como sem água)
    } else if (dentroDaTolerancia(distanciaReal, distanciaAgua)) {
        texto = "✅ Não há presença de água.";
        cor = "green";

    // Caso distância da água menor que altura máxima do elevador (possível presença de água)
    } else if (distanciaAgua <= alturaMaxElevador) {
        const diferenca = Math.abs(distanciaReal - distanciaAgua);

        if (diferenca >= 40 + desvio) {
            texto = `⚠️ Atenção: a altura da água é ${diferenca} mm, está muito próxima da superfície do poço`;
            cor = "red";
            tocarAlerta();
        } else {
            texto = `⚠️ Atenção: água identificada. A altura da água é ${diferenca} mm`;
            cor = "orange";
        }

    } else {
        texto = "✅ Não há presença de água.";
        cor = "green";
    }

    exibirAlerta(texto, cor);
}

function exibirAlerta(texto, cor) {
    alertMessage.textContent = texto;
    alertMessage.style.color = cor;
}

let alertaCriticoAtivo = false;
let audioDesbloqueado = false;

function tocarAlerta() {
    if (!alertaCriticoAtivo && audioDesbloqueado) {
        alertaCriticoAtivo = true;
        audio.currentTime = 0;
        audio.play().catch(err => console.warn("Erro ao tocar o áudio:", err));
    }
}

function monitorarSensores() {
    const distanciaRealRef = ref(database, "sensor/distanciaReal");
    const distanciaAguaRef = ref(database, "sensor/distanciaAgua");

    onValue(distanciaRealRef, (snapshot) => {
        const val = snapshot.val();
        if (val !== null) {
            distanciaSensorInput.value = val;
            atualizarAlerta();
        }
    });

    onValue(distanciaAguaRef, (snapshot) => {
        const val = snapshot.val();
        if (val !== null) {
            const processado = processarDistanciaAgua(val);
            distanciaAguaInput.value = processado;
            atualizarAlerta();
        }
    });
}

function desbloquearAudio() {
    if (!audioDesbloqueado) {
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
            audioDesbloqueado = true;
            console.log("✅ Áudio desbloqueado.");
        }).catch(err => {
            console.warn("⚠️ Não foi possível desbloquear o áudio automaticamente:", err);
        });
    }
}

document.body.addEventListener("click", desbloquearAudio);
monitorarSensores();
