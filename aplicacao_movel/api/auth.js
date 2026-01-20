import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Autenticação no Render (remoto)
const AUTH_URL = 'https://authentication-api-cd9w.onrender.com';
// Reconhecimento facial no localhost (local) - seu IP
const API_URL = 'http://192.168.1.103:5000'; // IP real do PC (rede Wi-Fi)

// ========================================
// FUNÇÃO DE REGISTRO
// ========================================
export async function register(username, password) {
  try {
    console.log('📝 Registrando usuário:', username);
    const res = await axios.post(`${AUTH_URL}/register`, { 
      username, 
      password 
    });
    console.log('✅ Registro bem-sucedido');
    return { 
      success: true, 
      message: res.data.message 
    };
  } catch (err) {
    console.error('❌ Erro no registro:', err.response?.data || err.message);
    return { 
      success: false, 
      message: err.response?.data?.message || 'Erro ao criar conta' 
    };
  }
}

// ========================================
// FUNÇÃO DE LOGIN
// ========================================
export async function login(username, password) {
  try {
    console.log('🔐 Fazendo login:', username);
    console.log('🌐 URL:', `${AUTH_URL}/login`);
    
    const res = await axios.post(`${AUTH_URL}/login`, { username, password });
    
    console.log('📦 Resposta do login:', res.data);
    
    const token = res.data.access_token;
    
    if (!token) {
      console.error('❌ Token não veio na resposta!');
      return { success: false, message: 'Token não recebido' };
    }
    
    console.log('🔑 Token recebido:', token.substring(0, 20) + '...');
    
    await AsyncStorage.setItem('token', token);
    console.log('💾 Token salvo no AsyncStorage');
    
    const savedToken = await AsyncStorage.getItem('token');
    console.log('✅ Token verificado no storage:', savedToken ? 'OK' : 'FALHOU!');
    
    return { success: true };
  } catch (err) {
    console.error('❌ Erro no login:', err.response?.data || err.message);
    return { success: false, message: err.response?.data?.message || 'Erro no login' };
  }
}

// ========================================
// FUNÇÃO DE PERFIL
// ========================================
export async function getProfile() {
  try {
    console.log('👤 Buscando perfil do usuário...');
    console.log('🌐 URL:', `${AUTH_URL}/profile`);
    
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      console.error('❌ Token NÃO encontrado no AsyncStorage!');
      return null;
    }
    
    console.log('🔑 Token encontrado:', token.substring(0, 20) + '...');
    
    const res = await axios.get(`${AUTH_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Perfil recebido:', res.data);
    return res.data;
    
  } catch (err) {
    console.error('❌ Erro ao buscar perfil:');
    console.error('  - Status:', err.response?.status);
    console.error('  - Mensagem:', err.response?.data || err.message);
    console.error('  - Headers:', err.response?.headers);
    return null;
  }
}

// ========================================
// FUNÇÕES DE RECONHECIMENTO FACIAL (LOCAL)
// ========================================

export async function registerFace(personName, imageUri) {
  try {
    console.log('📸 Registrando face para:', personName);
    console.log('🌐 URL:', `${API_URL}/register_face`);
    
    const formData = new FormData();
    formData.append('person_name', personName);
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'face.jpg',
    });
    
    const res = await axios.post(`${API_URL}/register_face`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    console.log('✅ Face registrada:', res.data);
    return { success: true, data: res.data };
    
  } catch (err) {
    console.error('❌ Erro ao registrar face:', err.response?.data || err.message);
    return { success: false, message: err.response?.data?.message || 'Erro ao registrar face' };
  }
}

export async function trainModel() {
  try {
    console.log('🎓 Treinando modelo...');
    console.log('🌐 URL:', `${API_URL}/train`);
    
    const res = await axios.post(`${API_URL}/train`);
    
    console.log('✅ Modelo treinado:', res.data);
    return { success: true, data: res.data };
    
  } catch (err) {
    console.error('❌ Erro ao treinar modelo:', err.response?.data || err.message);
    return { success: false, message: err.response?.data?.message || 'Erro ao treinar modelo' };
  }
}

export async function recognizeFace(imageUri) {
  try {
    console.log('🔍 Reconhecendo face...');
    console.log('🌐 URL:', `${API_URL}/recognize`);
    
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'face.jpg',
    });
    
    const res = await axios.post(`${API_URL}/recognize`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    console.log('✅ Face reconhecida:', res.data);
    return { success: true, data: res.data };
    
  } catch (err) {
    console.error('❌ Erro ao reconhecer face:', err.response?.data || err.message);
    return { success: false, message: err.response?.data?.message || 'Face não reconhecida' };
  }
}

export async function recognizeAndRegister(imageUri, courseId, latitude, longitude) {
  try {
    console.log('📍 Reconhecendo e registrando presença...');
    console.log('🌐 URL:', `${API_URL}/recognize_and_register`);
    
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'face.jpg',
    });
    formData.append('courseId', courseId);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    
    const res = await axios.post(`${API_URL}/recognize_and_register`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    console.log('✅ Presença registrada:', res.data);
    return { success: true, data: res.data };
    
  } catch (err) {
    console.error('❌ Erro ao registrar presença:', err.response?.data || err.message);
    return { success: false, message: err.response?.data?.message || 'Erro ao registrar presença' };
  }
}