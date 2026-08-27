# Capital Atelier - Backend

Esta é a API REST de uma aplicação web de controle financeiro pessoal e compartilhado. O backend foi desenvolvido em Java com **Spring Boot** e implementa autenticação JWT, persistência de dados com JPA/Hibernate, lógica de carteiras compartilhadas e resumos para o dashboard financeiro.

---

## 🚀 Tecnologias Utilizadas

O projeto foi construído utilizando as seguintes tecnologias e bibliotecas:

* **Framework Principal**: [Spring Boot](https://spring.io/projects/spring-boot) para estruturação da API REST.
* **Segurança e Autenticação**: [Spring Security](https://spring.io/projects/spring-security) + [JJWT)](https://github.com/jwtk/jjwt) para autenticação Stateless via Bearer Tokens JWT e BCrypt para hash seguro de senhas.
* **Persistência de Dados**: [Spring Data JPA](https://spring.io/projects/spring-data-jpa) / [Hibernate](https://hibernate.org/) para mapeamento objeto-relacional (ORM).
* **Banco de Dados**: [MySQL](https://www.mysql.com/).
* **Validação**: [Jakarta Bean Validation](https://beanvalidation.org/) (`@NotBlank`, `@Email`, `@Size`, `@DecimalMin`, etc.) para validação de DTOs.
* **E-mails**: [Spring Boot Starter Mail](https://spring.io/guides/gs/sending-email/) + [Thymeleaf](https://www.thymeleaf.org/) para envio de e-mails com templates HTML (boas-vindas e recuperação de senha).
* **Gerenciador de Dependências**: [Maven](https://maven.apache.org/).

---

## ⚙️ Variáveis de Ambiente e Configuração

As configurações da aplicação são definidas no arquivo `src/main/resources/application.properties` e `application-secrets.properties`:

| Variável / Propriedade | Descrição | Exemplo |
| :--- | :--- | :--- |
| `spring.datasource.url` | URL de conexão com o banco de dados | `jdbc:mysql://localhost:3306/capital_atelier` |
| `spring.datasource.username` | Usuário do banco de dados | `root` |
| `spring.datasource.password` | Senha do banco de dados | `sua_senha` |
| `jwt.secret` | Chave secreta de 256 bits para assinatura do JWT | `sua_chave_secreta_minimo_256_bits_aqui` |
| `spring.mail.username` | E-mail SMTP para envio de notificações | `seu_email@gmail.com` |
| `spring.mail.password` | Senha de aplicativo do e-mail SMTP | `sua_app_password` |

---

## 🛠️ Instruções de Execução

### 1. Pré-requisitos
* **Java 21+** instalado e configurado no `JAVA_HOME`.
* **Banco de dados MySQL ou PostgreSQL** em execução na porta configurada.

### 2. Configurar o Banco de Dados
Crie a base de dados no seu servidor MySQL:
```sql
CREATE DATABASE IF NOT EXISTS capital_atelier;
```
Ou crie por meio do painel admin do XAMPP.

### 3. Executar a Aplicação Localmente

Utilizando o Maven Wrapper incluído no projeto:

* **Windows:**
  ```powershell
  .\mvnw.cmd spring-boot:run
  ```
* **Linux / macOS:**
  ```bash
  ./mvnw spring-boot:run
  ```

A API estará disponível por padrão na porta `8080` (`http://localhost:8080`).

---

## 🧠 Decisões de Projeto

1. **Separação Estrita de Responsabilidades:** As Controllers não contêm lógica de negócio, delegando toda a orquestração para os Services e retornando DTOs (`records`), evitando expor entidades JPA do banco diretamente aos clientes HTTP.
2. **Contexto de Segurança Centralizado (`SecurityUtils`):** As rotas protegidas em `/api/**` recuperam o usuário logado a partir do token Bearer JWT presente no cabeçalho `Authorization`, garantindo que um usuário nunca consiga alterar ou visualizar dados de outro.
3. **Controle de Acesso em Carteiras Compartilhadas:** Implementação de permissões por papéis (`OWNER`, `EDITOR`, `VIEWER`), onde apenas o proprietário pode convidar ou remover membros e editar a carteira, e apenas proprietários/editores podem gerenciar transações.
4. **Resumo Financeiro Agregado:** O endpoint `/api/wallets/{walletId}/summary` realiza a consolidação sob demanda das receitas, despesas, saldo e distribuição mensal e por categoria para alimentar diretamente os gráficos do frontend.
