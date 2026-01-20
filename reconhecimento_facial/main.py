from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import numpy as np
import cv2
from PIL import Image
import os
import sys
import io
from typing import List

# Adiciona o diretório pai ao PATH para que o Python encontre face_recognition_system
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from reconhecimento_facial.face_recognition_system import FaceRecognitionSystem

app = FastAPI()
face_recognition_system = FaceRecognitionSystem()

# Evento de inicialização para carregar o modelo
@app.on_event("startup")
async def startup_event():
    print("Carregando modelo de reconhecimento facial na inicialização...")
    success = face_recognition_system.load_model()
    if success:
        print("Modelo carregado.")
    else:
        print("Modelo não encontrado. Treine o modelo primeiro.")

class TrainModelRequest(BaseModel):
    # Não há campos, a requisição apenas aciona o treinamento
    pass

@app.get("/", response_model=dict)
async def home():
    return {"message": "API de Reconhecimento Facial"}

@app.post("/train", response_model=dict)
async def train_model(request: TrainModelRequest):
    print("Iniciando treinamento do modelo...")
    try:
        face_recognition_system.train_model()
        return {"message": "Modelo treinado com sucesso!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/register_face", response_model=dict)
async def register_face(person_name: str = Form(...), image: UploadFile = File(...)):
    try:
        # Ler a imagem enviada
        image_bytes = await image.read()
        pil_image = Image.open(io.BytesIO(image_bytes))
        image_np = np.array(pil_image)

        # Converter de RGB para BGR (OpenCV usa BGR por padrão)
        if image_np.ndim == 3 and image_np.shape[2] == 3:
            image_np = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

        # Salvar a imagem
        filename = face_recognition_system.save_training_image(person_name, image_np)

        return {"message": f"Face de {person_name} registrada com sucesso em {filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recognize", response_model=dict)
async def recognize(image: UploadFile = File(...)):
    if not face_recognition_system.known_face_encodings:
        raise HTTPException(status_code=400, detail="Modelo não treinado. Por favor, treine o modelo primeiro.")

    try:
        # Ler a imagem enviada
        image_bytes = await image.read()
        pil_image = Image.open(io.BytesIO(image_bytes))
        image_np = np.array(pil_image)

        # Converter de RGB para BGR (OpenCV usa BGR por padrão)
        if image_np.ndim == 3 and image_np.shape[2] == 3:
            image_np = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

        # Reconhecer faces
        face_names = face_recognition_system.recognize_faces(image_np)

        return {"recognized_faces": face_names, "message": "Reconhecimento concluído."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)






