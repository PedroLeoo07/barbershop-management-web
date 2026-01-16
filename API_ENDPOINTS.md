# Documentação da API - Sistema de Barbearia

## 📋 Informações Gerais

**Base URL**: A definir (configurar em `.env` como `NEXT_PUBLIC_API_URL`)

**Autenticação**: Bearer Token JWT

**Content-Type**: `application/json`

---

## 🔐 Autenticação

### POST /api/auth/login
Realiza login do usuário no sistema.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response 200:**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "client" | "barber" | "admin",
    "phone": "string",
    "createdAt": "ISO8601"
  }
}
```

**Response 401:**
```json
{
  "error": "Credenciais inválidas"
}
```

---

### POST /api/auth/register
Registra um novo usuário (cliente).

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "phone": "string"
}
```

**Response 201:**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "client",
    "phone": "string",
    "createdAt": "ISO8601"
  }
}
```

**Response 400:**
```json
{
  "error": "Email já cadastrado"
}
```

---

### POST /api/auth/logout
Invalida o token atual do usuário.

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "message": "Logout realizado com sucesso"
}
```

---

### GET /api/auth/me
Retorna informações do usuário autenticado.

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "client" | "barber" | "admin",
  "phone": "string",
  "createdAt": "ISO8601"
}
```

---

## 💈 Serviços

### GET /api/services
Lista todos os serviços disponíveis.

**Query Parameters:**
- `active` (opcional): `true` | `false` - Filtrar serviços ativos/inativos

**Response 200:**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "price": number,
    "duration": number,
    "active": boolean,
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601"
  }
]
```

---

### POST /api/services
Cria um novo serviço (requer permissão de admin).

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "price": number,
  "duration": number,
  "active": boolean
}
```

**Response 201:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": number,
  "duration": number,
  "active": boolean,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

---

### PUT /api/services/:id
Atualiza um serviço existente (requer permissão de admin).

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "price": number,
  "duration": number,
  "active": boolean
}
```

**Response 200:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": number,
  "duration": number,
  "active": boolean,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

---

### DELETE /api/services/:id
Remove um serviço (requer permissão de admin).

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "message": "Serviço removido com sucesso"
}
```

---

## 👨‍💼 Barbeiros

### GET /api/barbers
Lista todos os barbeiros.

**Query Parameters:**
- `available` (opcional): `true` | `false` - Filtrar barbeiros disponíveis

**Response 200:**
```json
[
  {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "specialties": ["string"],
    "workingDays": [0, 1, 2, 3, 4, 5, 6],
    "workingHours": {
      "start": "08:00",
      "end": "18:00"
    },
    "available": boolean,
    "rating": number,
    "totalAppointments": number,
    "createdAt": "ISO8601"
  }
]
```

---

### POST /api/barbers
Cria um novo barbeiro (requer permissão de admin).

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "phone": "string",
  "specialties": ["string"],
  "workingDays": [0, 1, 2, 3, 4, 5],
  "workingHours": {
    "start": "08:00",
    "end": "18:00"
  }
}
```

**Response 201:**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "specialties": ["string"],
  "workingDays": [0, 1, 2, 3, 4, 5],
  "workingHours": {
    "start": "08:00",
    "end": "18:00"
  },
  "available": true,
  "createdAt": "ISO8601"
}
```

---

### PUT /api/barbers/:id
Atualiza dados do barbeiro (requer permissão de admin ou próprio barbeiro).

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "string",
  "phone": "string",
  "specialties": ["string"],
  "workingDays": [0, 1, 2, 3, 4, 5],
  "workingHours": {
    "start": "08:00",
    "end": "18:00"
  },
  "available": boolean
}
```

**Response 200:**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "specialties": ["string"],
  "workingDays": [0, 1, 2, 3, 4, 5],
  "workingHours": {
    "start": "08:00",
    "end": "18:00"
  },
  "available": boolean,
  "updatedAt": "ISO8601"
}
```

---

### DELETE /api/barbers/:id
Remove um barbeiro (requer permissão de admin).

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "message": "Barbeiro removido com sucesso"
}
```

---

### GET /api/barbers/:id/schedule
Retorna horários disponíveis do barbeiro para uma data específica.

**Query Parameters:**
- `date` (obrigatório): `YYYY-MM-DD` - Data para consulta

**Response 200:**
```json
{
  "barberId": "string",
  "date": "YYYY-MM-DD",
  "availableSlots": [
    {
      "time": "08:00",
      "available": true
    },
    {
      "time": "08:30",
      "available": false
    }
  ]
}
```

---

## 📅 Agendamentos

### GET /api/appointments
Lista agendamentos do usuário autenticado.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (opcional): `pending` | `confirmed` | `completed` | `cancelled` - Filtrar por status
- `startDate` (opcional): `YYYY-MM-DD` - Data inicial
- `endDate` (opcional): `YYYY-MM-DD` - Data final

**Response 200:**
```json
[
  {
    "id": "string",
    "clientId": "string",
    "clientName": "string",
    "barberId": "string",
    "barberName": "string",
    "serviceId": "string",
    "serviceName": "string",
    "date": "YYYY-MM-DD",
    "time": "HH:mm",
    "status": "pending" | "confirmed" | "completed" | "cancelled",
    "price": number,
    "duration": number,
    "notes": "string",
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601"
  }
]
```

---

### POST /api/appointments
Cria um novo agendamento.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "serviceId": "string",
  "barberId": "string",
  "date": "YYYY-MM-DD",
  "time": "HH:mm",
  "notes": "string" (opcional)
}
```

**Response 201:**
```json
{
  "id": "string",
  "clientId": "string",
  "clientName": "string",
  "barberId": "string",
  "barberName": "string",
  "serviceId": "string",
  "serviceName": "string",
  "date": "YYYY-MM-DD",
  "time": "HH:mm",
  "status": "pending",
  "price": number,
  "duration": number,
  "notes": "string",
  "createdAt": "ISO8601"
}
```

---

### GET /api/appointments/:id
Retorna detalhes de um agendamento específico.

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": "string",
  "clientId": "string",
  "clientName": "string",
  "clientPhone": "string",
  "barberId": "string",
  "barberName": "string",
  "serviceId": "string",
  "serviceName": "string",
  "serviceDescription": "string",
  "date": "YYYY-MM-DD",
  "time": "HH:mm",
  "status": "pending" | "confirmed" | "completed" | "cancelled",
  "price": number,
  "duration": number,
  "notes": "string",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

---

### PATCH /api/appointments/:id/status
Atualiza o status de um agendamento.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "status": "confirmed" | "completed" | "cancelled",
  "cancellationReason": "string" (opcional, obrigatório se status = cancelled)
}
```

**Response 200:**
```json
{
  "id": "string",
  "status": "confirmed" | "completed" | "cancelled",
  "cancellationReason": "string",
  "updatedAt": "ISO8601"
}
```

---

### DELETE /api/appointments/:id
Cancela um agendamento.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "reason": "string"
}
```

**Response 200:**
```json
{
  "message": "Agendamento cancelado com sucesso",
  "id": "string"
}
```

---

## 📊 Dashboard & Estatísticas

### GET /api/dashboard/stats
Retorna estatísticas do dashboard (varia conforme role do usuário).

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200 (Admin):**
```json
{
  "totalRevenue": number,
  "totalAppointments": number,
  "activeClients": number,
  "activeBarbers": number,
  "revenueByMonth": [
    {
      "month": "2024-01",
      "revenue": number
    }
  ],
  "topServices": [
    {
      "serviceId": "string",
      "serviceName": "string",
      "count": number,
      "revenue": number
    }
  ],
  "topBarbers": [
    {
      "barberId": "string",
      "barberName": "string",
      "appointments": number,
      "rating": number
    }
  ]
}
```

**Response 200 (Barber):**
```json
{
  "todayAppointments": number,
  "weekAppointments": number,
  "monthRevenue": number,
  "rating": number,
  "upcomingAppointments": [
    {
      "id": "string",
      "clientName": "string",
      "serviceName": "string",
      "time": "HH:mm"
    }
  ]
}
```

**Response 200 (Client):**
```json
{
  "totalAppointments": number,
  "upcomingAppointments": number,
  "completedAppointments": number,
  "nextAppointment": {
    "id": "string",
    "serviceName": "string",
    "barberName": "string",
    "date": "YYYY-MM-DD",
    "time": "HH:mm"
  }
}
```

---

## 🔔 Notificações

### GET /api/notifications
Lista notificações do usuário autenticado.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `unread` (opcional): `true` | `false` - Filtrar não lidas

**Response 200:**
```json
[
  {
    "id": "string",
    "userId": "string",
    "title": "string",
    "message": "string",
    "type": "appointment" | "reminder" | "cancellation" | "system",
    "read": boolean,
    "createdAt": "ISO8601"
  }
]
```

---

### PATCH /api/notifications/:id/read
Marca notificação como lida.

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": "string",
  "read": true
}
```

---

### DELETE /api/notifications/:id
Remove uma notificação.

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "message": "Notificação removida com sucesso"
}
```

---

## 💬 Avaliações

### POST /api/appointments/:id/rating
Adiciona avaliação a um agendamento concluído.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "rating": number, // 1-5
  "comment": "string" (opcional)
}
```

**Response 200:**
```json
{
  "appointmentId": "string",
  "rating": number,
  "comment": "string",
  "createdAt": "ISO8601"
}
```

---

### GET /api/barbers/:id/ratings
Lista avaliações de um barbeiro.

**Response 200:**
```json
{
  "barberId": "string",
  "averageRating": number,
  "totalRatings": number,
  "ratings": [
    {
      "id": "string",
      "clientName": "string",
      "rating": number,
      "comment": "string",
      "createdAt": "ISO8601"
    }
  ]
}
```

---

## 🔧 Configurações

### GET /api/settings
Retorna configurações do sistema (admin).

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "businessName": "string",
  "businessPhone": "string",
  "businessEmail": "string",
  "businessAddress": "string",
  "workingDays": [0, 1, 2, 3, 4, 5],
  "workingHours": {
    "start": "08:00",
    "end": "18:00"
  },
  "slotDuration": number, // minutos
  "cancellationDeadline": number, // horas
  "allowedPaymentMethods": ["cash", "credit", "debit", "pix"]
}
```

---

### PUT /api/settings
Atualiza configurações do sistema (admin).

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "businessName": "string",
  "businessPhone": "string",
  "businessEmail": "string",
  "businessAddress": "string",
  "workingDays": [0, 1, 2, 3, 4, 5],
  "workingHours": {
    "start": "08:00",
    "end": "18:00"
  },
  "slotDuration": number,
  "cancellationDeadline": number,
  "allowedPaymentMethods": ["string"]
}
```

---

## 📝 Códigos de Status HTTP

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Requisição inválida
- **401**: Não autenticado
- **403**: Sem permissão
- **404**: Não encontrado
- **409**: Conflito (ex: horário já agendado)
- **422**: Validação falhou
- **500**: Erro interno do servidor

---

## 🔒 Permissões por Role

| Endpoint | Client | Barber | Admin |
|----------|--------|--------|-------|
| POST /api/appointments | ✅ | ❌ | ✅ |
| GET /api/appointments | ✅ (próprios) | ✅ (próprios) | ✅ (todos) |
| POST /api/services | ❌ | ❌ | ✅ |
| PUT /api/services/:id | ❌ | ❌ | ✅ |
| DELETE /api/services/:id | ❌ | ❌ | ✅ |
| POST /api/barbers | ❌ | ❌ | ✅ |
| PUT /api/barbers/:id | ❌ | ✅ (próprio) | ✅ |
| DELETE /api/barbers/:id | ❌ | ❌ | ✅ |
| GET /api/dashboard/stats | ✅ | ✅ | ✅ |
| PUT /api/settings | ❌ | ❌ | ✅ |

---

## 🌐 Configuração do Frontend

No arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Para integrar, atualize o arquivo `src/lib/api.ts` removendo os dados mock e usando `fetchAPI` real.

---

## 📞 Suporte

Para dúvidas sobre a integração, consulte o arquivo `README.md` do projeto ou entre em contato com a equipe de desenvolvimento.
