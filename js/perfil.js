import { 
    initializeApp 
  } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
  import { 
    getAuth, 
    updateProfile, 
    updatePassword, 
    signOut, 
    onAuthStateChanged 
  } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
  import { 
    getFirestore, 
    doc, 
    setDoc, 
    updateDoc 
  } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
  
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
  
  // Inicializar o Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  
  // Aguarda o carregamento do DOM
  document.addEventListener("DOMContentLoaded", () => {
  
    // Configura os botões assim que os elementos estiverem disponíveis
    const editarPerfilBtn = document.getElementById('editar-perfil-btn');
    if (editarPerfilBtn) {
      editarPerfilBtn.addEventListener('click', editarPerfil);
    }
    
    const fecharModalBtn = document.getElementById('fechar-modal');
    if (fecharModalBtn) {
      fecharModalBtn.addEventListener('click', fecharModal);
    }
    
    const formAlterarSenha = document.getElementById('form-alterar-senha');
    if (formAlterarSenha) {
      formAlterarSenha.addEventListener('submit', (e) => {
        e.preventDefault();
        alterarSenha();
      });
    }
    
    // Fechar o modal ao clicar fora dele
    window.addEventListener('click', (e) => {
      const modalSenha = document.getElementById('modal-senha');
      const modalEditar = document.getElementById('modal-editar');
      if (e.target === modalSenha) {
        modalSenha.style.display = 'none';
      }
      if (e.target === modalEditar) {
        modalEditar.style.display = 'none';
      }
    });
    
    // Atualiza a interface quando o estado de autenticação mudar
    onAuthStateChanged(auth, (user) => {
      if (user) {
        document.getElementById('nome-usuario').textContent = user.displayName || "Usuário";
        document.getElementById('foto-perfil').src = user.photoURL || "default-avatar.png";
      } else {
        // Se não houver usuário, redireciona para a página de login (ou outra)
        window.location.href = 'login.html';
      }
    });
  });
  
  // Função para abrir o modal de editar perfil
  function editarPerfil() {
    document.getElementById('modal-editar').style.display = 'flex';
  }
  
  // Função para fechar ambos os modais
  function fecharModal() {
    document.getElementById('modal-editar').style.display = 'none';
    document.getElementById('modal-senha').style.display = 'none';
  }
  
  // Função para salvar as alterações no perfil (nome e foto)
  async function salvarPerfil() {
    const novoNome = document.getElementById('novo-nome').value;
    const novoAvatar = document.getElementById('novo-avatar').files[0];
    const user = auth.currentUser;
    if (!user) return;
    
    // Atualiza o nome no Firebase Authentication (se fornecido)
    if (novoNome) {
      await updateProfile(user, { displayName: novoNome });
    }
    
    // Se uma nova foto foi selecionada, atualiza a foto
    if (novoAvatar) {
      const reader = new FileReader();
      reader.onload = async function(e) {
        const avatarUrl = e.target.result;
        
        // Atualiza o Firestore com a nova foto e nome
        const userDocRef = doc(firestore, "users", user.uid);
        await updateDoc(userDocRef, {
          avatar: avatarUrl,
          displayName: novoNome
        });
        
        // Atualiza a imagem exibida no perfil
        document.getElementById('foto-perfil').src = avatarUrl;
      };
      reader.readAsDataURL(novoAvatar);
    }
    
    // Atualiza o nome exibido na interface
    document.getElementById('nome-usuario').textContent = novoNome;
    
    // Fecha o modal de edição
    fecharModal();
  }
  
  // Função para abrir o modal de alterar senha
  function abrirModalSenha() {
    document.getElementById('modal-senha').style.display = 'flex';
  }
  
  // Função para alterar a senha
  async function alterarSenha() {
    const senhaAtual = document.getElementById('senha-atual').value;
    const novaSenha = document.getElementById('nova-senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;
    const user = auth.currentUser;
    if (!user) return;
    
    if (novaSenha !== confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }
    
    try {
      await updatePassword(user, novaSenha);
      alert('Senha alterada com sucesso!');
      fecharModal();
    } catch (error) {
      alert('Erro ao alterar a senha: ' + error.message);
    }
  }
  
  // Função para sair da conta
  function sairDaConta() {
    signOut(auth).then(() => {
      alert('Você saiu da sua conta!');
      window.location.href = 'index.html'; // Redireciona para a página inicial
    }).catch((error) => {
      alert('Erro ao sair: ' + error.message);
    });
  }
  