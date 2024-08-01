import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView
} from "react-native";
import { useUser } from "../usuario";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import { useAuthService } from "../services/user.service";
import { objectToFormdata } from "../helpers/objectToFormdata";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { url } from "../../url";

const FormData = global.FormData;

const ProfileScreen = () => {
  const { currentUser: user, setCurrentUser, handleLogout } = useUser();
  const [userValues, setUserValues] = useState({
    name: "",
    email: "",
    image: "",
    phone: "",
    address: "",
  });
  const navigation = useNavigation();

  if (!user) {
    return (
      <View>
        <Text>Cargando usuario...</Text>
      </View>
    );
  }

  const { editProfile } = useAuthService();

  const handleNavigate = (screenName) => {
    navigation.navigate(screenName);
  };
  const apiUrl = url;

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
      formData.append("image", {
        uri: assets[0].uri,
        type: "image/*", // Puedes cambiar el tipo según el tipo de imagen seleccionada
        name: nameImage,
      });
      // Enviar FormData a tu API
      const resp = await editProfile(user._id, formData);
      setCurrentUser(resp);
    }
  };

  const handleEditProfile = async () => {
    const data = objectToFormdata(userValues);
    const resp = await editProfile(user._id, data);
    setCurrentUser(resp);
  };

  useEffect(() => {
    setUserValues(user);
  }, [user]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Reemplaza con la imagen de perfil del usuario */}
        <View style={styles.btnUploadContainer}>
          <Image
            source={{ uri: apiUrl + user.image }}
            style={styles.profilePicture}
          />
          <TouchableOpacity
            style={styles.btnUpload}
            onPress={handleUploadPhoto}
          >
            <Ionicons name="image" size={20} color={"#000"} />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>
      <ScrollView style={styles.container}>
      <View style={styles.toolSection}>
        <Text style={styles.toolSectionTitle}>Datos de perfillll</Text>
        <View>
          <TextInput
            style={styles.input}
            value={userValues.name}
            placeholder="Nombres"
            onChangeText={(value) =>
              setUserValues({ ...userValues, name: value })
            }
          />
          <TextInput
            style={styles.input}
            value={userValues.email}
            placeholder="Correo electronico"
            onChangeText={(value) =>
              setUserValues({ ...userValues, email: value })
            }
          />
          <TextInput
            style={styles.input}
            value={userValues.phone}
            placeholder="Telefono"
            onChangeText={(value) =>
              setUserValues({ ...userValues, phone: value })
            }
          />
          <TextInput
            style={styles.input}
            value={userValues.address}
            placeholder="Direccion"
            onChangeText={(value) =>
              setUserValues({ ...userValues, address: value })
            }
          />

          <TouchableOpacity style={styles.button} onPress={handleEditProfile}>
            <Text style={styles.textButton}>Guardar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{...styles.button, backgroundColor: "#000"}} onPress={handleLogout}>
            <Text style={styles.textButton}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
  },
  input: {
    width: "100%",
    height: 45,
    backgroundColor: "#fff",
    marginBottom: 20,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  btnUploadContainer: {
    position: "relative"
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
    color: "#d1d1d1"
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

export default ProfileScreen;
