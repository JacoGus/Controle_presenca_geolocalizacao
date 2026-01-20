// Developed by:
//Gustavo Jacó
//Artur Carlo Costa Pádua
//Enzo Batista Salerno
//João Victor Ferreira
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { getProfile } from '../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.103:5000'; // IP real do PC (rede Wi-Fi)

function HomeScreen({ navigation }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    console.log('🔍 Buscando perfil do usuário...');
    
    const profile = await getProfile();
    console.log('📦 Perfil recebido:', profile);
    
    if (profile && profile.username) {
      setStudent({
        name: profile.username,
        ra: profile.id || 'N/A',
        course: 'Ciência da Computação',
        photo: 'https://via.placeholder.com/150',
      });
      console.log('✅ Perfil carregado com sucesso');
    } else {
      console.log('❌ Falha ao buscar perfil');
      Alert.alert(
        'Erro',
        'Não foi possível carregar seu perfil. Faça login novamente.',
        [{ text: 'OK', onPress: () => navigation.replace('LoginScreen') }]
      );
    }
    
    setLoading(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            navigation.replace('LoginScreen');
          }
        }
      ]
    );
  };

  const handleTrainModel = async () => {
    if (training) return;
    setTraining(true);
    try {
      const response = await fetch(`${API_BASE_URL}/train`, {
        method: 'POST',
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        Alert.alert('Treinamento', data.message || 'Treinamento iniciado/completado com sucesso.');
      } else {
        Alert.alert('Erro no Treinamento', data.error || 'Falha ao iniciar o treinamento.');
      }
    } catch (error) {
      console.error('Erro ao chamar /train:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor para treinar o modelo.');
    } finally {
      setTraining(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  if (!student) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Erro ao carregar perfil</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.replace('LoginScreen')}
        >
          <Text style={styles.retryButtonText}>Voltar ao Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: student.photo }} style={styles.profileImage} />
        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.info}>RA: {student.ra}</Text>
        <Text style={styles.info}>Curso: {student.course}</Text>

        {training && (
          <View style={{ marginTop: 12, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#007bff" />
            <Text style={{ color: '#007bff', marginTop: 6 }}>Treinando modelo...</Text>
          </View>
        )}
      </View>

      <View style={styles.menuContainer}>
        {/* Reconhecimento Facial */}
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('FacialRecognitionScreen')}
        >
          <Text style={styles.menuIcon}>📸</Text>
          <Text style={styles.menuButtonText}>Reconhecimento Facial</Text>
        </TouchableOpacity>

        {/* Confirmar Presença */}
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('ConfirmPresenceScreen')}
        >
          <Text style={styles.menuIcon}>✅</Text>
          <Text style={styles.menuButtonText}>Confirmar Presença</Text>
        </TouchableOpacity>

        {/* Ver Presenças */}
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('CourseAttendanceScreen')}
        >
          <Text style={styles.menuIcon}>📊</Text>
          <Text style={styles.menuButtonText}>Ver Presenças</Text>
        </TouchableOpacity>

        {/* Cursos e Horários */}
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('Courses')}
        >
          <Text style={styles.menuIcon}>📚</Text>
          <Text style={styles.menuButtonText}>Cursos e Horários</Text>
        </TouchableOpacity>

        {/* Novo: Treinar Modelo */}
        <TouchableOpacity 
          style={[styles.menuButton, { backgroundColor: '#e9f5ff' }]}
          onPress={handleTrainModel}
          disabled={training}
        >
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuButtonText}>Treinar Modelo</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    padding: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#007bff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  info: {
    fontSize: 16,
    color: '#555',
    marginBottom: 3,
  },
  menuContainer: {
    flex: 1,
  },
  menuButton: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  menuButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    paddingHorizontal: 30,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
