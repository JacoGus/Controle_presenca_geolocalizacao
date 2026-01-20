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

# --------------------------------------------------------------------
#  CONFIGURAÇÃO DE GEOREFERENCIAMENTO (AJUSTE AS COORDENADAS DEPOIS)
# --------------------------------------------------------------------
COURSE_LOCATIONS = {}
UNITS_FILE = os.path.join(os.path.dirname(__file__), "units.json")

def load_units_from_file():
    global COURSE_LOCATIONS
    try:
        if os.path.exists(UNITS_FILE):
            import json
            with open(UNITS_FILE, "r", encoding="utf-8") as f:
                COURSE_LOCATIONS = json.load(f)
        else:
            COURSE_LOCATIONS = {}
    except Exception:
        print("Erro ao carregar units.json:")
        traceback.print_exc()

def save_units_to_file():
    try:
        import json
        with open(UNITS_FILE, "w", encoding="utf-8") as f:
            json.dump(COURSE_LOCATIONS, f, ensure_ascii=False, indent=2)
    except Exception:
        print("Erro ao salvar units.json:")
        traceback.print_exc()

def haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
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
    # Carrega unidades de `units.json`
    load_units_from_file()

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

@app.post("/recognize_and_register")
async def recognize_and_register(
    latitude: str = Form(...),
    longitude: str = Form(...),
    courseId: str = Form(...),
    image: UploadFile = File(...),
):
    """
    Recebe imagem + latitude + longitude + courseId, reconhece e valida geofence.
    """
    try:
        # 1) Ler e validar coordenadas
        try:
            lat = float(latitude)
            lon = float(longitude)
        except ValueError:
            return JSONResponse(status_code=400, content={"success": False, "reason": "Latitude/longitude inválidas"})

        # 2) Verificar courseId
        course_cfg = COURSE_LOCATIONS.get(str(courseId))
        if not course_cfg:
            return JSONResponse(status_code=400, content={"success": False, "reason": "Localização não configurada para esse curso"})

        # 3) Converter imagem para frame OpenCV
        contents = await image.read()
        pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
        image_np = np.array(pil_img)
        frame = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

        # 4) Garantir que o modelo está carregado
        if not face_recognition_system.known_face_encodings:
            face_recognition_system.load_model()

        # 5) Reconhecer
        recognized_names = face_recognition_system.recognize_faces(frame)

        # 6) Validar se achou alguém conhecido
        if not recognized_names:
            return {"success": False, "reason": "Nenhuma face conhecida detectada"}

        if any(name == UNKNOWN_LABEL for name in recognized_names):
            return {"success": False, "reason": "Face não reconhecida", "recognized_faces": recognized_names}

        # 7) Geofence
        dist = haversine_distance_m(lat, lon, course_cfg["lat"], course_cfg["lon"])
        if dist > course_cfg["radius_meters"]:
            return {
                "success": False,
                "reason": f"Fora da área permitida ({int(dist)}m > {course_cfg['radius_meters']}m)",
                "recognized_faces": recognized_names,
                "distance_m": dist,
            }

        # 8) (Futuro) registrar presença em DB
        print(f"[PRESENÇA] curso={courseId} aluno={recognized_names[0]} lat={lat} lon={lon} dist={dist:.2f}m")

        return {"success": True, "message": "Presença registrada com sucesso", "recognized_faces": recognized_names, "distance_m": dist}
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "reason": str(e)})


@app.get("/units")
def list_units():
    """Retorna as unidades de saúde / locais configurados com lat/lon e raio."""
    units = {k: {"name": v.get("name"), "lat": v.get("lat"), "lon": v.get("lon"), "radius_meters": v.get("radius_meters")} for k, v in COURSE_LOCATIONS.items()}
    return {"units": units}


@app.get("/units/{unit_id}")
def get_unit(unit_id: str):
    unit = COURSE_LOCATIONS.get(unit_id)
    if not unit:
        return JSONResponse(status_code=404, content={"error": "Unit not found"})
    return {"id": unit_id, "unit": unit}


@app.post("/units")
def create_unit(name: str = Form(...), lat: float = Form(...), lon: float = Form(...), radius_meters: int = Form(80)):
    # gera novo id simples (string)
    try:
        new_id = str(max([int(x) for x in COURSE_LOCATIONS.keys()] + [0]) + 1)
    except Exception:
        new_id = "1"
    COURSE_LOCATIONS[new_id] = {"name": name, "lat": lat, "lon": lon, "radius_meters": radius_meters}
    save_units_to_file()
    return {"id": new_id, "unit": COURSE_LOCATIONS[new_id]}


@app.put("/units/{unit_id}")
def update_unit(unit_id: str, name: str = Form(None), lat: float = Form(None), lon: float = Form(None), radius_meters: int = Form(None)):
    unit = COURSE_LOCATIONS.get(unit_id)
    if not unit:
        return JSONResponse(status_code=404, content={"error": "Unit not found"})
    if name is not None:
        unit["name"] = name
    if lat is not None:
        unit["lat"] = lat
    if lon is not None:
        unit["lon"] = lon
    if radius_meters is not None:
        unit["radius_meters"] = radius_meters
    COURSE_LOCATIONS[unit_id] = unit
    save_units_to_file()
    return {"id": unit_id, "unit": unit}


@app.delete("/units/{unit_id}")
def delete_unit(unit_id: str):
    if unit_id not in COURSE_LOCATIONS:
        return JSONResponse(status_code=404, content={"error": "Unit not found"})
    del COURSE_LOCATIONS[unit_id]
    save_units_to_file()
    return {"deleted": unit_id}