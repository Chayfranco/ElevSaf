import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA6lwFb8AaEE8T0l5jn9hEtvUWsAoPp9a",
    authDomain: "elevsaf.firebaseapp.com",
    databaseURL: "https://elevsaf-default-rtdb.firebaseio.com",
    projectId: "elevsaf",
    storageBucket: "elevsaf.appspot.com",
    messagingSenderId: "231722044544",
    appId: "1:231722044544:web:bc6ba860df9a5b8db76a65",
    measurementId: "G-46KJ23622F"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
    const distanciaSensorInput = document.getElementById("distanciaSensor");
    const distanciaAguaInput = document.getElementById("distanciaAgua");
    const alertMessage = document.getElementById("alertMessage");
    const audio = document.getElementById("alertaAudio");
    let alertaCriticoAtivo = false;
    let audioDesbloqueado = false;

    distanciaSensorInput.addEventListener("input", (event) => {
        const novoValor = event.target.value;
        if (novoValor !== "") {
            const distanciaRealRef = ref(database, "sensor/distanciaReal");
            set(distanciaRealRef, parseInt(novoValor));
        }
    });

    function atualizarAlerta() {
        const distanciaReal = parseInt(distanciaSensorInput.value);  
        const distanciaAgua = parseInt(distanciaAguaInput.value);    
      
        const alturaMaxElevador = 350;   
        const desvio = 10;     
        const diferenca = Math.abs(distanciaReal - distanciaAgua);          
    
        if (isNaN(distanciaReal) || isNaN(distanciaAgua)) {
            alertMessage.textContent = "Aguardando dados...";
            alertMessage.style.color = "gray";
            return;
        }

        // Caso de erro do sensor
        if (distanciaAgua === 8191) {
            alertMessage.textContent = "⚠️ Erro na leitura do sensor!";
            alertMessage.style.color = "orange";
            return;
        }

        if (distanciaAgua === distanciaReal) {
            alertMessage.textContent = "✅ Não há prença de água.";
            alertMessage.style.color = "green";
            return;
        }
    
        // *** NOVO: verificar se a água está abaixo do topo
        if (distanciaAgua <= alturaMaxElevador) {
            // Só verifica a diferença se a água está abaixo do topo
            if (diferenca >= 20 + desvio || diferenca >= 20 - desvio) { 
                alertMessage.textContent = "🚨 Atenção: Elevador está muito próximo da água!";
                alertMessage.style.color = "red";
                tocarAlerta();
            } else if (diferenca <= 20 + desvio || diferenca <= 20 - desvio) { 
                alertMessage.textContent = "⚠️ Atenção: Água detectada próxima ao elevador.";
                alertMessage.style.color = "orange";
        } else {
            // A água está acima do topo: sem risco
            alertMessage.textContent = "✅ Não há prença de água.";
            alertMessage.style.color = "green";
        }
    }    

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
            }
            atualizarAlerta();
        });

        onValue(distanciaAguaRef, (snapshot) => {
            const val = snapshot.val();
            if (val !== null) {
                distanciaAguaInput.value = val;
            }
            atualizarAlerta();
        });
    }

       // Esta função será chamada ao clicar no body
       function desbloquearAudio() {
        if (!audioDesbloqueado) {
            const audio = document.getElementById("alertaAudio");
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

    // Adiciona o listener ao body após o carregamento
    document.body.addEventListener("click", desbloquearAudio);

    monitorarSensores();
}
});
