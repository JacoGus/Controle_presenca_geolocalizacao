from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
from PIL import Image
import os
import sys
import math
import traceback
import io

# Adiciona o diretório raiz do projeto ao sys.path (para importar reconhecimento_facial)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from reconhecimento_facial.face_recognition_system import FaceRecognitionSystem

app = FastAPI(title="API de Reconhecimento Facial")

# CORS - ajuste se quiser restringir origens
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

face_recognition_system = FaceRecognitionSystem()
UNKNOWN_LABEL = "Desconhecido"

# ---------------------------------------------
# 1) MAPA DE LOCALIZAÇÃO DAS DISCIPLINAS
# ---------------------------------------------
# courseId -> latitude, longitude, raio permitido (em metros)
COURSE_LOCATIONS = {
    "1": {  # exemplo: disciplina com ID 1
        "lat": -21.7886001,      # <<< DEPOIS você troca pela latitude REAL
        "lon": -46.5507657,      # <<< DEPOIS você troca pela longitude REAL
        "radius_meters": 50     # raio permitido (em metros) ex: 50m
    },
    # exemplo de outro curso:
    # "2": {
    #     "lat": -22.123456,
    #     "lon": -45.654321,
    #     "radius_meters": 50
    # }
}


# ---------------------------------------------
# 2) FUNÇÃO PARA CALCULAR DISTÂNCIA ENTRE DOIS GPS
# ---------------------------------------------
def haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calcula a distância em METROS entre dois pontos de latitude/longitude.
    Fórmula de Haversine.
    """
    R = 6371000  # raio médio da Terra em metros
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


@app.on_event("startup")
def startup_event():
    # Tenta carregar o modelo se existir (não falha o servidor se não houver modelo)
    try:
        face_recognition_system.load_model()
    except Exception:
        print("Erro ao carregar modelo no startup:")
        traceback.print_exc()

@app.get("/")
def home():
    return {"message": "API de Reconhecimento Facial (FastAPI) está funcionando!"}

@app.post("/train")
def train():
    """
    Treina o modelo usando todas as imagens dentro de `training_data`.
    """
    try:
        face_recognition_system.train_model()
        return {"message": "Modelo treinado com sucesso!"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/register_face")
async def register_face(person_name: str = Form(...), image: UploadFile = File(...)):
    """
    Recebe um multipart/form-data com 'person_name' (form field) e 'image' (file).
    Salva a imagem em `training_data/<person_name>/...`.
    """
    try:
        contents = await image.read()
        pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
        image_np = np.array(pil_img)
        frame = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

        saved_path = face_recognition_system.save_training_image(person_name, frame)
        return {"message": "Imagem registrada com sucesso", "path": saved_path}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/recognize")
async def recognize(image: UploadFile = File(...)):
    try:
        contents = await image.read()
        pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
        image_np = np.array(pil_img)
        frame = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

        # Carregar o modelo se necessário
        if not face_recognition_system.known_face_encodings:
            face_recognition_system.load_model()

        face_names = face_recognition_system.recognize_faces(frame)
        return {"recognized_faces": face_names}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# ⬇️ A PARTIR DAQUI A NOVA ROTA COM GEOLOCALIZAÇÃO ⬇️
@app.post("/recognize_and_register")
async def recognize_and_register(
    image: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    courseId: str = Form(...)
):
    try:
        # 1) Ler imagem
        contents = await image.read()
        pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
        image_np = np.array(pil_img)
        frame = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

        # 2) Garantir que o modelo está carregado
        if not face_recognition_system.known_face_encodings:
            face_recognition_system.load_model()

        # 3) Reconhecer o rosto (igual à rota /recognize)
        face_names = face_recognition_system.recognize_faces(frame)

        if not face_names:
            return {
                "success": False,
                "reason": "Nenhuma face conhecida detectada"
            }

        if any(name == "Unknown" for name in face_names):
            return {
                "success": False,
                "reason": "Face não reconhecida",
                "recognized_faces": face_names
            }

        # 4) Buscar configuração de localização do curso
        course_cfg = COURSE_LOCATIONS.get(courseId)
        if not course_cfg:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "reason": "Localização não configurada para esse curso"
                }
            )

        # 5) Calcular distância até o ponto permitido
        dist = haversine_distance_m(
            latitude,
            longitude,
            course_cfg["lat"],
            course_cfg["lon"]
        )

        # 6) Verificar se está dentro do raio
        if dist > course_cfg["radius_meters"]:
            return {
                "success": False,
                "reason": f"Fora da área permitida ({int(dist)}m > {course_cfg['radius_meters']}m)",
                "recognized_faces": face_names,
                "distance_m": dist
            }

        # 7) (Aqui seria o registro REAL da presença em banco)
        print(
            f"[PRESENÇA] curso={courseId} aluno={face_names[0]} "
            f"lat={latitude} lon={longitude} dist={dist:.2f}m"
        )

        # 8) Resposta de sucesso
        return {
            "success": True,
            "message": "Presença registrada com sucesso",
            "recognized_faces": face_names,
            "distance_m": dist
        }

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "reason": str(e)}
        )
