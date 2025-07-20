/**
 * @swagger
 * /login:
 *   post:
 *     summary: Autentica um administrador
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token JWT retornado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
async function login(email, password) {
    // ... sua implementação atual
  }
  
  /**
   * @swagger
   * /eventos:
   *   get:
   *     summary: Retorna todos os eventos do administrador
   *     tags: [Eventos]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de eventos
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Evento'
   */
  async function listarEventos() {
    // ... sua implementação atual
  }

// Configuração do Firebase com suas credenciais
const firebaseConfig = {
    apiKey: "AIzaSyAfRXF3WD_p0XVLxa3j9hgiVnBNdVxCv1U",
    authDomain: "desafiobancodetalentos.firebaseapp.com",
    projectId: "desafiobancodetalentos",
    storageBucket: "desafiobancodetalentos.appspot.com",
    messagingSenderId: "525416473309",
    appId: "1:525416473309:web:ba6da334b1cbf793e23134",
    measurementId: "G-WKX9LXNCPG"
};

// Inicialize o Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ==================== [SISTEMA DE AUTENTICAÇÃO] ==================== //
let currentUserToken = null;

// Gerenciamento de token JWT
async function updateUserToken(user) {
    if (user) {
        currentUserToken = await user.getIdToken();
        sessionStorage.setItem('jwtToken', currentUserToken);
        sessionStorage.setItem('userUID', user.uid);
        sessionStorage.setItem('adminLogado', JSON.stringify({
            id: user.uid,
            email: user.email
        }));
    } else {
        currentUserToken = null;
        sessionStorage.removeItem('jwtToken');
        sessionStorage.removeItem('userUID');
        sessionStorage.removeItem('adminLogado');
    }
}

// Monitorar estado de autenticação
auth.onAuthStateChanged(user => {
    updateUserToken(user).then(() => {
        if (user) {
            showPage('homePage');
            carregarEventos();
        } else {
            showPage('loginPage');
        }
    });
});

// ==================== [FUNÇÕES UTILITÁRIAS] ==================== //

// Alternar entre páginas
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// Formatar data para exibição
function formatarData(data) {
    if (!data) return 'Data não definida';
    
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return data.toDate().toLocaleDateString('pt-BR', options);
}

// ==================== [API RESTful - CAMADA DE SERVIÇO] ==================== //
const EventosService = {
    // GET - Listar todos os eventos do usuário
    listar: async () => {
        const userUID = sessionStorage.getItem('userUID');
        if (!userUID) throw new Error('Usuário não autenticado');
        
        const snapshot = await db.collection('eventos')
            .where('adminId', '==', userUID)
            .orderBy('data', 'desc')
            .get();
            
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // GET - Obter um evento específico
    buscar: async (id) => {
        const doc = await db.collection('eventos').doc(id).get();
        if (!doc.exists) throw new Error('Evento não encontrado');
        return { id: doc.id, ...doc.data() };
    },

    // POST - Criar novo evento
    criar: async (eventoData) => {
        const userUID = sessionStorage.getItem('userUID');
        if (!userUID) throw new Error('Usuário não autenticado');
        
        const docRef = await db.collection('eventos').add({
            ...eventoData,
            adminId: userUID,
            criadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return { id: docRef.id, ...eventoData };
    },

    // PUT - Atualizar evento existente
    atualizar: async (id, eventoData) => {
        await db.collection('eventos').doc(id).update({
            ...eventoData,
            atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { id, ...eventoData };
    },

    // DELETE - Remover evento
    remover: async (id) => {
        await db.collection('eventos').doc(id).delete();
        return { id, deleted: true };
    }
};

// ==================== [CRUD DE EVENTOS - REFATORADO] ==================== //

// Carregar eventos (GET)
async function carregarEventos() {
    const listaEventos = document.getElementById('listaEventos');
    listaEventos.innerHTML = '<div class="loading">Carregando eventos...</div>';

    try {
        const eventos = await EventosService.listar();

        if (eventos.length === 0) {
            listaEventos.innerHTML = '<p class="no-events">Nenhum evento encontrado.</p>';
            return;
        }

        listaEventos.innerHTML = '';
        eventos.forEach(evento => {
            const eventoElement = document.createElement('div');
            eventoElement.className = 'evento-card';
            eventoElement.innerHTML = `
                <div class="evento-imagem">
                    ${evento.imagem ? `<img src="${evento.imagem}" alt="${evento.nome}">` : '<div class="sem-imagem">Sem imagem</div>'}
                </div>
                <div class="evento-info">
                    <h3>${evento.nome}</h3>
                    <p><strong>Data:</strong> ${formatarData(evento.data)}</p>
                    <p><strong>Local:</strong> ${evento.local || 'Não informado'}</p>
                </div>
                <div class="evento-acoes">
                    <button onclick="editarEvento('${evento.id}')" class="btn-editar">Editar</button>
                    <button onclick="excluirEvento('${evento.id}')" class="btn-excluir">Excluir</button>
                </div>
            `;
            listaEventos.appendChild(eventoElement);
        });
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        listaEventos.innerHTML = `<div class="error">Erro ao carregar eventos: ${error.message}</div>`;
    }
}

// Editar evento (GET + PUT)
async function editarEvento(id) {
    try {
        const evento = await EventosService.buscar(id);
        
        document.getElementById('modalTitulo').textContent = 'Editar Evento';
        document.getElementById('eventoId').value = id;
        document.getElementById('eventoNome').value = evento.nome;
        
        const dataFormatada = new Date(evento.data.toDate().getTime() - (evento.data.toDate().getTimezoneOffset() * 60000))
            .toISOString()
            .slice(0, 16);
        
        document.getElementById('eventoData').value = dataFormatada;
        document.getElementById('eventoLocal').value = evento.local;
        document.getElementById('eventoImagem').value = evento.imagem || '';
        document.getElementById('eventoModal').style.display = 'block';
    } catch (error) {
        alert('Erro ao carregar evento: ' + error.message);
    }
}

// Excluir evento (DELETE)
async function excluirEvento(id) {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
        try {
            await EventosService.remover(id);
            carregarEventos();
        } catch (error) {
            alert('Erro ao excluir evento: ' + error.message);
        }
    }
}

// ==================== [INICIALIZAÇÃO] ==================== //
document.addEventListener('DOMContentLoaded', function() {
    // Preencher email se "lembrar" estava ativado
    if (localStorage.getItem('lembrarSenha') === 'true') {
        const email = localStorage.getItem('adminEmail');
        if (email) {
            document.getElementById('email').value = email;
            document.getElementById('lembrar').checked = true;
        }
    }

    // Navegação entre páginas
    document.getElementById('goToCadastroBtn')?.addEventListener('click', () => showPage('cadastroPage'));
    document.getElementById('goToLoginBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('loginPage');
    });

    // Formulário de Login
    document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('senha').value;
        const lembrar = document.getElementById('lembrar').checked;

        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            
            if (lembrar) {
                localStorage.setItem('lembrarSenha', 'true');
                localStorage.setItem('adminEmail', email);
            } else {
                localStorage.removeItem('lembrarSenha');
                localStorage.removeItem('adminEmail');
            }
        } catch (error) {
            alert('Login falhou: ' + error.message);
        }
    });
    
    // Formulário de Cadastro
    document.getElementById('cadastroForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const nome = document.getElementById('cadastroNome').value;
        const email = document.getElementById('cadastroEmail').value;
        const senha = document.getElementById('cadastroSenha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;
        
        if (senha !== confirmarSenha) {
            alert('As senhas não coincidem!');
            return;
        }

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, senha);
            await db.collection('administradores').doc(userCredential.user.uid).set({
                nome: nome,
                email: email,
                criadoEm: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            document.getElementById('mensagemSucesso').style.display = 'block';
            setTimeout(() => {
                document.getElementById('mensagemSucesso').style.display = 'none';
                showPage('loginPage');
            }, 2000);
        } catch (error) {
            alert('Erro no cadastro: ' + error.message);
        }
    });
    
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', () => auth.signOut());

    // Modal de eventos
    const eventoModal = document.getElementById('eventoModal');
    const closeBtn = document.querySelector('.close');
    
    document.getElementById('adicionarEventoBtn')?.addEventListener('click', () => {
        document.getElementById('modalTitulo').textContent = 'Adicionar Evento';
        document.getElementById('eventoForm').reset();
        document.getElementById('eventoId').value = '';
        eventoModal.style.display = 'block';
    });
    
    closeBtn?.addEventListener('click', () => eventoModal.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target === eventoModal) eventoModal.style.display = 'none';
    });
    
    // Formulário de evento
    document.getElementById('eventoForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const eventoData = {
            nome: document.getElementById('eventoNome').value,
            data: new Date(document.getElementById('eventoData').value),
            local: document.getElementById('eventoLocal').value,
            imagem: document.getElementById('eventoImagem').value || null
        };

        try {
            const eventoId = document.getElementById('eventoId').value;
            if (eventoId) {
                await EventosService.atualizar(eventoId, eventoData);
            } else {
                await EventosService.criar(eventoData);
            }
            
            document.getElementById('eventoModal').style.display = 'none';
            carregarEventos();
        } catch (error) {
            alert('Erro ao salvar evento: ' + error.message);
        }
    });
});