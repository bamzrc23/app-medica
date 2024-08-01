import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { useUser } from "../usuario";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import { useAuthService } from "../services/user.service";
import { objectToFormdata } from "../helpers/objectToFormdata";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";
import { ScrollView } from "react-native-gesture-handler";

const FormData = global.FormData;

const ProfileScreen = () => {
  const [selectedTime, setSelectedTime] = useState("asistente");
  const { currentUser: user, setCurrentUser } = useUser();
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

  const { createProfile } = useAuthService();

  const handleNavigate = (screenName) => {
    navigation.navigate(screenName);
  };
  const apiUrl = "https://0714-38-43-130-125.ngrok-free.app/";

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
      // formData.append("image", {
      //   uri: assets[0].uri,
      //   type: "image/*", // Puedes cambiar el tipo según el tipo de imagen seleccionada
      //   name: nameImage,
      // });
      // console.log(formData);
      // // Enviar FormData a tu API
      // const resp = await editProfile(user._id, formData);
      // console.log(resp);
      // setCurrentUser(resp);
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
    const values = { ...userValues, rol: selectedTime };
    const data = objectToFormdata(values);
    const resp = await createProfile(data);
    Toast.show({
      type: "success",
      text1: "Usuario creado correctamente!",
      position: "bottom",
      visibilityTime: 2000,
    });
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
      <ScrollView style={styles.container}>
      <View style={styles.toolSection}>
        
        <Text style={styles.toolSectionTitle}>Datos del usuarioooo</Text>
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

          <Picker
            selectedValue={selectedTime}
            placeholder="Rol"
            onValueChange={(itemValue) => setSelectedTime(itemValue)}
            style={{ ...styles.input, color: "#000" }}
            itemStyle={{ color: "#000" }}
          >
            <Picker.Item label="Asistente" value="asistente" />
            <Picker.Item label="Doctor" value="doctor" />
          </Picker>
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
            <Text style={styles.textButton}>Registrar</Text>
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
    borderWidth: 1,
    borderColor: "#c1c1c1",
    marginBottom: 20,
    borderRadius: 10,
    paddingHorizontal: 10,
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

export default ProfileScreen;
