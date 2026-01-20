import cv2
import face_recognition
import numpy as np
import os
import pickle
# from PIL import Image # Not needed here directly, handled in main.py
# import tkinter as tk # GUI removed
# from tkinter import filedialog, messagebox, ttk # GUI removed
# import threading # GUI removed
# import time # GUI removed

class FaceRecognitionSystem:
    def __init__(self):
        self.known_face_encodings = []
        self.known_face_names = []
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.model_file = 'face_model.pkl'
        self.training_data_dir = 'training_data'
        # self.is_recording = False # Not needed for API-only system
        # self.cap = None # Not needed for API-only system
        
        # Create training data directory if it doesn't exist
        if not os.path.exists(self.training_data_dir):
            os.makedirs(self.training_data_dir)
    
    def save_training_image(self, person_name: str, image_np: np.ndarray) -> str:
        """
        Saves a single image for training a person.
        Receives the image as a NumPy array.
        """
        person_dir = os.path.join(self.training_data_dir, person_name)
        if not os.path.exists(person_dir):
            os.makedirs(person_dir)
        
        # Count existing photos for the user to name the new image
        existing_photos = [f for f in os.listdir(person_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        next_photo_num = len(existing_photos) + 1
        
        image_filename = os.path.join(person_dir, f"{person_name}_{next_photo_num}.jpg")
        cv2.imwrite(image_filename, image_np)
        return image_filename

    def collect_training_data(self, person_name, num_photos=20):
        # This function is not used by the API, images are submitted directly.
        # Keeping a placeholder to avoid breaking any legacy calls, but it's effectively a no-op for the API.
        print("The collect_training_data function is not used by the API. Use the /register_face endpoint to register faces individually.")
    
    def train_model(self):
        """
        Trains the facial recognition model.
        """
        print("Iniciando treinamento do modelo...")
        
        self.known_face_encodings = []
        self.known_face_names = []
        
        # Iterate through all person folders
        for person_name in os.listdir(self.training_data_dir):
            person_dir = os.path.join(self.training_data_dir, person_name)
            if os.path.isdir(person_dir):
                print(f"Processando fotos de {person_name}...")
                
                # Process each photo of the person
                for filename in os.listdir(person_dir):
                    if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                        image_path = os.path.join(person_dir, filename)
                        
                        try:
                            # Load and encode the image
                            image = face_recognition.load_image_file(image_path)
                            print(f"[DEBUG] Imagem carregada: {image_path}")
                            face_encodings = face_recognition.face_encodings(image)
                            print(f"[DEBUG] Faces encontradas em {filename}: {len(face_encodings)}")
                            
                            if len(face_encodings) > 0:
                                # Use the first encoding found
                                self.known_face_encodings.append(face_encodings[0])
                                self.known_face_names.append(person_name)
                            else:
                                print(f"Nenhuma face encontrada em {filename}")
                                
                        except Exception as e:
                            print(f"Erro ao processar {filename}: {e}")
        
        if len(self.known_face_encodings) == 0:
            raise Exception("Nenhuma face válida encontrada para treinamento")
        
        # Save trained model
        model_data = {
            'encodings': self.known_face_encodings,
            'names': self.known_face_names
        }
        
        with open(self.model_file, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"Modelo treinado com sucesso! {len(self.known_face_encodings)} faces de {len(set(self.known_face_names))} pessoas")
    
    def load_model(self):
        """
        Loads the trained model.
        """
        if os.path.exists(self.model_file):
            with open(self.model_file, 'rb') as f:
                model_data = pickle.load(f)
                # Ensure we are loading the 'encodings' and 'names' keys directly
                # (Previous version had a 'user_faces' check, simplified for direct API use)
                if 'encodings' in model_data and 'names' in model_data:
                    self.known_face_encodings = model_data['encodings']
                    self.known_face_names = model_data['names']
                    print(f"Modelo carregado: {len(self.known_face_encodings)} faces conhecidas")
                    return True
                else:
                    print("Formato de modelo não reconhecido no arquivo PKL.")
                    return False
        else:
            print("Modelo não encontrado. Treine o modelo primeiro.")
            return False
    
    def recognize_faces(self, frame):
        """
        Recognizes faces in a frame.
        """
        if len(self.known_face_encodings) == 0:
            return [] # Return empty list if no model loaded
        
        # Resize frame for faster processing
        small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
        rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
        
        # Find faces and encodings
        face_locations = face_recognition.face_locations(rgb_small_frame)
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
        
        face_names = []
        for face_encoding in face_encodings:
            # Compare with known faces
            matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding)
            name = "Desconhecido"
            
            # Use the known face with the smallest distance
            face_distances = face_recognition.face_distance(self.known_face_encodings, face_encoding)
            if len(face_distances) > 0:
                best_match_index = np.argmin(face_distances)
                if matches[best_match_index] and face_distances[best_match_index] < 0.6:
                    name = self.known_face_names[best_match_index]
            
            face_names.append(name)
        
        return face_names # The API only needs the recognized names, not the modified frame.
