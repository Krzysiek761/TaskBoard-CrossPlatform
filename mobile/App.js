import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import axios from 'axios';

const MAC_IP = '192.168.0.120';
const API = `http://${MAC_IP}:3000/api`;

const Stack = createNativeStackNavigator();

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async () => {
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const res = await axios.post(`${API}${endpoint}`, { username, password });
      if (isLogin) {
        await AsyncStorage.setItem('token', res.data.token);
        navigation.replace('Board');
      } else {
        Alert.alert('Sukces', 'Konto utworzone! Możesz się teraz zalogować.');
        setIsLogin(true);
      }
    } catch (err) {
      Alert.alert('Błąd', err.response?.data?.error || 'Problem z serwerem');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Logowanie' : 'Rejestracja'}</Text>
      <TextInput style={styles.input} placeholder="Login" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Hasło" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{isLogin ? 'Zaloguj' : 'Zarejestruj'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.linkText}>{isLogin ? 'Nie masz konta? Zarejestruj się.' : 'Masz konto? Zaloguj się.'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const BoardScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${API}/tasks`, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Login');
  };

  const deleteTask = async (id) => {
    const token = await AsyncStorage.getItem('token');
    await axios.delete(`${API}/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchTasks();
  };

  const toggleStatus = async (task) => {
    const token = await AsyncStorage.getItem('token');
    const newStatus = task.status === 'Do zrobienia' ? 'Zrobione' : 'Do zrobienia';
    await axios.put(`${API}/tasks/${task.id}`, { ...task, status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
    fetchTasks();
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => fetchTasks());
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TaskBoard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Wyloguj</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('NewTask')}>
        <Text style={styles.buttonText}>Dodaj nowe zadanie</Text>
      </TouchableOpacity>
      <FlatList
        data={tasks}
        keyExtractor={t => t.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text style={styles.status}>Status: <Text style={{fontWeight: 'bold'}}>{item.status}</Text></Text>
            {item.latitude && <Text style={{fontSize: 10, color: 'gray'}}>Lokalizacja: {item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}</Text>}
            <View style={styles.actions}>
              <TouchableOpacity style={[styles.button, styles.actionBtn]} onPress={() => toggleStatus(item)}>
                <Text style={styles.buttonText}>Zmień status</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.deleteButton, styles.actionBtn, {backgroundColor: '#ef4444'}]} onPress={() => deleteTask(item.id)}>
                <Text style={styles.buttonText}>Usuń</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{marginTop: 20}}>Brak zadań. Dodaj coś!</Text>}
      />
    </View>
  );
};

const NewTaskScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const handleAdd = async () => {
    const token = await AsyncStorage.getItem('token');
    let lat = null, lon = null;
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        lat = location.coords.latitude;
        lon = location.coords.longitude;
      }
    } catch (e) { console.log('Błąd geolokalizacji', e); }

    await axios.post(`${API}/tasks`, { title, description: desc, status: 'Do zrobienia', latitude: lat, longitude: lon }, { headers: { Authorization: `Bearer ${token}` } });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nowe Zadanie</Text>
      <TextInput style={styles.input} placeholder="Tytuł" value={title} onChangeText={setTitle} />
      <TextInput style={[styles.input, { height: 80 }]} placeholder="Opis" value={desc} onChangeText={setDesc} multiline />
      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Zapisz</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Board" component={BoardScreen} />
        <Stack.Screen name="NewTask" component={NewTaskScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#d1d5db' },
  button: { backgroundColor: '#3b82f6', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 13 },
  linkText: { color: '#3b82f6', textAlign: 'center', marginTop: 10 },
  logoutButton: { backgroundColor: '#ef4444', padding: 10, borderRadius: 8 },
  deleteButton: { backgroundColor: '#ef4444', padding: 15, borderRadius: 8, justifyContent: 'center' },
  taskCard: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#e5e7eb' },
  taskTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  status: { color: '#6b7280', marginTop: 5, fontSize: 12 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, gap: 10 },
  actionBtn: { flex: 1, padding: 12, marginBottom: 0 }
});
