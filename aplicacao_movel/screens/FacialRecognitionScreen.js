// Developed by:
//Gustavo Jacó
//Artur Carlo Costa Pádua
//Enzo Batista Salerno
//João Victor Ferreira

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';

const API_BASE_URL = 'http://192.168.1.103:5000'; // IP real do PC (rede Wi-Fi)

export default function FacialRecognitionScreen({ navigation, route }) {
  const [cameraPermission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState(null);
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState({});
  const [selectedUnitId, setSelectedUnitId] = useState(null);

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const url = `${API_BASE_URL}/units`;
      console.log('🔍 Buscando unidades de:', url);
      
      const res = await fetch(url);
      console.log('📡 Status da resposta:', res.status);
      console.log('📡 Headers da resposta:', res.headers);
      
      const json = await res.json();
      console.log('✅ Resposta JSON completa:', JSON.stringify(json));
      
      if (json && json.units) {
        console.log('✅ Unidades carregadas com sucesso:', Object.keys(json.units).length, 'unidade(s)');
        console.log('📋 Unidades:', json.units);
        setUnits(json.units);
        const firstId = Object.keys(json.units)[0] || null;
        console.log('🎯 Primeira unidade selecionada automaticamente:', firstId);
        setSelectedUnitId(firstId);
      } else {
        console.warn('⚠️ Resposta não contém json.units. Resposta:', json);
        // Fallback: unidades mockadas para testes
        const mockUnits = {
          "1": { "name": "Unidade de Saúde - Centro", "lat": -21.780096, "lon": -46.601921, "radius_meters": 80 },
          "2": { "name": "Casa do DEV", "lat": -21.783894, "lon": -46.602757, "radius_meters": 100 }
        };
        console.log('⚠️ Usando unidades mockadas para testes');
        setUnits(mockUnits);
        setSelectedUnitId("1");
      }
    } catch (err) {
      console.error('❌ Erro ao carregar unidades:', err.message);
      console.error('❌ Stack:', err.stack);
      // Fallback: unidades mockadas para testes
      const mockUnits = {
        "1": { "name": "Unidade de Saúde - Centro", "lat": -21.780096, "lon": -46.601921, "radius_meters": 80 },
        "2": { "name": "Casa do DEV", "lat": -21.783894, "lon": -46.602757, "radius_meters": 100 }
      };
      console.log('⚠️ Usando unidades mockadas (fallback) após erro de rede');
      setUnits(mockUnits);
      setSelectedUnitId("1");
    }
  };

  const handleFaceRecognition = async () => {
    if (loading) return;
    setLoading(true);

    if (!cameraRef) {
      setLoading(false);
      return Alert.alert('Erro', 'Câmera não disponível.');
    }

    try {
      let photo = await cameraRef.takePictureAsync({ base64: false });
      console.log('Photo taken:', photo.uri);

      const formData = new FormData();
      formData.append('image', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });

      // Se uma unidade foi selecionada, tentamos obter localização e chamar /recognize_and_register
      if (selectedUnitId) {
        console.log('Iniciando reconhecimento com registro + geolocalização para unidade:', selectedUnitId);
        // pedir permissão de localização
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão', 'Permissão de localização é necessária para registrar presença.');
          setLoading(false);
          return;
        }

        console.log('Obtendo localização...');
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced, timeout: 10000 });
        const latitude = loc.coords.latitude;
        const longitude = loc.coords.longitude;
        console.log('Localização obtida:', latitude, longitude);

        formData.append('latitude', String(latitude));
        formData.append('longitude', String(longitude));
        formData.append('courseId', String(selectedUnitId));

        console.log('Enviando para /recognize_and_register...');
        const response = await fetch(`${API_BASE_URL}/recognize_and_register`, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        console.log('Resposta /recognize_and_register:', result);
        if (response.ok && result.success) {
          Alert.alert('Presença', `Presença registrada: ${result.recognized_faces?.join(', ')}`);
          navigation.goBack();
        } else {
          Alert.alert('Falha', result.reason || 'Não foi possível registrar presença.');
        }
      } else {
        // reconhecimento simples
        console.log('Iniciando reconhecimento simples (sem geofence)...');
        const response = await fetch(`${API_BASE_URL}/recognize`, {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        console.log('Resposta /recognize:', result);
        if (response.ok) {
          if (result.recognized_faces && result.recognized_faces.length > 0 && result.recognized_faces[0] !== "Desconhecido") {
            const recognizedName = result.recognized_faces[0];
            Alert.alert('Reconhecimento Facial', `Rosto reconhecido: ${recognizedName}`);
            navigation.goBack();
          } else {
            Alert.alert('Reconhecimento Facial', 'Nenhuma face conhecida foi detectada ou a face é desconhecida.');
          }
        } else {
          Alert.alert('Erro na API', result.detail || 'Ocorreu um erro no servidor da API de reconhecimento.');
        }
      }

    } catch (error) {
      console.error('Erro ao tirar foto ou enviar para API:', error);
      Alert.alert('Erro', `Não foi possível completar o reconhecimento facial.\nDetalhes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!cameraPermission) {
    return <View style={styles.container}><Text>Carregando permissões da câmera...</Text></View>;
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>
          Precisamos da sua permissão para acessar a câmera para o reconhecimento facial.
        </Text>
        <Button onPress={requestPermission} title="Conceder Permissão" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={'front'}
        ref={ref => setCameraRef(ref)}
      />

      <View style={{ width: '100%', padding: 12 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Unidade para registro:</Text>
        <Text style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>
          {Object.keys(units).length} unidade(s) encontrada(s). Selecionada: {selectedUnitId || 'Nenhuma'}
        </Text>
        <ScrollView horizontal contentContainerStyle={{ paddingVertical: 8 }}>
          {Object.keys(units).length === 0 && (
            <Text style={{ color: '#666' }}>Nenhuma unidade configurada no servidor.</Text>
          )}
          {Object.entries(units).map(([id, u]) => (
            <View key={id} style={{ marginRight: 10 }}>
              <Button
                title={`${u.name}`}
                onPress={() => {
                  console.log('Unidade selecionada:', id);
                  setSelectedUnitId(id);
                }}
                color={selectedUnitId === id ? '#2e86de' : undefined}
              />
            </View>
          ))}
          <View style={{ marginRight: 10 }}>
            <Button title="Nenhum" onPress={() => {
              console.log('Nenhuma unidade selecionada');
              setSelectedUnitId(null);
            }} />
          </View>
        </ScrollView>
      </View>

      <Button 
        title={loading ? "Reconhecendo..." : "Fazer Reconhecimento Facial"} 
        onPress={handleFaceRecognition} 
        disabled={loading} // Desabilita o botão enquanto carrega
      />
      {!selectedUnitId && (
        <Text style={styles.note}>Nenhuma unidade selecionada — será feito apenas o reconhecimento (sem registrar presença).</Text>
      )}
      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.spinner} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  camera: {
    flex: 1,
    width: '100%',
    marginBottom: 20,
  },
  spinner: {
    marginTop: 20,
  },
  note: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
  },
});
