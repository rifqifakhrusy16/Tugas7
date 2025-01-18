import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, Button, Image, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from '@expo/vector-icons'; // Mengimpor ikon

export default function ProfileScreen({ onLogout }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // Untuk mengatur mode edit
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const tokenData = await AsyncStorage.getItem("token");
        if (!tokenData) throw new Error("No token found");

        const { token } = JSON.parse(tokenData);
        const response = await fetch("http://192.168.10.15:5000/api/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const { data } = await response.json();
        setUserData(data);
        setUsername(data.username); // Set username dan email ke state
        setEmail(data.email);
      } catch (error) {
        Alert.alert("Error", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveChanges = async () => {
    try {
      const tokenData = await AsyncStorage.getItem("token");
      if (!tokenData) throw new Error("No token found");

      const { token } = JSON.parse(tokenData);

      const response = await fetch("http://192.168.10.15:5000/api/profile", {
        method: "PUT", // Menggunakan PUT untuk update data
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const { data } = await response.json();
      setUserData(data);
      setIsEditing(false); // Setelah berhasil update, keluar dari mode edit
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2464EC" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load profile</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.profileCard}>
        <Image
          source={{ uri: userData.avatar || "https://via.placeholder.com/150" }}
          style={styles.avatar}
        />
        
        {/* Form Input untuk Nama Pengguna */}
        <Text style={styles.label}>Nama Pengguna:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
          />
        ) : (
          <Text style={styles.value}>{userData.username}</Text>
        )}

        {/* Form Input untuk Email */}
        <Text style={styles.label}>Email:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        ) : (
          <Text style={styles.value}>{userData.email}</Text>
        )}

        {/* Memindahkan email dan tanggal ke bawah */}
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color="#6c757d" />
          <Text style={styles.value}>
            {new Date(userData.createdAt).toLocaleDateString("id-ID")}
          </Text>
        </View>
      </View>

      {/* Container untuk Setting */}
      <View style={styles.settingContainer}>
        <View style={styles.iconRow}>
          <Ionicons name="settings-outline" size={24} color="#6c757d" />
          <Text style={styles.iconText}>Setting</Text>
        </View>
      </View>

      {/* Container untuk Privacy */}
      <View style={styles.privacyContainer}>
        <View style={styles.iconRow}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#6c757d" />
          <Text style={styles.iconText}>Privacy</Text>
        </View>
      </View>

      <Button title={isEditing ? "Save Changes" : "Edit Profile"} onPress={isEditing ? handleSaveChanges : () => setIsEditing(true)} color="#4A90E2" />
      <Button title="Logout" onPress={onLogout} color="#dc3545" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f4f8",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#4A90E2",
  },
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
    alignItems: "flex-start", // Mengatur agar elemen berada di kiri
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#4A90E2",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6c757d",
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
    color: "#343a40",
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    marginBottom: 10,
    width: "100%",
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  iconText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#343a40",
  },
  settingContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
  },
  privacyContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
  },
});
