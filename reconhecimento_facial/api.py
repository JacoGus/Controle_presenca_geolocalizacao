from flask import Flask, request, jsonify
import numpy as np
import cv2
from PIL import Image
import os
import sys
import face_recognition
from flask_cors import CORS

# Adiciona o diretório raiz do projeto ao sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from reconhecimento_facial.face_recognition_system import FaceRecognitionSystem

app = Flask(__name__)
CORS(app)
face_recognition_system = FaceRecognitionSystem()

# Configure a secret key for Flask application
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'a_secret_key_for_development')

@app.route('/')
def home():
    return "API de Reconhecimento Facial está funcionando!"

@app.route('/train', methods=['POST'])
def train():
    try:
        data = request.get_json()
        person_name = data.get('person_name')
        num_photos = data.get('num_photos', 20)
        
        if not person_name:
            return jsonify({'error': 'Nome da pessoa é obrigatório'}), 400
        
        face_recognition_system.collect_training_data(person_name, num_photos)
        face_recognition_system.train_model()
        
        return jsonify({'message': f'Modelo treinado com sucesso para {person_name}'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recognize', methods=['POST'])
def recognize():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'Nenhuma imagem fornecida'}), 400
        
        image_file = request.files['image']
        image = Image.open(image_file.stream).convert('RGB')
        image_np = np.array(image)
        frame = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

        # Carregar o modelo se ainda não estiver carregado
        if not face_recognition_system.known_face_encodings:
            face_recognition_system.load_model()
        
        # Usar a função de reconhecimento
        frame_with_faces = face_recognition_system.recognize_faces(frame)
        
        # Extrair nomes das faces reconhecidas
        face_names = []
        if len(face_recognition_system.known_face_encodings) > 0:
            # Redimensionar frame para acelerar processamento
            small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
            rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
            
            # Encontrar faces e codificações
            face_locations = face_recognition.face_locations(rgb_small_frame)
            face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
            
            for face_encoding in face_encodings:
                # Comparar com faces conhecidas
                matches = face_recognition.compare_faces(face_recognition_system.known_face_encodings, face_encoding)
                name = "Desconhecido"
                
                # Usar a face conhecida com menor distância
                face_distances = face_recognition.face_distance(face_recognition_system.known_face_encodings, face_encoding)
                if len(face_distances) > 0:
                    best_match_index = np.argmin(face_distances)
                    if matches[best_match_index] and face_distances[best_match_index] < 0.6:
                        name = face_recognition_system.known_face_names[best_match_index]
                
                face_names.append(name)
        
        return jsonify({'recognized_faces': face_names}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    face_recognition_system.load_model()
    app.run(host='0.0.0.0', port=5000)