// src/screens/Beranda/BerandaScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BerandaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Beranda</Text>

      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.card}>
          <Ionicons name="earth" size={60} color="#4caf50" style={styles.icon} />
          <Text style={styles.cardText}>Discover</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Ionicons name="heart" size={60} color="#e91e63" style={styles.icon} />
          <Text style={styles.cardText}>Favorites</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Ionicons name="settings" size={60} color="#3f51b5" style={styles.icon} />
          <Text style={styles.cardText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Ionicons name="library" size={60} color="#ff9800" style={styles.icon} />
          <Text style={styles.cardText}>Library</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Ionicons name="chatbubbles" size={60} color="#9c27b0" style={styles.icon} />
          <Text style={styles.cardText}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Ionicons name="person" size={60} color="#00bcd4" style={styles.icon} />
          <Text style={styles.cardText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '47%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  icon: {
    marginBottom: 10,
  },
  cardText: {
    marginTop: 10,
    fontSize: 18,
    color: '#6a11cb',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
