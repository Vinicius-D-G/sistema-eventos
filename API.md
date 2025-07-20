# API de Gerenciamento de Eventos - Documentação

Esta API fornece operações para gerenciamento de eventos utilizando Firebase Firestore como backend, seguindo princípios RESTful.

## Visão Geral
- **Base URL**: `firestore.googleapis.com/v1/projects/{seu-projeto}`
- **Autenticação**: Bearer Token (JWT do Firebase)
- **Formato de Resposta**: JSON

## Autenticação
Todos os endpoints requerem autenticação via Firebase Auth. O token deve ser incluído no header:

```http
Authorization: Bearer <token_JWT>
Endpoints
Eventos
Listar Eventos
Método: GET

Path: /eventos

Descrição: Retorna todos os eventos do administrador logado, ordenados por data decrescente.

Parâmetros Query:

limit (opcional): Número máximo de resultados (padrão: 20)

page (opcional): Paginação (padrão: 1)

Exemplo Request:

javascript
await EventosService.listar({ limit: 10, page: 2 });
Resposta:

json
{
  "data": [
    {
      "id": "abc123",
      "nome": "Evento Exemplo",
      "data": "2023-12-31T20:00:00Z",
      "local": "São Paulo",
      "imagem": "https://exemplo.com/imagem.jpg",
      "adminId": "user123",
      "criadoEm": "2023-01-01T12:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 2,
    "limit": 10
  }
}
Obter Evento Específico
Método: GET

Path: /eventos/{id}

Descrição: Retorna detalhes de um evento específico.

Exemplo Request:

javascript
await EventosService.buscar('abc123');
Resposta:

json
{
  "id": "abc123",
  "nome": "Evento Exemplo",
  "data": "2023-12-31T20:00:00Z",
  "local": "São Paulo",
  "imagem": "https://exemplo.com/imagem.jpg",
  "adminId": "user123",
  "criadoEm": "2023-01-01T12:00:00Z",
  "atualizadoEm": "2023-01-02T10:00:00Z"
}
Criar Evento
Método: POST

Path: /eventos

Descrição: Cria um novo evento.

Request Body:

json
{
  "nome": "string (obrigatório)",
  "data": "string (ISO 8601, obrigatório)",
  "local": "string (obrigatório)",
  "imagem": "string (URL, opcional)"
}
Exemplo Request:

javascript
await EventosService.criar({
  nome: "Novo Evento",
  data: new Date('2023-12-31'),
  local: "Rio de Janeiro",
  imagem: "https://exemplo.com/nova-imagem.jpg"
});
Resposta:

json
{
  "id": "novoId123",
  "nome": "Novo Evento",
  "data": "2023-12-31T00:00:00Z",
  "local": "Rio de Janeiro",
  "imagem": "https://exemplo.com/nova-imagem.jpg",
  "adminId": "user123",
  "criadoEm": "2023-01-01T12:00:00Z"
}
Atualizar Evento
Método: PUT

Path: /eventos/{id}

Descrição: Atualiza um evento existente.

Exemplo Request:

javascript
await EventosService.atualizar('abc123', {
  nome: "Evento Atualizado",
  local: "Novo Local"
});
Resposta:

json
{
  "id": "abc123",
  "nome": "Evento Atualizado",
  "local": "Novo Local",
  "atualizadoEm": "2023-01-03T14:00:00Z"
}
Remover Evento
Método: DELETE

Path: /eventos/{id}

Descrição: Remove um evento permanentemente.

Exemplo Request:

javascript
await EventosService.remover('abc123');
Resposta:

json
{
  "success": true,
  "id": "abc123",
  "deletedAt": "2023-01-03T15:00:00Z"
}
Autenticação
Login
Método: POST

Path: /login

Descrição: Autentica um administrador.

Request Body:

json
{
  "email": "string (obrigatório)",
  "password": "string (obrigatório, mínimo 6 caracteres)"
}
Exemplo Request:

javascript
await auth.signInWithEmailAndPassword('admin@exemplo.com', 'senha123');
Resposta:

json
{
  "user": {
    "uid": "user123",
    "email": "admin@exemplo.com",
    "emailVerified": false
  },
  "token": "string (JWT)"
}
Cadastro
Método: POST

Path: /registrar

Descrição: Cria um novo administrador.

Request Body:

json
{
  "nome": "string (obrigatório)",
  "email": "string (obrigatório, formato email)",
  "password": "string (obrigatório, mínimo 6 caracteres)"
}
Exemplo Request:

javascript
const userCredential = await auth.createUserWithEmailAndPassword(email, password);
await db.collection('administradores').doc(userCredential.user.uid).set({
  nome: nome,
  email: email,
  criadoEm: firebase.firestore.FieldValue.serverTimestamp()
});
Modelos de Dados
Evento
typescript
interface Evento {
  id?: string;
  nome: string;
  data: Date | firebase.firestore.Timestamp;
  local: string;
  imagem?: string;
  adminId: string;
  criadoEm?: firebase.firestore.Timestamp;
  atualizadoEm?: firebase.firestore.Timestamp;
}
Administrador
typescript
interface Administrador {
  id?: string;
  nome: string;
  email: string;
  criadoEm: firebase.firestore.Timestamp;
  ultimoLogin?: firebase.firestore.Timestamp;
}
Códigos de Status
200 OK: Requisição bem-sucedida

201 Created: Recurso criado com sucesso

400 Bad Request: Dados inválidos

401 Unauthorized: Autenticação falhou

403 Forbidden: Permissões insuficientes

404 Not Found: Recurso não encontrado

500 Internal Server Error: Erro no servidor

Tratamento de Erros
Exemplo de resposta de erro:

json
{
  "error": {
    "code": "permission-denied",
    "message": "O usuário não tem permissão para acessar este recurso",
    "details": "Verifique se o token de autenticação é válido"
  }
}
Exemplo Completo
javascript
// 1. Autenticação
await auth.signInWithEmailAndPassword('admin@exemplo.com', 'senha123');

// 2. Criar evento
const evento = await EventosService.criar({
  nome: "Workshop de React",
  data: new Date('2023-11-15'),
  local: "Auditório Principal"
});

// 3. Atualizar evento
await EventosService.atualizar(evento.id, {
  local: "Auditório Secundário"
});

// 4. Listar eventos
const eventos = await EventosService.listar({ limit: 5 });

// 5. Remover evento
await EventosService.remover(evento.id);