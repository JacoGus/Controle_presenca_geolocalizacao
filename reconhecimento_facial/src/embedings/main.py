from PIL import Image
from os import listdir
from os.path import isdir, join
from numpy import asarray, expand_dims
import numpy as np
import pandas as pd
from sklearn.utils import shuffle
from keras_facenet import FaceNet


# --- 1. Carregar imagens de face de um diretório ---
def load_face(filename):
    image = Image.open(filename)
    image = image.convert('RGB')
    image = asarray(image)
    return image


# --- 2. Carregar dataset ---
def load_faces(directory_src):
    faces = list()
    for filename in listdir(directory_src):
        path = join(directory_src, filename)  # Melhor uso de os.path.join

        try:
            faces.append(load_face(path))
        except:
            print(f"Erro na imagem {path}")

    return faces


def load_fotos(directory_src):
    all_faces = list()
    all_labels = list()

    for subdir in listdir(directory_src):
        path = join(directory_src, subdir)

        if not isdir(path):
            continue

        faces = load_faces(path)
        labels = [subdir for _ in range(len(faces))]

        print(f'>Carregadas {len(faces)} faces da classe: {subdir}')

        all_faces.extend(faces)
        all_labels.extend(labels)

    # Converte as listas para arrays NumPy sem dtype='object'
    # o NumPy inferirá o tipo de dado numérico correto
    return asarray(all_faces), asarray(all_labels)


# --- Código Principal ---
trainX, trainy = load_fotos(directory_src="C:\\Users\\gusja\\Pictures\\DataSetFaces\\rostos\\")
print(f"Shape dos dados carregados: {trainX.shape}, {trainy.shape}")

model = FaceNet()


def get_embeddings(model, face_pixels):
    # Converte para float32 para garantir compatibilidade com TensorFlow
    face_pixels = face_pixels.astype('float32')

    mean, std = face_pixels.mean(), face_pixels.std()
    face_pixels = (face_pixels - mean) / std

    samples = expand_dims(face_pixels, axis=0)

    yaht = model.model.predict(samples)
    return yaht[0]


newTrainX = list()
for face in trainX:
    embedding = get_embeddings(model, face)
    newTrainX.append(embedding)

# O shape de newTrainX é uma lista de arrays, então use np.array()
newTrainX = np.array(newTrainX)

print(newTrainX.shape)

df = pd.DataFrame(data=newTrainX)
df['target'] = trainy
df.to_csv('C:\\Users\\gusja\\Pictures\\DataSetFaces\\faces2.csv')

X, y = shuffle(newTrainX, trainy, random_state=0)