import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Image
} from "react-native";
import { useAuthService } from "../services/user.service";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import "moment/locale/es";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useUser } from "../usuario";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { url } from "../../url"; // Importa tu base URL

export default function CitaDetailScreen({ route }) {
  const { cita } = route.params;
  const { currentUser } = useUser();
  const [documents, setDocuments] = useState([]);
  const [description, setDescription] = useState(null);
  const [descriptionValue, setDescriptionValue] = useState("");
  const [modalVisible, setModalVisible] = useState(null);
  const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState(false);
  const navigation = useNavigation();

  const {
    deleteCita,
    cancelCita,
    getDocuments,
    createDescriptionCita,
    getDescriptionByCita,
    createDocument
  } = useAuthService();

  useEffect(() => {
    handleGetDocuments();
    handleGetDescriptionByCita();
    requestPermissions();
  }, [route]);

  const requestPermissions = async () => {
    const { status: mediaLibraryStatus } = await MediaLibrary.requestPermissionsAsync();
    const { status: imagePickerStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaLibraryStatus !== 'granted' || imagePickerStatus !== 'granted') {
      alert('Se necesitan permisos para acceder a la biblioteca de medios.');
    }
  };

  const handleCancelCita = async () => {
    try {
      await cancelCita(cita._id, { motivo: descriptionValue });
      setModalVisible(false);
      navigation.goBack();
      Toast.show({
        type: "success",
        text1: "Cita cancelada correctamente!",
        position: "bottom",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Error al cancelar la cita!",
        position: "bottom",
        visibilityTime: 2000,
      });
    }
  };

  const handleDeleteCita = async () => {
    try {
      await deleteCita(cita._id);
      navigation.goBack();
      Toast.show({
        type: "success",
        text1: "Cita eliminada correctamente!",
        position: "bottom",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Error al eliminar la cita!",
        position: "bottom",
        visibilityTime: 2000,
      });
    }
  };

  const handleCreateDescription = async () => {
    try {
      await createDescriptionCita({ cita: cita._id, description: descriptionValue });
      handleGetDescriptionByCita();
      setModalVisible(false);
      Toast.show({
        type: "success",
        text1: "Descripción guardada correctamente!",
        position: "bottom",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Error al guardar la descripción!",
        position: "bottom",
        visibilityTime: 2000,
      });
    }
  };

  const handleGetDescriptionByCita = async () => {
    const resp = await getDescriptionByCita(cita._id);
    setDescription(resp);
    console.log(resp);
  };

  const handleSendDocument = async () => {
    let { assets, canceled } = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (canceled) return;

    if (!assets[0].canceled) {
      const ruta = assets[0].uri.split("/");
      const nameImage = ruta[ruta.length - 1];
      const formData = new FormData();
      formData.append("image", {
        uri: assets[0].uri,
        type: "image/*",
        name: nameImage,
      });

      const resp = await createDocument(cita._id, formData);
      handleGetDocuments();
    }
  };

  const handleTakePicture = async () => {
    let { assets, canceled } = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
    });
    if (canceled) return;
    if (!assets[0].canceled) {
      const ruta = assets[0].uri.split("/");
      const nameImage = ruta[ruta.length - 1];
      const formData = new FormData();
      formData.append("image", {
        uri: assets[0].uri,
        type: "image/*",
        name: nameImage,
      });

      const resp = await createDocument(cita._id, formData);
      handleGetDocuments();
    }
  };

  const handleGetDocuments = async () => {
    const resp = await getDocuments();
    setDocuments(resp.filter(doc => doc.cita === cita._id));
  };

  const handleDownload = async (imageUrl) => {
    const image = imageUrl;
    const imageName = image.split("\\").pop();
    let fileUri = FileSystem.documentDirectory + imageName;
    try {
      const res = await FileSystem.downloadAsync(imageUrl, fileUri);
      saveFile(res.uri);
    } catch (err) {
      console.log("FS Err: ", err);
    }
  };

  const saveFile = async (fileUri) => {
    try {
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      const album = await MediaLibrary.getAlbumAsync("Download");
      if (album == null) {
        await MediaLibrary.createAlbumAsync("Download", asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
      Toast.show({
        type: "success",
        text1: "Foto guardada en el dispositivo!",
        position: "bottom",
        visibilityTime: 2000,
      });
    } catch (err) {
      console.log("Save err: ", err);
      Toast.show({
        type: "error",
        text1: "Error al guardar la foto!",
        position: "bottom",
        visibilityTime: 2000,
      });
    }
  };

  return (
    <View style={{ padding: 10, flex: 1 }}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={{ marginBottom: 10, fontSize: 14, fontWeight: "500" }}>
              {modalVisible === "cancel" ? "Motivo de Cancelación" : "Registrar Observaciones"}
            </Text>
            <TextInput
              multiline
              numberOfLines={10}
              style={{
                textAlignVertical: "top",
                padding: 10,
                borderWidth: 1,
                borderColor: "#c1c1c1",
                width: "100%",
                borderRadius: 10,
              }}
              value={descriptionValue}
              onChangeText={(e) => setDescriptionValue(e)}
            />
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={modalVisible === "cancel" ? handleCancelCita : handleCreateDescription}
            >
              <Text style={styles.textStyle}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#B39DDB" }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.textStyle}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={confirmDeleteModalVisible}
        onRequestClose={() => {
          setConfirmDeleteModalVisible(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={{ marginBottom: 10, fontSize: 16, fontWeight: "500" }}>
              Confirmar eliminación de la cita
            </Text>
            <Text style={{ marginBottom: 20 }}>
              ¿Estás seguro que deseas eliminar esta cita?
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => {
                setConfirmDeleteModalVisible(false);
                handleDeleteCita();
              }}
            >
              <Text style={styles.textStyle}>Sí, eliminar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#B39DDB" }]}
              onPress={() => setConfirmDeleteModalVisible(false)}
            >
              <Text style={styles.textStyle}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.item}>
        <Text style={styles.itemTitle}>
          Fecha: {moment(cita.date).format("DD/MM/YY")}
        </Text>
        <Text style={styles.itemSubtitle}>
          Especialidad: {cita.specialty?.name}
        </Text>
        <Text style={styles.itemContent}>Doctor: {cita.doctor?.name}</Text>
        <Text style={styles.itemContent}>Paciente: {cita.paciente?.name}</Text>
        <Text style={styles.itemContent}>Estado: {cita.status}</Text>
        {description && (
          <Text style={styles.itemContent}>Motivo de Cancelación: {description.description}</Text>
        )}
        {currentUser?.rol === "paciente" && (
          <>
            {cita.status !== "cancelado" && (
              <>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSendDocument}
                >
                  <Text>Subir documentos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleTakePicture}>
                  <Text>Capturar documentos</Text>
                </TouchableOpacity>
              </>
            )}
            {cita.status === "pendiente" && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#B39DDB" }]}
                onPress={() => setConfirmDeleteModalVisible(true)}
              >
                <Text>Eliminar Cita</Text>
              </TouchableOpacity>
            )}
            {cita.status === "aprobado" && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#B39DDB" }]}
                onPress={() => setModalVisible("cancel")}
              >
                <Text>Cancelar Cita</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      <View>
        <Text style={{ fontSize: 16, fontWeight: "500" }}>Observaciones:</Text>
        <Text>
          {description ? description.description : "No hay descripcion"}
        </Text>
        <Text style={{ fontSize: 16, fontWeight: "500", marginTop: 20 }}>
          Documentos adjuntos:
        </Text>
        {documents.length === 0 && <Text>No hay documentos</Text>}
        {documents.length > 0 && (
          <FlatList
            data={documents}
            numColumns={3}
            renderItem={({ item }) => (
              <View style={{ position: "relative", width: '33%', padding: 2 }}>
                <Image
                  source={{ uri: url + item.image }}
                  style={{ width: '100%', height: 120 }}
                />
                <TouchableOpacity
                  style={{ position: "absolute", bottom: 5, right: 5 }}
                  onPress={() => handleDownload(url + item.image)}
                >
                  <Ionicons name="cloud-download" size={28} color={"#fff"} />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item._id}
            style={{ width: "100%" }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "90%",
    margin: 10,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    width: "100%",
    height: 35,
    marginTop: 10,
    borderRadius: 20,
    backgroundColor: "#EDE7F6",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonClose: {
    backgroundColor: "#5E35B1",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  item: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#5E35B1",
  },
  itemSubtitle: {
    fontSize: 16,
    color: "#7E57C2",
  },
  itemContent: {
    fontSize: 16,
    color: "#673AB7",
  },
});
