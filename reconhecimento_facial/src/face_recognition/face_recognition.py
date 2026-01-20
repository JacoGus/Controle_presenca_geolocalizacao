import numpy as np
from PIL import Image
from mtcnn.mtcnn import MTCNN
import cv2
from keras_facenet import FaceNet
from tensorflow.keras.models import load_model
import joblib
import os

data_dir = r"C:\Users\gusja\Pictures\DataSetFaces\rostos"
pessoa = os.listdir(data_dir)
num_classes = len(pessoa)

cap = cv2.VideoCapture(0)

detector = MTCNN()
facenet = FaceNet()
model = load_model("faces.h5")
encoder = joblib.load("label_encoder.pkl")

def extract_face(image, box, required_size=(160, 160)):
    pixels = np.asarray(image)
    x1, y1, width, height = box
    x2, y2 = x1 + width, y1 + height
    face = pixels[y1:y2, x1:x2]
    image = Image.fromarray(face)
    image = image.resize(required_size)
    return np.asarray(image)

def get_embeddings(facenet, face_pixels):
    face_pixels = face_pixels.astype('float32')

    mean, std = face_pixels.mean(), face_pixels.std()
    face_pixels = (face_pixels - mean) / std

    samples = np.expand_dims(face_pixels, axis=0)

    yhat = facenet.embeddings(samples)  # API do keras-facenet
    return yhat[0]

while True:
    _, frame = cap.read()


    faces = detector.detect_faces(frame)

    for face in faces:
        confidence = face['confidence']
        if confidence >= 0.98:  # de 0 a 1

            x1, y1, width, height = face['box']
            face = extract_face(frame, face['box'])



            embedding = get_embeddings(facenet, face)
            tensor = np.expand_dims(embedding, axis=0)

            pred = model.predict(tensor)
            classe = np.argmax(pred, axis=1)[0]
            user = encoder.inverse_transform([classe])[0].upper()
            prob = np.max(pred) * 100

            color = (192, 255, 119)
            cv2.rectangle(frame, (x1,y1), (x1+width, y1+height), color, 2)

            font = cv2.FONT_HERSHEY_SIMPLEX
            cv2.putText(frame, f"{user} {prob:.1f}%", (x1, y1-10), font, 0.5, color, 1)

    cv2.imshow("face_recognition", frame)

    if cv2.waitKey(1) & 0xFF == 27:  # ESC
        break

cap.release()
cv2.destroyAllWindows()
