// Developed by:
//Gustavo Jacó
//Artur Carlo Costa Pádua
//Enzo Batista Salerno
//João Victor Ferreira
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const API_BASE_URL = 'http://192.168.1.103:5000'; // IP real do PC (rede Wi-Fi)

export default function FaceRegistrationScreen({ navigation, route }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { username } = route.params || {};

  useEffect(() => {
    (async () => {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPermission.status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar a câmera para tirar fotos de registro facial.');
      }
    })();
  }, []);

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleRegisterFace = async () => {
    if (!username || !username.trim()) {
      Alert.alert('Erro', 'Nome de usuário não fornecido para registro de face.');
      return;
    }
    if (!image) {
      Alert.alert('Erro', 'Por favor, tire uma foto para registrar sua face.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('person_name', username);
    formData.append('image', {
      uri: image,
      name: `${username}_${Date.now()}.jpg`,
      type: 'image/jpeg',
    });

    try {
      const response = await fetch(`${API_BASE_URL}/register_face`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Sucesso', data.message || 'Face registrada com sucesso!');
        // Opcional: Treinar o modelo imediatamente após o registro da face
        await handleTrainModel();
        navigation.navigate('Home');
      } else {
        Alert.alert('Erro', data.detail || 'Falha ao registrar face.');
      }
    } catch (error) {
      console.error('Erro de rede ou outra falha:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor. Verifique sua conexão e o IP da API.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrainModel = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/train`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Sucesso', data.message || 'Modelo treinado com sucesso!');
      } else {
        Alert.alert('Erro', data.detail || 'Falha ao treinar modelo.');
      }
    } catch (error) {
      console.error('Erro de rede ou outra falha (treinamento):', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor para treinar o modelo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Minha Face</Text>
      {username && <Text style={styles.subtitle}>Olá, {username}! Tire uma foto para registrar sua face.</Text>}
      {!username && <Text style={styles.subtitle}>Por favor, faça login ou cadastre-se antes de registrar sua face.</Text>}

      <Button title="Tirar Foto" onPress={takePhoto} disabled={loading} />
      {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

      <View style={styles.buttonContainer}>
        <Button 
          title="Registrar Face e Treinar Modelo" 
          onPress={handleRegisterFace} 
          disabled={loading || !username || !image} 
        />
      </View>

      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.spinner} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  imagePreview: {
    width: 250,
    height: 250,
    borderRadius: 125,
    marginTop: 20,
    marginBottom: 30,
    borderColor: '#ddd',
    borderWidth: 2,
  },
  buttonContainer: {
    width: '90%',
    marginTop: 10,
  },
  spinner: {
    marginTop: 20,
  },
});



