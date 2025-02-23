import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

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
const db = getFirestore(app);

const form = document.querySelector('.form');
const editTextFullName = document.getElementById('editTextFullName');
const editTextEmail = document.getElementById('editTextEmail');
const editTextPassword = document.getElementById('editTextPassword');
const editTextConfirmPassword = document.getElementById('editTextConfirmPassword');

function mostrarMensagemErro(mensagem) {
    alert(mensagem);
}

// Validação de e-mail (@gmail.com)
function isEmailValido(email) {
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = editTextFullName.value.trim();
    const email = editTextEmail.value.trim();
    const senha = editTextPassword.value.trim();
    const confirmarSenha = editTextConfirmPassword.value.trim();

    // Validações
    if (!nome || !email || !senha || !confirmarSenha) {
        mostrarMensagemErro("Preencha todos os campos.");
        return;
    }
    if (!isEmailValido(email)) {
        mostrarMensagemErro("E-mail inválido. Use um @gmail.com válido.");
        return;
    }
    if (senha.length < 8 || !/[A-Za-z]/.test(senha) || !/[0-9]/.test(senha)) {
        mostrarMensagemErro("A senha deve ter pelo menos 8 caracteres, incluindo uma letra e um número.");
        return;
    }
    if (senha !== confirmarSenha) {
        mostrarMensagemErro("As senhas não coincidem.");
        return;
    }

    try {
        console.log("Criando usuário...");
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        console.log("Usuário criado:", user);

        // Enviar e-mail de verificação
        await sendEmailVerification(user);
        console.log("E-mail de verificação enviado.");

        // Salvar dados no Firestore
        await setDoc(doc(db, "usuarios", user.uid), {
            nome: nome,
            email: email,
            emailVerificado: false
        });
        console.log("Dados salvos no Firestore.");

        alert("Cadastro realizado! Verifique seu e-mail.");

        form.reset();

        // Redirecionamento correto
        setTimeout(() => {
            window.location.href = "../html/confirmacao.html";
        }, 2000);

    } catch (error) {
        console.error("Erro no cadastro:", error);

        if (error.code === "auth/email-already-in-use") {
            mostrarMensagemErro("Esse e-mail já está em uso.");
        } else if (error.code === "auth/invalid-api-key") {
            mostrarMensagemErro("Erro de API Key inválida. Atualize sua chave no Firebase.");
        } else if (error.code === "permission-denied") {
            mostrarMensagemErro("Erro de permissão no Firestore. Atualize as regras.");
        } else {
            mostrarMensagemErro(error.message || "Erro desconhecido.");
        }
    }
});
