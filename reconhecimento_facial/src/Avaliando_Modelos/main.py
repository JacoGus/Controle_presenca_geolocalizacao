import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
from tensorflow.keras import models, layers, utils
import seaborn as sns
import matplotlib.pyplot as plt
import joblib

# --- 1. Carregar dados ---
data = pd.read_csv('C:\\Users\\gusja\\Pictures\\DataSetFaces\\faces2.csv')
print(data.head())

X = data.drop('target', axis=1).values
y = data['target'].values

# Codificar labels
le = LabelEncoder()
y_encoded = le.fit_transform(y)

# --- 2. Separar treino e validação ---
trainX, valX, trainY, valY = train_test_split(
    X, y_encoded, test_size=0.33, stratify=y_encoded, random_state=42
)

# --- 3. Normalizar features ---
scaler = StandardScaler()
trainX = scaler.fit_transform(trainX)
valX = scaler.transform(valX)

# Função para plotar matriz de confusão
def plot_confusion(y_true, y_pred, labels, title):
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=labels, yticklabels=labels)
    plt.xlabel('Predito')
    plt.ylabel('Verdadeiro')
    plt.title(title)
    plt.show()

# --- 4. KNN com GridSearch ---
knn_params = {'n_neighbors': [3, 5, 7, 9], 'weights': ['uniform', 'distance']}
knn_grid = GridSearchCV(KNeighborsClassifier(), knn_params, cv=5)
knn_grid.fit(trainX, trainY)
knn_pred = knn_grid.predict(valX)

print("🔹 Modelo: KNN")
print("Melhor parâmetro:", knn_grid.best_params_)
print("Acurácia:", accuracy_score(valY, knn_pred))
print(classification_report(valY, knn_pred, target_names=le.classes_))
plot_confusion(valY, knn_pred, le.classes_, "Matriz de Confusão - KNN")
joblib.dump(knn_grid.best_estimator_, 'knn_model.pkl')
joblib.dump(scaler, 'scaler.pkl')

# --- 5. SVM com GridSearch ---
svm_params = {'C': [1, 10, 100], 'kernel': ['linear', 'rbf'], 'gamma': ['scale', 'auto']}
svm_grid = GridSearchCV(SVC(), svm_params, cv=5)
svm_grid.fit(trainX, trainY)
svm_pred = svm_grid.predict(valX)

print("🔹 Modelo: SVM")
print("Melhor parâmetro:", svm_grid.best_params_)
print("Acurácia:", accuracy_score(valY, svm_pred))
print(classification_report(valY, svm_pred, target_names=le.classes_))
plot_confusion(valY, svm_pred, le.classes_, "Matriz de Confusão - SVM")

# --- 6. Rede Neural ---
trainY_keras = utils.to_categorical(trainY)
valY_keras = utils.to_categorical(valY)

model = models.Sequential()
model.add(layers.Input(shape=(trainX.shape[1],)))
model.add(layers.Dense(256, activation='relu'))
model.add(layers.Dropout(0.4))
model.add(layers.Dense(128, activation='relu'))
model.add(layers.Dropout(0.3))
model.add(layers.Dense(trainY_keras.shape[1], activation='softmax'))

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
history = model.fit(trainX, trainY_keras, epochs=100, batch_size=16, verbose=1,
                    validation_data=(valX, valY_keras))

keras_pred = np.argmax(model.predict(valX), axis=1)

print("🔹 Modelo: Keras")
print("Acurácia:", accuracy_score(valY, keras_pred))
print(classification_report(valY, keras_pred, target_names=le.classes_))
plot_confusion(valY, keras_pred, le.classes_, "Matriz de Confusão - Keras")

# --- Salvar modelo ---
model.save('faces.h5')
model.save('my_model.keras')
