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

// Elementos do DOM
const distanciaSensorInput = document.getElementById("distanciaSensor");
const distanciaAguaInput = document.getElementById("distanciaAgua");
const alertMessage = document.getElementById("alertMessage");

// Função para atualizar a distância real no Firebase
function atualizarDistanciaRealFirebase(novoValor) {
    const distanciaRealRef = ref(database, "sensor/distanciaReal");
    set(distanciaRealRef, parseInt(novoValor));
}

// Quando o usuário altera a distância real, salva no Firebase
distanciaSensorInput.addEventListener("input", (event) => {
    const novoValor = event.target.value;
    if (novoValor !== "") {
        atualizarDistanciaRealFirebase(novoValor);
    }
});

// Função para atualizar a mensagem de alerta
function atualizarAlerta() {
    const distanciaReal = parseInt(distanciaSensorInput.value);
    const distanciaAgua = parseInt(distanciaAguaInput.value);

    // Se a distância da água não for fornecida corretamente
    if (isNaN(distanciaReal) || isNaN(distanciaAgua)) {
        alertMessage.textContent = "Aguardando dados...";
        alertMessage.style.color = "gray";
        return;
    }

    // Se o valor da distância da água for 8191, trata como não há água detectada
    if (distanciaAgua === 8191) {
        alertMessage.textContent = "✅ Sem presença de água.";
        alertMessage.style.color = "green";
    }
    // Se a distância entre o elevador e a água for muito pequena (menos de 5mm), alerta vermelho
    else if (distanciaAgua - distanciaReal < 5) {
        alertMessage.textContent = "🚨 Atenção: Elevador está muito próximo da água!";
        alertMessage.style.color = "red";
    }
    // Alerta quando tem água (distância da água > 0)
    else if (distanciaAgua > 0) {
        alertMessage.textContent = "🚨 Atenção: Água detectada!";
        alertMessage.style.color = "red";
    }
    // Alerta quando a leitura está em processo ou inconclusiva (distância da água == 0)
    else if (distanciaAgua === 0) {
        alertMessage.textContent = "⚠️ Possível água detectada, aguardando confirmação...";
        alertMessage.style.color = "yellow";
    }

    // Se a diferença entre a água e o elevador for maior que 50mm, pode ser ausência de água
    if (distanciaAgua - distanciaReal > 50) {
        alertMessage.textContent = "✅ Provável ausência de água no poço.";
        alertMessage.style.color = "green";
    }
}

// Função principal que monitora os sensores
function monitorarSensores() {
    const distanciaRealRef = ref(database, "sensor/distanciaReal");
    const distanciaAguaRef = ref(database, "sensor/distanciaAgua");

    // Observa alterações na distância real (definida pelo usuário)
    onValue(distanciaRealRef, (snapshot) => {
        const val = snapshot.val();
        if (val !== null) {
            distanciaSensorInput.value = val;
        }
        atualizarAlerta();
    });

    // Observa alterações na distância da água (vinda do sensor)
    onValue(distanciaAguaRef, (snapshot) => {
        const val = snapshot.val();
        if (val !== null) {
            distanciaAguaInput.value = val;
        }
        atualizarAlerta();
    });
}

monitorarSensores(); // Inicia o monitoramento automático
