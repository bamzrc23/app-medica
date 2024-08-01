import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { useUser } from "../usuario";
import {
  TouchableOpacity,
  ScrollView,
  Image,
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// Reemplaza con la URL de tu imagen de portada del login
const profilePicture =
  "https://as1.ftcdn.net/v2/jpg/05/57/55/38/1000_F_557553817_wzlRUvRrcsyVSkFg8g3YuwhXMZTprjlB.jpg";

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { loginUser } = useUser();
  const [errorMessage, setErrorMessage] = useState("");

  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      await loginUser(username, password);
      // Navega a la siguiente pantalla si el login es exitoso
    } catch (error) {
      setErrorMessage("Usuario o contraseña incorrectos");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{}} style={[styles.image, StyleSheet.absoluteFill]} />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.login}>
          <Image
            source={{ uri: profilePicture }}
            style={styles.profilePicture}
          />
          <Text style={styles.title}>ConsultaMóvil</Text>
          <Text style={styles.subtitle}>
            Tu puerta virtual a un cuidado más cercano
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Correo Electrónico"
              value={username}
              onChangeText={(text) => setUsername(text)}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              secureTextEntry={true}
              value={password}
              onChangeText={(text) => setPassword(text)}
            />
          </View>
          <TouchableOpacity onPress={handleLogin} style={styles.button}>
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            style={{...styles.button, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#8384ee'}}
          >
            <Text style={styles.buttonTextSecondary}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  image: {
    flex: 1,
    width: "100%",
  },
  login: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    padding: 20,
  },
  profilePicture: {
    width: 200,
    height: 160,
    borderRadius: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    height: 45,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: '#c1c1c1',
    borderRadius: 10,
    paddingHorizontal: 10,
    color: "#000",
  },
  button: {
    width: "100%",
    height: 45,
    backgroundColor: "#8384ee",
    borderRadius: 10,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
  },
  buttonTextSecondary: {
    color: "#8384ee",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
  },
});

export default LoginScreen;
