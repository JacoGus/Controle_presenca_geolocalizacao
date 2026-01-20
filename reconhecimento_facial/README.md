# Sistema de Reconhecimento Facial

Um sistema completo de reconhecimento facial em Python que permite treinar um modelo com fotos de rostos e realizar reconhecimento em tempo real via webcam.

## Funcionalidades

- **Coleta de Dados**: Captura fotos de rostos via webcam para treinamento
- **Treinamento de Modelo**: Treina um modelo de reconhecimento facial usando as fotos coletadas
- **Reconhecimento em Tempo Real**: Identifica pessoas conhecidas em tempo real via webcam
- **Interface Gráfica**: Interface amigável para facilitar o uso
- **Linha de Comando**: Modo alternativo via terminal

## Instalação

1. Clone ou baixe este repositório
2. Instale as dependências:

```bash
pip install -r requirements.txt
```

## Como Usar

### Interface Gráfica (Recomendado)

Execute o sistema com interface gráfica:

```bash
python face_recognition_system.py --gui
```

### Linha de Comando

Execute o sistema via terminal:

```bash
python face_recognition_system.py
```

### API Web (para integração com aplicativos móveis)

Para integrar o sistema de reconhecimento facial com um aplicativo móvel, você pode usar a API Flask fornecida no diretório `Backend/`.

1.  **Instalação das dependências da API (se ainda não o fez)**:

    ```bash
    pip install -r Backend/requirements.txt
    ```

2.  **Iniciar a API Flask**:

    ```bash
    python Backend/app.py
    ```

    A API será executada em `http://0.0.0.0:5000` (ou o IP local do seu computador na rede).

3.  **Treinar o Modelo via API (Primeiro Passo)**:

    Antes de usar o reconhecimento, você precisa treinar o modelo enviando uma requisição POST para o endpoint `/train`. Você pode usar ferramentas como `curl` ou Postman, ou um script Python.

    Exemplo (usando `curl`):
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"person_name": "Seu Nome", "num_photos": 20}' http://10.0.2.2:5000/train
    ```
    -   `person_name`: O nome da pessoa para a qual você está coletando dados de treinamento.
    -   `num_photos`: (Opcional) O número de fotos a serem coletadas (padrão é 20). Durante a coleta, uma janela da webcam será aberta; siga as instruções para capturar as fotos.

4.  **Reconhecer Faces via API**:

    Envie uma requisição POST com a imagem para o endpoint `/recognize` usando `multipart/form-data`.

    Exemplo (usando `curl`):
    ```bash
    curl -X POST -F "image=@/caminho/para/sua/imagem.jpg" http://10.0.2.2:5000/recognize
    ```
    -   Substitua `/caminho/para/sua/imagem.jpg` pelo caminho real da imagem que você quer analisar.
    -   A API retornará um JSON com `recognized_faces`, que será uma lista dos nomes das faces reconhecidas na imagem (ou "Desconhecido" se não for identificada).

## Processo de Uso

### 1. Coleta de Dados de Treinamento

- Digite o nome da pessoa
- Defina o número de fotos a serem capturadas (recomendado: 20-30)
- Clique em "Coletar Fotos"
- Posicione a pessoa na frente da webcam
- Pressione **ESPAÇO** para capturar cada foto
- Pressione **ESC** para sair

### 2. Treinamento do Modelo

- Após coletar fotos de uma ou mais pessoas
- Clique em "Treinar Modelo"
- O sistema processará todas as fotos e criará o modelo

### 3. Reconhecimento em Tempo Real

- Clique em "Iniciar Reconhecimento"
- O sistema abrirá a webcam
- Pessoas conhecidas serão identificadas com nome em verde
- Pessoas desconhecidas aparecerão como "Desconhecido" em vermelho
- Pressione **'q'** para sair

## Estrutura do Projeto

```
Reconhecimento_facial/
├── face_recognition_system.py    # Arquivo principal
├── requirements.txt              # Dependências
├── README.md                    # Documentação
├── face_model.pkl              # Modelo treinado (criado automaticamente)
└── training_data/              # Fotos de treinamento
    ├── Pessoa1/
    │   ├── Pessoa1_1.jpg
    │   ├── Pessoa1_2.jpg
    │   └── ...
    └── Pessoa2/
        ├── Pessoa2_1.jpg
        └── ...
```

## Dependências

- **opencv-python**: Processamento de imagens e webcam
- **face-recognition**: Biblioteca de reconhecimento facial
- **numpy**: Operações matemáticas
- **Pillow**: Manipulação de imagens
- **tkinter**: Interface gráfica (incluído no Python)

## Dicas para Melhor Resultado

1. **Iluminação**: Use boa iluminação durante a coleta de fotos
2. **Posicionamento**: Mantenha a face centralizada na webcam
3. **Variedade**: Capture fotos com diferentes ângulos e expressões
4. **Qualidade**: Use pelo menos 20-30 fotos por pessoa
5. **Distância**: Mantenha uma distância consistente da webcam

## Solução de Problemas

### Webcam não funciona
- Verifique se a webcam está conectada e funcionando
- Feche outros programas que possam estar usando a webcam

### Erro de instalação
- Certifique-se de ter Python 3.7+ instalado
- Use `pip install --upgrade pip` antes de instalar as dependências

### Reconhecimento impreciso
- Treine novamente com mais fotos
- Melhore a iluminação
- Verifique se as fotos de treinamento são de boa qualidade

## Licença

Este projeto é de código aberto e pode ser usado livremente para fins educacionais e pessoais.
