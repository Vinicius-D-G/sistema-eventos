📝 Sistema de Gerenciamento de Eventos - Firebase
https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white
https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black

Um sistema completo para gerenciamento de eventos com autenticação de administradores e CRUD de eventos, utilizando Firebase como backend.

✨ Funcionalidades
Autenticação segura para administradores

CRUD completo de eventos

Interface responsiva para desktop e mobile

Armazenamento de imagens e dados no Firebase

Documentação API com Swagger

🛠️ Tecnologias
Frontend: HTML5, CSS3, JavaScript

Backend: Firebase (Auth, Firestore, Storage)

Ferramentas: Git, GitHub, Firebase CLI

🚀 Como Executar
Pré-requisitos:

Node.js (v16+)

Conta Firebase

Configuração:

bash
# Clone o repositório
git clone https://github.com/Vinicius-D-G/sistema-eventos.git
cd sistema-eventos

# Instale as dependências (se necessário)
npm install

# Configure o Firebase
npm install -g firebase-tools
firebase login
Variáveis de Ambiente:
Crie um arquivo .env na raiz com:

env
API_KEY=SUA_API_KEY_FIREBASE
AUTH_DOMAIN=SEU_PROJETO.firebaseapp.com
PROJECT_ID=SEU_PROJETO
Executar:

bash
firebase serve
# Ou abra diretamente o index.html
📚 Documentação
Swagger UI: Acessar Documentação

API Reference: Ver Endpoints
