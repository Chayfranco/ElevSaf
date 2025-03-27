import { getAuth, updateProfile, updatePassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

document.addEventListener("DOMContentLoaded", async () => {
  // Verificar se o usuário está autenticado
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      // O usuário está autenticado
      document.getElementById("email-usuario").innerText = user.email;
      const userRef = doc(db, "usuarios", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        document.getElementById("nome-usuario").innerText = userData.nome;
        document.getElementById("foto-perfil").src = userData.fotoPerfil || "../imagens/avatar.png";
      }
    } else {
      // O usuário não está autenticado, limpar dados e redirecionar para o login
      document.getElementById("nome-usuario").innerText = "";
      document.getElementById("email-usuario").innerText = "";
      document.getElementById("foto-perfil").src = "../imagens/avatar.png";
      window.location.href = "inicio.html";
    }
  });
});

window.salvarPerfil = async function () {
  const user = auth.currentUser;
  if (!user) {
    alert("Você precisa estar autenticado para realizar essa ação.");
    return;
  }

  const novoNome = document.getElementById("novo-nome").value;
  const novoAvatar = document.getElementById("novo-avatar").files[0];

  let fotoURL = user.photoURL;

  if (novoAvatar) {
    const storageRef = ref(storage, `perfil/${user.uid}`);
    // Metadados para o arquivo de imagem
    const metadata = {
      contentType: 'image/jpeg'  // Ajuste o tipo conforme o tipo de imagem que está sendo carregada
    };

    try {
      // Faz o upload da imagem
      await uploadBytes(storageRef, novoAvatar, metadata);
      fotoURL = await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
    }
  }

  try {
    // Atualiza o perfil no Firebase Auth
    await updateProfile(user, { displayName: novoNome, photoURL: fotoURL });
    // Atualiza a coleção de usuários no Firestore
    await setDoc(doc(db, "usuarios", user.uid), { nome: novoNome, fotoPerfil: fotoURL }, { merge: true });

    // Atualiza a interface com os novos dados
    document.getElementById("nome-usuario").innerText = novoNome;
    document.getElementById("foto-perfil").src = fotoURL;

    fecharModal();
  } catch (error) {
    alert("Erro ao atualizar perfil: " + error.message);
  }
};

window.alterarSenha = async function () {
  const user = auth.currentUser;
  if (!user) {
    alert("Você precisa estar autenticado para alterar a senha.");
    return;
  }

  const novaSenha = document.getElementById("nova-senha").value;
  const confirmarSenha = document.getElementById("confirmar-senha").value;

  if (novaSenha !== confirmarSenha) {
    alert("As senhas não coincidem!");
    return;
  }

  try {
    await updatePassword(user, novaSenha);
    alert("Senha alterada com sucesso!");
    fecharModal();
  } catch (error) {
    alert("Erro ao alterar senha: " + error.message);
  }
};

window.sairDaConta = async function () {
  await signOut(auth);
  // Após sair, limpar os dados na interface
  document.getElementById("nome-usuario").innerText = "";
  document.getElementById("email-usuario").innerText = "";
  document.getElementById("foto-perfil").src = "../imagens/avatar.png";
  window.location.href = "inicio.html"; // Redireciona para a página de login
};

window.abrirModal = function (id) {
  document.getElementById(id).style.display = "block";
};

window.fecharModal = function () {
  document.querySelectorAll(".modal").forEach(modal => modal.style.display = "none");
};
