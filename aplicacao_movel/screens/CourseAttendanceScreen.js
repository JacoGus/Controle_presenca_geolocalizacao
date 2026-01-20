import React from 'react';
import { View, Text, StyleSheet, FlatList, Button } from 'react-native';

const attendanceData = [
  { id: '1', date: '10/09/2025', present: true },
  { id: '2', date: '12/09/2025', present: true },
  { id: '3', date: '17/09/2025', present: false },
  { id: '4', date: '19/09/2025', present: true },
];

function CourseAttendanceScreen({ route, navigation }) {
  const { course } = route?.params || {};
  
  console.log('Course object in CourseAttendanceScreen:', course);
  if (course) {
    console.log('Course ID in CourseAttendanceScreen:', course.id);
  } else {
    console.log('Course is undefined in CourseAttendanceScreen!');
  }

  // Se course não foi passado, retorna mensagem de erro
  if (!course) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Erro</Text>
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          Nenhuma disciplina foi selecionada. Volte e tente novamente.
        </Text>
        <Button title="Voltar" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.attendanceItem}>
      <Text style={styles.attendanceDate}>Data: {item.date}</Text>
      <Text style={[styles.attendanceStatus, { color: item.present ? 'green' : 'red' }]}>
        Status: {item.present ? 'Presente' : 'Faltou'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Frequência - {course.name}</Text>
      <FlatList
        data={attendanceData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      <Button 
        title="Confirmar Presença"
        onPress={() => navigation.navigate('ConfirmPresence', { courseId: course.id })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  listContent: {
    paddingBottom: 20,
  },
  attendanceItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  attendanceDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  attendanceStatus: {
    fontSize: 16,
  },
});

export default CourseAttendanceScreen;
