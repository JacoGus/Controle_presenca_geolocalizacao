# Aplicativo de Reconhecimento Facial para Alunos (FacialRecognitionApp)

## Descrição do Projeto

Este é um aplicativo móvel desenvolvido em React Native com Expo para gerenciar a frequência de alunos utilizando reconhecimento facial. O aplicativo permite que alunos façam login, visualizem suas disciplinas e horários, acompanhem sua frequência e confirmem presença, inclusive com a opção de reconhecimento facial.

## Funcionalidades

*   **Tela de Login:** Autenticação de alunos com número de Registro Acadêmico (RA) e senha.
*   **Tela Inicial (Home):** Exibe a foto do aluno e informações básicas.
*   **Tela de Disciplinas e Horários:** Lista as disciplinas em que o aluno está matriculado, com seus respectivos horários e professores.
*   **Tela de Frequência da Disciplina:** Detalha a frequência do aluno em uma disciplina específica, mostrando as datas e o status (presente/faltou).
*   **Tela de Confirmação de Presença:** Permite ao aluno confirmar sua presença, com opções de confirmação manual ou via reconhecimento facial.
*   **Tela de Reconhecimento Facial:** Utiliza a câmera do dispositivo para capturar uma imagem e simular o reconhecimento facial para confirmar a presença. (Atualmente, esta funcionalidade é um *placeholder* para integração com um backend de reconhecimento facial).

## Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas em sua máquina:

*   **Node.js e npm:** Instale a versão mais recente do Node.js, que inclui o npm (Node Package Manager). Você pode baixar em [nodejs.org](https://nodejs.org/).
*   **Expo Go App:** Instale o aplicativo **Expo Go** em seu dispositivo Android ou iOS. Ele está disponível na Google Play Store e na Apple App Store.

## Como Rodar o Aplicativo (Frontend)

Siga os passos abaixo para executar o aplicativo em seu dispositivo:

1.  **Navegue até o diretório do projeto:**

    ```bash
    cd FacialRecognitionApp
    ```

2.  **Instale as dependências:**

    Se você tiver problemas, pode tentar reinstalar:

    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento do Expo:**

    ```bash
    npx expo start --clear
    ```

    Este comando iniciará o Metro Bundler e abrirá uma nova aba no seu navegador com o Expo Dev Tools. Ele também exibirá um código QR no terminal.

4.  **Abra o aplicativo no seu dispositivo:**

    *   No aplicativo **Expo Go** no seu celular, escaneie o código QR exibido no terminal.
    *   O aplicativo será carregado no seu dispositivo. Se você encontrar a tela padrão do Expo (`Open up App.js...`), tente agitar o telefone para abrir o menu de desenvolvedor e selecione "Reload" ou "Clear cache and reload".

## Credenciais de Teste

Para acessar as telas do aplicativo, utilize as seguintes credenciais de teste na tela de login:

*   **RA:** `123`
*   **Senha:** `password`

## Próximos Passos (Integração do Reconhecimento Facial)

1.  **Criar uma API de Backend em Python:** Adaptar o script `face_recognition.py` para funcionar como uma função que recebe uma imagem (por exemplo, em base64) e retorna o resultado do reconhecimento. Em seguida, criar um pequeno servidor web (usando Flask ou FastAPI) que exponha essa funcionalidade como uma API REST.

2.  **Integrar o Frontend com a API:** Modificar a tela `FacialRecognitionScreen.js` no aplicativo React Native para:
    *   Capturar uma foto usando a câmera.
    *   Converter a foto para o formato esperado pela sua API (ex: base64).
    *   Enviar a foto para o endpoint da sua API de backend.
    *   Processar a resposta da API e exibir o resultado do reconhecimento (por exemplo, "Presença Confirmada" ou "Rosto Não Reconhecido").
