# EventFlow — Guia rápido

Guia curto para **organizadores** e **voluntários**. Imagens em `docs/screenshots/`.

---

## 1. Entrar na app

![Ecrã inicial](screenshots/01-entrada.png)

1. Abre o site EventFlow.
2. Escolhe **Sou voluntário** ou **Sou organizador**.

---

## 2. Organizador

### 2.1 Login

![Login organizador](screenshots/02-login-organizador.png)

- Utilizador e palavra-passe (ex.: `admin` / `admin` em desenvolvimento).
- **Entrar** → lista de eventos.

### 2.2 Escolher ou criar evento

![Escolher evento](screenshots/03-escolher-evento.png)

- Toca num cartão para abrir o evento.
- **Novo evento** → preenche nome, data, local → **Criar evento**.
- Eventos **passados**: **Encerrar** (só consulta depois).
- **Encerrados**: **Consultar** ou **Reabrir** (com justificação).

### 2.3 Horário oficial

![Horário — ver](screenshots/04-horario-ver.png)

- **Ver** (predefinido): horário só leitura para toda a equipa.
- **Editar**: altera blocos, horas, local; **Guardar** em cada linha.
- **Equipa** no bloco: escolhe voluntários → **Confirmar**.
- **Novo bloco**: adiciona entrada ao cronograma.

![Horário — editar](screenshots/05-horario-editar.png)

### 2.4 Equipa

![Equipa](screenshots/06-equipa.png)

- Toca no cartão do voluntário → aparecem **Editar** e **Inativar**.
- **Novo voluntário** → dados e opcionalmente novo PIN de 4 dígitos.
- Grelha de **disponibilidade** mais abaixo.

### 2.5 Admin

![Admin](screenshots/07-admin.png)

- **Configuração do evento**: nome, data, local, pares.
- **Encerrar evento** (após a data): confirmação → modo só consulta.
- **Reabrir evento**: exige justificação (fica no audit log).
- Utilizadores inativos e **registo de auditoria**.

### Outras tabs (resumo)

| Tab | Uso |
|-----|-----|
| **Logística** | Necessidades materiais e estado |
| **Salão** | Planta / zonas do espaço |
| **Sponsors** | Patrocinadores |
| **Financeiro** | Receitas e previsões |

Cabeçalho: **Trocar evento** (lista) · **Sincronizar** (atualizar do servidor).

---

## 3. Voluntário

### 3.1 Registo ou entrada

![Área voluntário](screenshots/08-voluntario-auth.png)

- **Registo**: nome, telemóvel, PIN de 4 dígitos.
- **Entrada**: mesmo telemóvel + PIN.

### 3.2 Escolher evento

![Voluntário — eventos](screenshots/09-voluntario-eventos.png)

- Escolhe o evento em que vais apoiar (só eventos ativos).

### 3.3 No evento

![Voluntário — horário](screenshots/10-voluntario-horario.png)

| Tab | Uso |
|-----|-----|
| **Horário** | Ver cronograma e equipas |
| **Eu levo** | Registar o que levas / contribuições |
| **Disponibilidade** | Indicar quando estás disponível |

---

## 4. Telemóvel — dicas

- Modais (editar voluntário, novo bloco): desliza o conteúdo branco; **Guardar** / **Cancelar** ficam em baixo.
- Barra de tabs: desliza horizontalmente se não couber tudo.
- Horário em edição: usa **Ver** / **Editar** no topo da página.

---

## 5. Problemas comuns

| Problema | O que fazer |
|----------|-------------|
| Lista de eventos vazia | Confirma Supabase (`.env`) e ligação à internet |
| Não guarda | Mensagem de erro no ecrã; **Sincronizar** no cabeçalho |
| Evento encerrado | Só consulta; reabrir em **Admin** com justificação |
| Voluntário não entra | PIN e telemóvel iguais ao registo; organizador pode redefinir PIN em **Equipa** |

---

*Atualizar imagens: `npm run guide:screenshots` (app em `npm run dev` + Supabase configurado).*
