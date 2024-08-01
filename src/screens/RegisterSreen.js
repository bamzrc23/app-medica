import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useAuthService } from "../services/user.service";
import { objectToFormdata } from "../helpers/objectToFormdata";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";

const RegisterScreen = ({ onRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [userValues, setUserValues] = useState({
    name: "",
    email: "",
    image: "",
    phone: "",
    address: "",
  });
  const { createProfile } = useAuthService();
  const handleRegister = () => {
    console.log("Registro con:", email, password);
    onRegister();
  };

  const handleUploadPhoto = async () => {
    let { assets } = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!assets[0].cancelled) {
      const ruta = assets[0].uri.split("/");
      const nameImage = ruta[ruta.length - 1];
      const formData = new FormData();

      setUserValues({
        ...userValues,
        image: {
          uri: assets[0].uri,
          type: "image/*",
          name: nameImage,
        },
      });
    }
  };

  const handleCreateProfile = async () => {
    try {
      const values = { ...userValues, rol: "paciente" };
      const data = objectToFormdata(values);
      const resp = await createProfile(data);
      Toast.show({
        type: "success",
        text1: "Usuario creado correctamente!",
        position: "bottom",
        visibilityTime: 2000,
      });
      setUserValues({
        name: "",
        email: "",
        image: "",
        phone: "",
        address: "",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: error?.response?.data?.msg,
        position: "bottom",
        visibilityTime: 2000,
      });
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Reemplaza con la imagen de perfil del usuario */}
        <View style={styles.btnUploadContainer}>
          <Image
            source={{ uri: userValues?.image?.uri }}
            style={styles.profilePicture}
          />
          <TouchableOpacity
            style={styles.btnUpload}
            onPress={handleUploadPhoto}
          >
            <Ionicons name="image" size={20} color={"#000"} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.toolSection}>
        <Text style={styles.toolSectionTitle}>Datos del usuario</Text>
        <View>
          <TextInput
            style={styles.input}
            placeholder="Nombres"
            value={userValues.name}
            onChangeText={(value) =>
              setUserValues({ ...userValues, name: value })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={userValues.email}
            onChangeText={(value) =>
              setUserValues({ ...userValues, email: value })
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Telefono"
            value={userValues.phone}
            onChangeText={(value) =>
              setUserValues({ ...userValues, phone: value })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Dirección"
            value={userValues.address}
            onChangeText={(value) =>
              setUserValues({ ...userValues, address: value })
            }
          />

          <TouchableOpacity style={styles.button} onPress={handleCreateProfile}>
            <Text style={styles.textButton}>Registrarse</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  input: {
    width: "100%",
    height: 45,
    backgroundColor: "#fff",
    marginBottom: 20,
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#c1c1c1",
    color: "#000",
  },
  btnUploadContainer: {
    position: "relative",
  },
  btnUpload: {
    width: 30,
    height: 30,
    backgroundColor: "#F5FCFF",
    borderRadius: 25,
    position: "absolute",
    bottom: -2,
    right: -2,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: "100%",
    height: 45,
    backgroundColor: "#8384ee",
    borderRadius: 10,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  textButton: {
    color: "#fff",
    fontSize: 16,
  },
  header: {
    paddingTop: 40,
    alignItems: "center",
    backgroundColor: "#8384ee",
    paddingBottom: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 20,
    backgroundColor: "#c1c1c1",
  },
  name: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  email: {
    color: "#d1d1d1",
  },
  phoneNumber: {
    color: "white",
    fontSize: 18,
    marginTop: 5,
  },
  toolSection: {
    padding: 20,
  },
  toolSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
  },
  buttonRight: {
    marginLeft: 5,
  },
  buttonText: {
    marginTop: 5,
  },
  icon: {
    width: 50,
    height: 50,
  },
});

export default RegisterScreen;