# Antares Backend

Sistema de gerenciamento de processos e andamentos - SMUL/ATIC

<p align="center">
  <a href="https://www.prefeitura.sp.gov.br/cidade/secretarias/licenciamento/" target="blank">
    <img src="https://www.prefeitura.sp.gov.br/cidade/secretarias/upload/chamadas/URBANISMO_E_LICENCIAMENTO_HORIZONTAL_FUNDO_CLARO_1665756993.png" width="300" alt="SMUL Logo" />
  </a>
</p>

## 🚀 Tecnologias

<p align="left">
  <a href="https://docs.nestjs.com/" target="_blank" title="NestJS">
    <img src="https://docs.nestjs.com/assets/logo-small-gradient.svg" alt="NestJS" width="40" height="40" />
  </a>
  <a href="https://www.prisma.io/docs" target="_blank" title="Prisma">
    <img src="https://www.prisma.io/docs/img/logo-white.svg" alt="Prisma" width="40" height="40" />
  </a>
</p>

- **NestJS** - Framework Node.js progressivo
- **Prisma** - ORM moderno para TypeScript
- **MySQL** - Banco de dados relacional
- **JWT** - Autenticação via tokens
- **LDAP/AD** - Integração com Active Directory
- **Swagger** - Documentação automática da API

## 📋 Pré-requisitos

- Node.js 18+
- MySQL 8+
- npm, yarn, pnpm ou bun

## 🔧 Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
copy example.env .env
```

### 3. Gerar secrets JWT

```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# RT_SECRET (refresh token)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Cole os valores gerados no arquivo `.env`.

### 4. Configurar banco de dados

Edite o `.env` com suas credenciais MySQL:

```env
DATABASE_URL=mysql://user:password@localhost:3306/antares
SGU_DATABASE_URL=mysql://user:password@host:3306/SGU
```

### 5. Executar migrations

```bash
npx prisma migrate dev
```

### 6. Gerar Prisma Clients

```bash
npx prisma generate --schema=./prisma/schema.prisma
npx prisma generate --schema=./prisma/sgu/schema.prisma
```

### 7. Popular banco (opcional)

```bash
npx prisma db seed
```

## 🏃 Executando a aplicação

```bash
# Desenvolvimento (hot reload)
npm run dev

# Produção
npm run build
npm run start:prod
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 📚 Documentação da API

Swagger disponível em: [http://localhost:3000/api](http://localhost:3000/api)

## 🔐 Autenticação

O sistema usa autenticação JWT com integração LDAP/Active Directory.

### Ambiente Local (sem LDAP)

```env
ENVIRONMENT=local
```

### Produção (com LDAP)

```env
ENVIRONMENT=production
LDAP_SERVER=ldap://servidor
LDAP_DOMAIN=@dominio
```

📖 Ver [CONFIGURACAO_LDAP.md](CONFIGURACAO_LDAP.md) para detalhes.

## 🗄️ Estrutura do Projeto

```
src/
├── andamentos/      # Gestão de andamentos de processos
├── auth/            # Autenticação e autorização
├── logs/            # Sistema de auditoria
├── prisma/          # Serviços Prisma
├── processos/       # Gestão de processos
├── unidades/        # Cadastro de unidades
└── usuarios/        # Gestão de usuários
```

## 🛠️ Scripts Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia com hot reload
npm run build            # Compila para produção
npm run start:debug      # Inicia com debugger

# Banco de dados
npx prisma studio        # Interface visual do banco
npx prisma migrate dev   # Criar nova migration
npx prisma db seed       # Popular banco com dados iniciais

# Code quality
npm run lint             # Verificar código
npm run format           # Formatar código
```

## 📦 Múltiplos Schemas Prisma

O projeto usa dois schemas:

1. **Antares** (`prisma/schema.prisma`) - Banco principal
2. **SGU** (`prisma/sgu/schema.prisma`) - Sistema de Gestão de Usuários

Sempre gere ambos após alterações:

```bash
npx prisma generate --schema=./prisma/schema.prisma
npx prisma generate --schema=./prisma/sgu/schema.prisma
```

## 🚨 Troubleshooting

### Erro: "Cannot find module '@prisma/sgu/client'"

```bash
npx prisma generate --schema=./prisma/sgu/schema.prisma
```

### Problemas com LDAP

Verifique conectividade:

```bash
Test-NetConnection -ComputerName 10.10.65.242 -Port 389
```

### Migration conflicts

```bash
npx prisma migrate reset --schema=./prisma/schema.prisma
```

## 📝 Licença

Propriedade da Prefeitura Municipal de São Paulo - SMUL/ATIC

---

**Desenvolvido por**: SMUL/ATIC  
**Contato**: [atic@prefeitura.sp.gov.br](mailto:atic@prefeitura.sp.gov.br)
