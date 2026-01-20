from mtcnn import MTCNN
from PIL import Image
from os import listdir
from os.path import isdir
from numpy import asarray

detector = MTCNN()

def extract_faces(arquivo, size = (160,160)):
    img = Image.open(arquivo)

    img = img.convert('RGB')

    array = asarray(img)

    results = detector.detect_faces(array)

    x1, y1, width, height = results[0]['box']
    x2, y2 = x1 + width, y1 + height

    face = array[y1:y2, x1:x2]

    image = Image.fromarray(face)
    image = image.resize(size)

    return image

def flip_image(image):
    image = image.transpose(Image.FLIP_LEFT_RIGHT)
    return image


def load_photos(directory_src, directory_target):

    for arquivo in listdir(directory_src):

        path             = directory_src + arquivo
        path_target      = directory_target + arquivo
        path_target_flip = directory_target + "flip-" + arquivo

        try:
            face = extract_faces(path)
            img  = flip_image(face)

            face.save(path_target, "JPEG", quality=100, optimize=True, progressive=True)
            img.save(path_target_flip, "JPEG", quality=100, optimize=True, progressive=True)


        except:
            print("Erro na imagem {}".format(path))




def load_dir(directory_src, directory_target):
    for subdir in listdir(directory_src):

        path = directory_src + subdir + "\\"

        path_target = directory_target + subdir + "\\"

        if not isdir(path):
            continue

        load_photos(path, path_target)

if __name__ == '__main__':
    load_dir("C:\\Users\\gusja\\Pictures\\DataSetFaces\\fotos\\",
         "C:\\Users\\gusja\\Pictures\\DataSetFaces\\rostos\\")