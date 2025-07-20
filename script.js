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

// Função para alternar entre páginas
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// Função para formatar data
function formatarData(data) {
    if (!data) return 'Data não definida';
    
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    // Se for Timestamp do Firestore, converta para Date primeiro
    if (data.toDate) {
        return data.toDate().toLocaleDateString('pt-BR', options);
    }
    // Se já for Date ou string
    return new Date(data).toLocaleDateString('pt-BR', options);
}

// Função para editar evento
async function editarEvento(id) {
    try {
        const doc = await db.collection('eventos').doc(id).get();
        if (doc.exists) {
            const evento = doc.data();
            document.getElementById('modalTitulo').textContent = 'Editar Evento';
            document.getElementById('eventoId').value = id;
            document.getElementById('eventoNome').value = evento.nome;
            
            // Formata a data para o input datetime-local
            const data = evento.data.toDate();
            const dataFormatada = new Date(data.getTime() - (data.getTimezoneOffset() * 60000))
                .toISOString()
                .slice(0, 16);
            
            document.getElementById('eventoData').value = dataFormatada;
            document.getElementById('eventoLocal').value = evento.local;
            document.getElementById('eventoImagem').value = evento.imagem || '';
            document.getElementById('eventoModal').style.display = 'block';
        }
    } catch (error) {
        alert('Erro ao carregar evento: ' + error.message);
    }
}

// Função para excluir evento
async function excluirEvento(id) {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
        try {
            await db.collection('eventos').doc(id).delete();
            carregarEventos();
        } catch (error) {
            alert('Erro ao excluir evento: ' + error.message);
        }
    }
}

// Função para carregar eventos
async function carregarEventos() {
    const adminLogado = JSON.parse(sessionStorage.getItem('adminLogado'));
    if (!adminLogado) return;

    const listaEventos = document.getElementById('listaEventos');
    listaEventos.innerHTML = '<div class="loading">Carregando eventos...</div>';

    try {
        const snapshot = await db.collection('eventos')
            .where('adminId', '==', adminLogado.id)
            .get();

        const eventos = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => b.data.toDate() - a.data.toDate());

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
        console.error("Erro ao carregar eventos:", error);
        listaEventos.innerHTML = '<div class="error">Erro ao carregar eventos. Tente recarregar a página.</div>';
    }
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Verifica autenticação ao carregar
    auth.onAuthStateChanged(user => {
        if (user) {
            sessionStorage.setItem('adminLogado', JSON.stringify({
                id: user.uid,
                email: user.email
            }));
            showPage('homePage');
            carregarEventos();
        } else {
            showPage('loginPage');
        }
    });

    // Preenche email se "lembrar" estava ativado
    if (localStorage.getItem('lembrarSenha') === 'true') {
        const email = localStorage.getItem('adminEmail');
        if (email) {
            document.getElementById('email').value = email;
            document.getElementById('lembrar').checked = true;
        }
    }

    // Navegação entre páginas
    document.getElementById('goToCadastroBtn')?.addEventListener('click', function() {
        showPage('cadastroPage');
    });

    document.getElementById('goToLoginBtn')?.addEventListener('click', function(e) {
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
            const user = userCredential.user;
            
            sessionStorage.setItem('adminLogado', JSON.stringify({
                id: user.uid,
                email: user.email
            }));
            
            if (lembrar) {
                localStorage.setItem('lembrarSenha', 'true');
                localStorage.setItem('adminEmail', email);
            } else {
                localStorage.removeItem('lembrarSenha');
                localStorage.removeItem('adminEmail');
            }
            
            showPage('homePage');
            carregarEventos();
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
            // Cria usuário no Authentication
            const userCredential = await auth.createUserWithEmailAndPassword(email, senha);
            const user = userCredential.user;
            
            // Salva dados adicionais no Firestore
            await db.collection('administradores').doc(user.uid).set({
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
    document.getElementById('logoutBtn')?.addEventListener('click', function() {
        auth.signOut();
        sessionStorage.removeItem('adminLogado');
        showPage('loginPage');
    });

    // Configurar modal de eventos
    const eventoModal = document.getElementById('eventoModal');
    const closeBtn = document.querySelector('.close');
    
    // Abrir modal para adicionar evento
    document.getElementById('adicionarEventoBtn')?.addEventListener('click', function() {
        document.getElementById('modalTitulo').textContent = 'Adicionar Evento';
        document.getElementById('eventoForm').reset();
        document.getElementById('eventoId').value = '';
        eventoModal.style.display = 'block';
    });
    
    // Fechar modal
    closeBtn?.addEventListener('click', function() {
        eventoModal.style.display = 'none';
    });
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', function(event) {
        if (event.target === eventoModal) {
            eventoModal.style.display = 'none';
        }
    });
    
    // Formulário de evento
    document.getElementById('eventoForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const adminLogado = JSON.parse(sessionStorage.getItem('adminLogado'));
        if (!adminLogado) {
            alert('Faça login novamente');
            return;
        }

        const eventoId = document.getElementById('eventoId').value;
        const eventoData = {
            nome: document.getElementById('eventoNome').value,
            data: new Date(document.getElementById('eventoData').value),
            local: document.getElementById('eventoLocal').value,
            imagem: document.getElementById('eventoImagem').value || null,
            adminId: adminLogado.id,
            atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            if (eventoId) {
                // Atualização de evento existente
                await db.collection('eventos').doc(eventoId).update(eventoData);
            } else {
                // Cadastro de novo evento
                eventoData.criadoEm = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection('eventos').add(eventoData);
            }
            
            document.getElementById('eventoModal').style.display = 'none';
            carregarEventos();
        } catch (error) {
            alert('Erro ao salvar evento: ' + error.message);
        }
    });
});