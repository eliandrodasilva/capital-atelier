# Capital Atelier - Frontend

Esta é a interface do usuário da **Capital Atelier**, uma aplicação web de controle financeiro pessoal e compartilhado. O frontend foi desenvolvido em React.

---

## Tecnologias Utilizadas

O projeto foi construído utilizando as seguintes tecnologias e bibliotecas:

* **Core**: [React](https://react.dev/) + [Vite](https://vite.dev/) para empacotamento rápido e HMR.
* **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/) para design responsivo e moderno no tema escuro. Utilizado pois é base para o shadcn ui
* **Componentes de UI**: Baseado em componentes do [Radix UI](https://www.radix-ui.com/) e [Shadcn UI](https://ui.shadcn.com/) para acessibilidade e consistência.
* **Roteamento**: [React Router](https://reactrouter.com/) para navegação.
* **Gráficos**: [Recharts](https://recharts.org/) para visualização clara.
* **Outros**:
  * [zxcvbn](https://github.com/dropbox/zxcvbn) para avaliação em tempo real da força de senhas.
  * [Lucide React](https://lucide.dev/) para biblioteca de ícones consistentes.

---

## Instruções de Execução

Siga os passos abaixo para instalar e rodar a aplicação em seu ambiente local:

### 1. Pré-requisitos
Certifique-se de possuir o [Node.js](https://nodejs.org/) instalado em sua máquina.

### 2. Instalar Dependências
Navegue até o diretório do frontend e instale as dependências executando:
```bash
npm install
```

### 3. Rodar em Modo de Desenvolvimento
Inicie o servidor de desenvolvimento local:
```bash
npm run dev
```
O Vite disponibilizará o link no console (geralmente `http://localhost:5173`).

### 4. Compilar para Produção (Build)
Para gerar os arquivos estáticos prontos para produção:
```bash
npm run build
```

---
