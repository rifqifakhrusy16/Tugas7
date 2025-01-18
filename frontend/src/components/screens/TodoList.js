import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';

const API_URL = 'http://192.168.203.74:5000/api/game-cartridges';

export default function GameCartridgeManager() {
  const [gameCartridges, setGameCartridges] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState('');
  const [rating, setRating] = useState('0');
  const [token, setToken] = useState('');
  const [editGameCartridgeId, setEditGameCartridgeId] = useState(null);

  useEffect(() => {
    fetchGameCartridges();
  }, []);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error picking image');
    }
  };

  const fetchGameCartridges = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        const { token } = JSON.parse(storedToken);
        setToken(token);
        const response = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        const sanitizedData = result.data.map((item) => ({
          ...item,
          price: item.price || 0, // Defaultkan ke 0 jika price undefined
          rating: item.rating || 0, // Defaultkan ke 0 jika rating undefined
          name: item.name || '', // Defaultkan ke string kosong jika name undefined
          type: item.type || '', // Defaultkan ke string kosong jika type undefined
          description: item.description || '', // Defaultkan ke string kosong jika description undefined
          photo: item.photo || '', // Defaultkan ke string kosong jika photo undefined
        }));
        setGameCartridges(sanitizedData);
      }
    } catch (error) {
      console.error('Error fetching game cartridges:', error);
    }
  };

  const handleAddGameCartridge = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          price: Number(price),
          type,
          description,
          photo,
          rating: Number(rating),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setGameCartridges((prev) => [result.data, ...prev]);
        resetForm();
      } else {
        Alert.alert('Error', result.message || 'Error adding game cartridge');
      }
    } catch (error) {
      Alert.alert('Error', 'Error adding game cartridge');
    }
  };

  const handleEditGameCartridge = async () => {
    try {
      const response = await fetch(`${API_URL}/${editGameCartridgeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          price: Number(price),
          type,
          description,
          photo,
          rating: Number(rating),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setGameCartridges((prev) =>
          prev.map((gameCartridge) =>
            gameCartridge._id === editGameCartridgeId
              ? { ...gameCartridge, name, price, type, description, photo, rating: Number(rating) }
              : gameCartridge
          )
        );
        Alert.alert('Success', 'Game cartridge updated successfully');
        resetForm();
      } else {
        Alert.alert('Error', result.message || 'Failed to update game cartridge');
      }
    } catch (error) {
      console.error('Error updating game cartridge:', error);
      Alert.alert('Error', 'An error occurred while updating the game cartridge');
    }
  };

  const handleDeleteGameCartridge = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setGameCartridges((prev) => prev.filter((gameCartridge) => gameCartridge._id !== id));
      } else {
        Alert.alert('Error', 'Error deleting game cartridge');
      }
    } catch (error) {
      Alert.alert('Error', 'Error deleting game cartridge');
    }
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setType('');
    setDescription('');
    setPhoto('');
    setRating('0');
    setShowForm(false);
    setEditGameCartridgeId(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Game Manager</Text>

      {showForm ? (
        <ScrollView style={styles.formContainer}>
          <View style={styles.formCard}>
            <TouchableOpacity onPress={pickImage} style={styles.photoContainer}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.previewImage} resizeMode="cover" />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Icon name="photo" size={40} color="#999" />
                  <Text style={styles.photoPlaceholderText}>Tap to select image</Text>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Game Title"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="Game Type"
              value={type}
              onChangeText={setType}
            />

            <TextInput
              style={styles.input}
              placeholder="Price"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Rating:</Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star.toString())}>
                    <Icon
                      name={star <= Number(rating) ? 'star' : 'star-border'}
                      size={30}
                      color="#FFD700"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={editGameCartridgeId ? handleEditGameCartridge : handleAddGameCartridge}
              >
                <Text style={styles.buttonText}>
                  {editGameCartridgeId ? 'Update Game' : 'Add Game'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={resetForm}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      ) : (
        <>
          <FlatList
            data={gameCartridges}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                {item.photo && (
                  <Image source={{ uri: item.photo }} style={styles.cardImage} resizeMode="cover" />
                )}
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardType}>{item.type}</Text>
                  <Text style={styles.cardPrice}>${item.price}</Text>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => {
                        setEditGameCartridgeId(item._id);
                        setName(item.name);
                        setPrice(item.price ? item.price.toString() : '');
                        setType(item.type);
                        setDescription(item.description);
                        setPhoto(item.photo);
                        setRating(item.rating ? item.rating.toString() : '0');
                        setShowForm(true);
                      }}
                    >
                      <Icon name="edit" size={24} color="#4CAF50" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteGameCartridge(item._id)}
                    >
                      <Icon name="delete" size={24} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
          <TouchableOpacity style={styles.fab} onPress={() => setShowForm(true)}>
            <Icon name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  formContainer: {
    flex: 1,
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  photoContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    marginTop: 8,
    color: '#999',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 5,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  ratingContainer: {
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  stars: {
    flexDirection: 'row',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 16,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardType: {
    color: '#666',
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  editButton: {
    marginRight: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#4CAF50',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
});
