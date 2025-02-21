import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const form = document.querySelector('.form');
const editTextFullName = document.getElementById('editTextFullName');
const editTextEmail = document.getElementById('editTextEmail');
const editTextPassword = document.getElementById('editTextPassword');
const editTextConfirmPassword = document.getElementById('editTextConfirmPassword');
const buttonSignup = document.getElementById('buttonSignup');

function mostrarMensagemErro(mensagem) {
    alert(mensagem);
}

// Validação de e-mail
function isEmailValido(email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
}

// Validação de senha
function isSenhaValida(senha) {
    return senha.length >= 8 && /[A-Z]/.test(senha) && /[a-z]/.test(senha) && /[0-9]/.test(senha) && /[^A-Za-z0-9]/.test(senha);
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nome = editTextFullName.value.trim();
    const email = editTextEmail.value.trim();
    const senha = editTextPassword.value.trim();
    const confirmarSenha = editTextConfirmPassword.value.trim();

    if (!nome || !email || !senha || !confirmarSenha) {
        mostrarMensagemErro("Por favor, preencha todos os campos.");
        return;
    }

    if (!isEmailValido(email)) {
        mostrarMensagemErro("E-mail inválido.");
        return;
    }

    if (!isSenhaValida(senha)) {
        mostrarMensagemErro("A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um caractere especial.");
        return;
    }

    if (senha !== confirmarSenha) {
        mostrarMensagemErro("As senhas não coincidem.");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        await sendEmailVerification(user);

        await setDoc(doc(db, "usuarios", user.uid), {
            nome: nome,
            email: email
        });

        alert("Cadastro realizado com sucesso! Verifique seu e-mail para ativação.");
        form.reset();

    } catch (error) {
        if (error.code === "auth/email-already-in-use") {
            mostrarMensagemErro("Esse e-mail já está em uso por outra conta.");
        } else {
            mostrarMensagemErro(error.message || "Erro desconhecido.");
        }
    }
});
