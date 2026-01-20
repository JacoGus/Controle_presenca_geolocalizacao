import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';

function ConfirmPresenceScreen({ route, navigation }) {
  const { courseId } = route.params;

  const handleConfirm = () => {
    // In a real application, you would send this confirmation to a backend.
    Alert.alert('Presença Confirmada', 'Sua presença foi registrada com sucesso!');
    navigation.goBack(); // Go back to the CourseAttendanceScreen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirmar Presença</Text>
      <Text style={styles.subtitle}>Disciplina ID: {courseId}</Text>
      <Button 
        title="Confirmar Presença Manualmente"
        onPress={handleConfirm}
      />
      <Button 
        title="Fazer Reconhecimento Facial"
        onPress={() => {
          console.log('Tentando navegar para FacialRecognition!');
          navigation.navigate('FacialRecognition', { courseId: courseId });
        }}
        color="#007bff"
        style={styles.facialRecognitionButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 30,
  },
  facialRecognitionButton: {
    marginTop: 20,
  },
});

export default ConfirmPresenceScreen;
