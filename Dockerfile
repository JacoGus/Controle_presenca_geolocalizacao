# Usa uma imagem base Python com o Python 3.10
FROM python:3.10-slim-bullseye

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia o seu diretório Backend para o contêiner
COPY Backend/requirements.txt Backend/
COPY Backend/app.py Backend/
COPY reconhecimento_facial/ reconhecimento_facial/

# Instala CMake e outras dependências de build necessárias para dlib
RUN apt-get update && apt-get install -y cmake build-essential libboost-all-dev libx11-dev && apt-get clean && rm -rf /var/lib/apt/lists/*

# Instala as dependências
RUN pip install --no-cache-dir -r Backend/requirements.txt

# Copia o restante do código da aplicação (se houver)
COPY . .

# Expõe a porta que sua aplicação está usando (padrão 5000)
EXPOSE 5000

# Define o comando para rodar a aplicação usando Gunicorn + Uvicorn worker (ASGI)
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:5000", "Backend.app:app"]
