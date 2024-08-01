import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Image, Alert, Modal, TouchableOpacity } from "react-native";
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useAuthService } from "../services/user.service";
import { useUser } from "../usuario";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";

const ScanQrScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [formData, setFormData] = useState({});
  const [image, setImage] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { currentUser } = useUser();
  const { uploadFactura, uploadReceta } = useAuthService();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    try {
      const documentData = JSON.parse(data);
      setFormData(documentData);
      Toast.show({
        type: "success",
        text1: "Código QR escaneado correctamente",
        position: "bottom",
        visibilityTime: 2000,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "No se pudo leer el código QR. Asegúrese de que el formato sea correcto.",
        position: "bottom",
        visibilityTime: 2000,
      });
      setScanned(false);
    }
  };

  const handleUploadPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se requiere permiso para acceder a la galería de fotos.');
      return;
    }
  
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.canceled) {
      const asset = result.assets[0];
      setImage(asset.uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se requiere permiso para acceder a la cámara.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setImage(asset.uri);
    }
  };
  
  const handleSubmit = async () => {
    const form = new FormData();
    for (const key in formData) {
      form.append(key, formData[key]);
    }
    if (image) {
      const localUri = image;
      const filename = localUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      form.append('file', { uri: localUri, name: filename, type });
    }
    form.append('userId', currentUser._id);
    try {
      if (formData.tipo === 'factura') {
        await uploadFactura(formData.facturaId, form);
        Toast.show({
          type: "success",
          text1: "Factura subida correctamente!",
          position: "bottom",
          visibilityTime: 2000,
        });
      } else if (formData.tipo === 'receta') {
        if (!formData.recetaId) {
          throw new Error("recetaId no está definido en formData");
        }
        await uploadReceta(formData.recetaId, form);
        Toast.show({
          type: "success",
          text1: "Receta subida correctamente!",
          position: "bottom",
          visibilityTime: 2000,
        });
      }
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        setScanned(false);
        setFormData({});
        setImage(null);
      }, 3000);
    } catch (error) {
      console.error('Error uploading document:', error);
      Toast.show({
        type: "error",
        text1: `Error al subir el ${formData.tipo}`,
        position: "bottom",
        visibilityTime: 2000,
      });
    }
  };

  if (hasPermission === null) {
    return <Text>Solicitando permiso para usar la cámara</Text>;
  }
  if (hasPermission === false) {
    return <Text>No hay acceso a la cámara</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Escanear QR</Text>
      </View>
      {!scanned ? (
        <View style={styles.cameraContainer}>
          <Camera
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={styles.camera}
          >
            <View style={styles.frameContainer}>
              <View style={styles.frame} />
            </View>
          </Camera>
        </View>
      ) : (
        <View style={styles.formContainer}>
          <Text style={styles.title}>Datos del Documento</Text>
          {formData.tipo === 'factura' ? (
            <>
              <View style={styles.dataContainer}>
                <Text style={styles.label}>Número:</Text>
                <Text style={styles.value}>{formData.numero || ''}</Text>
              </View>
              <View style={styles.dataContainer}>
                <Text style={styles.label}>Fecha de Emisión:</Text>
                <Text style={styles.value}>{formData.fechaEmision || ''}</Text>
              </View>
              <View style={styles.dataContainer}>
                <Text style={styles.label}>Total:</Text>
                <Text style={styles.value}>{formData.total || ''}</Text>
              </View>
              <View style={styles.dataContainer}>
                <Text style={styles.label}>Usuario:</Text>
                <Text style={styles.value}>{formData.usuario || ''}</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.dataContainer}>
                <Text style={styles.label}>Código:</Text>
                <Text style={styles.value}>{formData.codigo || ''}</Text>
              </View>
              <View style={styles.dataContainer}>
                <Text style={styles.label}>Fecha de Creación:</Text>
                <Text style={styles.value}>{formData.createAt || ''}</Text>
              </View>
              <View style={styles.dataContainer}>
                <Text style={styles.label}>Médico:</Text>
                <Text style={styles.value}>{formData.medico.nombre || ''}</Text>
              </View>
              <View style={styles.dataContainer}>
                <Text style={styles.label}>Paciente:</Text>
                <Text style={styles.value}>{formData.paciente.nombre || ''}</Text>
              </View>
            </>
          )}
          <TouchableOpacity style={styles.button} onPress={handleUploadPhoto}>
            <Text style={styles.textButton}>Cargar Foto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
            <Text style={styles.textButton}>Tomar Foto</Text>
          </TouchableOpacity>
          {image && <Image source={{ uri: image }} style={styles.image} />}
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.textButton}>Guardar Documento</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => {
            setScanned(false);
            setFormData({});
            setImage(null);
          }}>
            <Text style={styles.textButton}>Escanear otra vez</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.successText}>¡Documento subido con éxito!</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: "#8384ee",
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  cameraContainer: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    width: 300,
    height: 400,
  },
  frameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: 'white',
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  dataContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  value: {
    flex: 1,
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
  image: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ScanQrScreen;
