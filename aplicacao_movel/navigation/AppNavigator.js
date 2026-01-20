import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen'; // Sua tela de cadastro de usuário
import HomeScreen from '../screens/HomeScreen';
import CoursesAndSchedulesScreen from '../screens/CoursesAndSchedulesScreen';
import CourseAttendanceScreen from '../screens/CourseAttendanceScreen';
import ConfirmPresenceScreen from '../screens/ConfirmPresenceScreen';
import FacialRecognitionScreen from '../screens/FacialRecognitionScreen';
import FaceRegistrationScreen from '../screens/FaceRegistrationScreen'; // Adicionei esta linha

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ title: 'Cadastro de Usuário' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
        <Stack.Screen name="Courses" component={CoursesAndSchedulesScreen} options={{ title: 'Minhas Disciplinas' }} />
        <Stack.Screen name="CourseAttendance" component={CourseAttendanceScreen} options={{ title: 'Frequência' }} />
        <Stack.Screen name="ConfirmPresence" component={ConfirmPresenceScreen} options={{ title: 'Confirmar Presença' }} />
        <Stack.Screen name="FacialRecognition" component={FacialRecognitionScreen} options={{ title: 'Reconhecimento Facial' }} />
        <Stack.Screen name="FaceRegistration" component={FaceRegistrationScreen} options={{ title: 'Registrar Face' }} /> {/* Adicionei esta linha */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;






