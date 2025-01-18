import React, { useState, useEffect } from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import Splash from "./src/components/screens/Splash";

import TodoList from "./src/components/screens/TodoList";
import ProfileScreen from "./src/components/screens/Profile";
import LoginScreen from "./src/components/auth/Login";
import RegisterScreen from "./src/components/auth/Register";
import BerandaScreen from "./src/components/screens/Beranda";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TOKEN_EXPIRATION_DAYS = 2;

// Helper function to get icon name
const getIconName = (routeName) => {
  switch (routeName) {
    case "Beranda":
      return "home";
    case "Todos":
      return "list";
    case "Profil":
      return "person";
    default:
      return "home";
  }
};

// MainTabNavigator
function MainTabNavigator({ handleLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => (
          <Icon name={getIconName(route.name)} size={size} color={color} />
        ),
        tabBarActiveTintColor: "#2464EC",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Beranda" component={BerandaScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Todos" component={TodoList} options={{ headerShown: false, title: "Todos" }} />
      <Tab.Screen name="Profil"options={{headerShown: false}} >
        {props => <ProfileScreen {...props} onLogout={handleLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [isSplashVisible, setSplashVisible] = useState(true);
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const tokenData = await AsyncStorage.getItem("token");
      if (tokenData) {
        const { token, expiry } = JSON.parse(tokenData);
        const now = new Date();
        if (new Date(expiry) > now) {
          setLoggedIn(true);
        } else {
          await AsyncStorage.removeItem("token");
        }
      }
      setSplashVisible(false);
    };
    checkLoginStatus();
  }, []);

  const handleLogin = async (token) => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + TOKEN_EXPIRATION_DAYS);
    await AsyncStorage.setItem("token", JSON.stringify({ token, expiry: expiry.toISOString() }));
    setLoggedIn(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    setLoggedIn(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2464EC" barStyle="light-content" />
      {isSplashVisible ? (
        <Splash />
      ) : (
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: "#2464EC" },
              headerTintColor: "#fff",
            }}
          >
            {isLoggedIn ? (
              <>
                <Stack.Screen name="Home" options={{ headerShown: false }}>
                  {props => <MainTabNavigator {...props} handleLogout={handleLogout} />}
                </Stack.Screen>
             
              </>
            ) : (
              <>
                <Stack.Screen
                  name="Login"
                  options={{ headerShown: false }}
                >
                  {props => <LoginScreen {...props} onLogin={handleLogin} />}
                </Stack.Screen>
                <Stack.Screen name="Register" component={RegisterScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2464EC",
  },
});