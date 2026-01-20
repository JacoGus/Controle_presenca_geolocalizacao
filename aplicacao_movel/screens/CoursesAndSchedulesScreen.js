import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const coursesData = [
  {
    id: '1',
    name: 'Programação Mobile',
    schedule: 'Seg/Qua - 19:00-22:30',
    professor: 'Prof. Alex',
  },
  {
    id: '2',
    name: 'Estrutura de Dados',
    schedule: 'Ter/Qui - 19:00-22:30',
    professor: 'Prof. Carla',
  },
  {
    id: '3',
    name: 'Banco de Dados',
    schedule: 'Sex - 19:00-22:30',
    professor: 'Prof. Ricardo',
  },
];

function CoursesAndSchedulesScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.courseItem}
      onPress={() => navigation.navigate('CourseAttendance', { course: item })}
    >
      <Text style={styles.courseName}>{item.name}</Text>
      <Text style={styles.courseDetails}>Horário: {item.schedule}</Text>
      <Text style={styles.courseDetails}>Professor: {item.professor}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Disciplinas</Text>
      <FlatList
        data={coursesData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
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
  courseItem: {
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
  courseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  },
  courseDetails: {
    fontSize: 16,
    color: '#555',
    marginBottom: 3,
  },
});

export default CoursesAndSchedulesScreen;
