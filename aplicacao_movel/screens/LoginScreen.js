import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { login } from '../api/auth';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const res = await login(username, password);
    if (res.success) {
      navigation.replace('Home'); // Correção: vai pra 'Home' se o login for bem-sucedido
    } else {
      setError(res.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      
      <TextInput
        placeholder="Usuário"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <TextInput
        placeholder="Senha"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <Button title="Entrar" onPress={handleLogin} />
      
      {/* BOTÃO NOVO - IR PARA TELA DE REGISTRO */}
      <TouchableOpacity 
        onPress={() => navigation.navigate('RegisterScreen')}
        style={styles.registerButton}
      >
        <Text style={styles.registerText}>
          Não tem conta? <Text style={styles.registerTextBold}>Criar uma</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20,
    backgroundColor: '#fff'
  },
  title: { 
    fontSize: 24, 
    textAlign: 'center', 
    marginBottom: 20,
    fontWeight: 'bold'
  },
  input: { 
    borderWidth: 1, 
    padding: 10, 
    marginBottom: 10,
    borderRadius: 5,
    borderColor: '#ddd'
  },
  error: { 
    color: 'red', 
    textAlign: 'center', 
    marginBottom: 10 
  },
  registerButton: {
    marginTop: 20,
    padding: 10,
  },
  registerText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 15,
  },
  registerTextBold: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
});