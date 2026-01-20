import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importa suas telas
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import FacialRecognitionScreen from './screens/FacialRecognitionScreen';
import ConfirmPresenceScreen from './screens/ConfirmPresenceScreen';
import CourseAttendanceScreen from './screens/CourseAttendanceScreen';
import CoursesAndSchedulesScreen from './screens/CoursesAndSchedulesScreen';
import FaceRegistrationScreen from './screens/FaceRegistrationScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {/* Registrar telas com nomes usados no código (aliases) */}
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ title: 'Criar Conta' }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />

        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
        
        {/* Reconhecimento Facial - nomes alternativos */}
        <Stack.Screen name="FacialRecognition" component={FacialRecognitionScreen} options={{ title: 'Reconhecimento Facial' }} />
        <Stack.Screen name="FacialRecognitionScreen" component={FacialRecognitionScreen} options={{ title: 'Reconhecimento Facial' }} />

        {/* Confirmar Presença - nomes alternativos */}
        <Stack.Screen name="ConfirmPresence" component={ConfirmPresenceScreen} options={{ title: 'Confirmar Presença' }} />
        <Stack.Screen name="ConfirmPresenceScreen" component={ConfirmPresenceScreen} options={{ title: 'Confirmar Presença' }} />

        {/* Frequência / Presenças - nomes alternativos */}
        <Stack.Screen name="CourseAttendance" component={CourseAttendanceScreen} options={{ title: 'Frequência' }} />
        <Stack.Screen name="CourseAttendanceScreen" component={CourseAttendanceScreen} options={{ title: 'Frequência' }} />

        {/* Cursos */}
        <Stack.Screen name="Courses" component={CoursesAndSchedulesScreen} options={{ title: 'Minhas Disciplinas' }} />

        {/* Registro de face (usado no fluxo de cadastro) */}
        <Stack.Screen name="FaceRegistration" component={FaceRegistrationScreen} options={{ title: 'Registrar Face' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
