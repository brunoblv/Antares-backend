# Configuração de Autenticação LDAP/Active Directory

## 📋 Status Atual

O código de integração LDAP **já está implementado** no backend (`src/auth/auth.service.ts`), mas está atualmente **desabilitado** em ambiente local.

## 🔧 Como Funciona

### Fluxo de Autenticação

1. **Verificação no Banco Local**: Primeiro verifica se o usuário existe na tabela `usuario`
2. **Verificação de Status**: Confirma se o usuário está ativo (`status = true`)
3. **Validação LDAP** (apenas em produção): Autentica a senha contra o Active Directory
4. **Geração de Tokens**: Se tudo estiver OK, gera tokens JWT (access + refresh)

### Ambientes

- **`ENVIRONMENT=local`**: Pula validação LDAP (qualquer senha funciona)
- **`ENVIRONMENT=production`**: Valida senha contra LDAP/AD

## ⚙️ Configuração para Ativar LDAP

### 1. Variáveis de Ambiente (.env)

Certifique-se de que seu `.env` tenha:

```env
# Ambiente: local (pula LDAP) ou production (usa LDAP)
ENVIRONMENT=production

# Servidor LDAP/AD
LDAP_SERVER=ldap://10.10.65.242
LDAP_DOMAIN=@rede.sp

# Credenciais do usuário de serviço (se necessário)
USER_LDAP=usr_smdu_freenas
PASS_LDAP=Prodam01

# Base DN para busca
LDAP_BASE_DN=dc=rede,dc=sp
```

### 2. Dependências Instaladas

O pacote `ldapts` já está instalado:

```json
"ldapts": "^7.3.1"
```

### 3. Ativar Autenticação LDAP

**Opção 1: Ambiente de Produção**

```env
ENVIRONMENT=production
```

**Opção 2: Testar LDAP Localmente**

Altere temporariamente no `.env`:

```env
ENVIRONMENT=production  # Força uso do LDAP mesmo localmente
```

⚠️ **Importante**: Apenas usuários que existem na tabela `usuario` podem fazer login. O LDAP é usado **apenas para validar a senha**.

## 🔍 Testando a Configuração

### 1. Verificar Logs

Quando o LDAP estiver ativo, você verá logs no console:

```
✅ Sucesso: Usuário autenticado via LDAP
❌ Erro: "Credenciais LDAP incorretas"
❌ Erro: "Usuário não encontrado no sistema"
```

### 2. Teste de Login

```bash
# Via cURL
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"login": "x380679", "senha": "senha_real_do_ad"}'
```

### 3. Possíveis Erros

| Erro                                | Causa                                    | Solução                         |
| ----------------------------------- | ---------------------------------------- | ------------------------------- |
| "Usuário não encontrado no sistema" | Usuário não existe na tabela `usuario`   | Adicionar usuário ao banco      |
| "Usuário desativado"                | `status = false`                         | Ativar usuário no banco         |
| "Credenciais LDAP incorretas"       | Senha errada ou problema de conexão LDAP | Verificar senha e conectividade |

## 📝 Código Relevante

### auth.service.ts (linhas 58-103)

```typescript
async validateUser(login: string, senha: string) {
  // 1. Busca usuário no banco local
  let usuario = await this.usuariosService.buscarPorLogin(login);

  if (!usuario) {
    throw new UnauthorizedException('Usuário não encontrado no sistema');
  }

  // 2. Verifica se está ativo
  if (usuario.status === false) {
    throw new UnauthorizedException('Usuário desativado');
  }

  // 3. Em ambiente local, pula LDAP
  const environment = process.env.ENVIRONMENT?.replace(/"/g, '').toLowerCase();

  if (environment === 'local') {
    return usuario;  // ⬅️ AQUI: aceita qualquer senha
  }

  // 4. Validação LDAP em produção
  const client = new LdapClient({
    url: process.env.LDAP_SERVER?.replace(/"/g, ''),
  });

  try {
    const ldapDomain = process.env.LDAP_DOMAIN?.replace(/"/g, '');
    const ldapUser = `${login}${ldapDomain}`;  // Ex: x380679@rede.sp

    await client.bind(ldapUser, senha);  // ⬅️ Valida senha no AD
    await client.unbind();

    return usuario;
  } catch (error) {
    await client.unbind().catch(() => {});
    throw new UnauthorizedException('Credenciais LDAP incorretas');
  }
}
```

## 🚀 Deploy em Produção

### 1. Configurar Variável de Ambiente

No servidor de produção, configure:

```bash
export ENVIRONMENT=production
```

ou no arquivo `.env` de produção:

```env
ENVIRONMENT=production
```

### 2. Verificar Conectividade LDAP

Teste se o servidor consegue acessar o AD:

```bash
# No servidor Linux
ldapsearch -x -H ldap://10.10.65.242 -b "dc=rede,dc=sp" -D "usr_smdu_freenas@rede.sp" -w "Prodam01"

# No Windows PowerShell
Test-NetConnection -ComputerName 10.10.65.242 -Port 389
```

### 3. Logs de Produção

Configure logs apropriados para monitorar autenticações:

```typescript
console.log(`✅ Autenticação bem-sucedida: ${login}`);
console.error(`❌ Falha na autenticação LDAP: ${login} - ${error.message}`);
```

## 🔒 Segurança

### Boas Práticas

1. **Nunca commitar** o `.env` com credenciais reais
2. **Use variáveis de ambiente** no servidor de produção
3. **Limite tentativas de login** (rate limiting)
4. **Log de auditoria** para todas as tentativas de autenticação
5. **Tokens JWT de curta duração** (15 minutos para access_token)

### Timeout LDAP

Adicione timeout para evitar travamentos:

```typescript
const client = new LdapClient({
  url: process.env.LDAP_SERVER,
  timeout: 5000, // 5 segundos
  connectTimeout: 5000,
});
```

## 📚 Referências

- [Documentação ldapts](https://github.com/ldapts/ldapts)
- [Active Directory Authentication](https://docs.microsoft.com/en-us/windows-server/identity/ad-ds/)
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)

---

**Última atualização**: Janeiro 2026  
**Arquivo**: `CONFIGURACAO_LDAP.md`
