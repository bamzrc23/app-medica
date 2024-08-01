import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Modal,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  Button,
  ScrollView,
} from "react-native";
import Signature from "react-native-signature-canvas";
import { url } from "../../url";
import { useAuthService } from "../services/user.service";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useUser } from "../usuario";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const SignatureScreen = () => {
  const ref = useRef();
  const [signature, setSignature] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewFirma, setPreviewFirma] = useState(null);
  const { currentUser } = useUser();
  const { useCreateFirma, useGetFirma, signPdf } = useAuthService();

  const handleOK = async (firma) => {
    setSignature(firma);
  };

  const handleEmpty = () => {
    setSignature(null);
  };

  const handleClear = () => {
    ref.current.clearSignature();
    setSignature(null);
    handleGetFirma();
  };

  const handleEnd = async () => {
    ref.current.readSignature();
  };

  const handleSendFirma = async () => {
    const base64 = signature;
    const base64Code = base64.split("data:image/png;base64,")[1];

    const filename = FileSystem.documentDirectory + "firma.png";
    await FileSystem.writeAsStringAsync(filename, base64Code, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const formData = new FormData();
    formData.append("image", {
      uri: filename,
      type: "image/png",
      name: "firma.png",
    });
    formData.append("idUser", currentUser._id);

    try {
      const resp = await useCreateFirma(formData);
      Alert.alert("Firma procesada", "Puede continuar a firmar el documento");
    } catch (error) {
      console.error("Error al enviar la firma", error);
      Alert.alert("Error", "No se pudo enviar la firma");
    }
  };

  const handleGetFirma = async () => {
    const resp = await useGetFirma(currentUser._id);
    setPreviewFirma(resp);
  };

  const handleSignPdf = async () => {
    try {
      const response = await signPdf({
        idUser: currentUser._id
      });
  
      const downloadUrl = `${url}api/firma/download/668c01073f1f6fe9f80b9afd`;
  
      const downloadResumable = FileSystem.createDownloadResumable(
        downloadUrl,
        FileSystem.documentDirectory + `signed_${currentUser._id}.pdf`,
        {},
        ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
          const progress = totalBytesWritten / totalBytesExpectedToWrite;
          console.log(`Downloaded: ${progress * 100}%`);
        }
      );
  
      const { uri } = await downloadResumable.downloadAsync();
  
      await Sharing.shareAsync(uri);
      Alert.alert('PDF firmado con éxito', 'El PDF se ha guardado y está listo para compartir.');
    } catch (error) {
      console.error('Error al firmar el PDF', error);
      Alert.alert('Error', 'No se pudo firmar el PDF');
    }
  };

  useEffect(() => {
    handleGetFirma();
  }, []);

  const style = `.m-signature-pad--footer {display: none; margin: 0px;}
                 .m-signature-pad {box-shadow: none; border: none; margin: 0;}
                 .m-signature-pad--body {border: none; margin: 0;}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Firma Digital</Text>
      </View>
      {previewFirma ? (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: url + previewFirma.image }}
            style={styles.signatureImage}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => setPreviewFirma(null)}
          >
            <Text style={styles.textButton}>Editar Firma</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.signatureContainer}>
          <Signature
            ref={ref}
            onOK={handleOK}
            onEnd={handleEnd}
            webStyle={style}
            style={styles.signaturePad}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleClear}>
              <Text style={styles.textButton}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSendFirma}>
              <Text style={styles.textButton}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSignPdf}>
              <Text style={styles.textButton}>Firmar PDF</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  signatureContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureImage: {
    width: width * 0.8,
    height: height * 0.4,
    resizeMode: 'contain',
    backgroundColor: "#fff",
  },
  signaturePad: {
    flex: 1,
    width: width,
    height: height * 0.6,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  button: {
    width: "30%",
    height: 45,
    backgroundColor: "#8384ee",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  textButton: {
    color: "#fff",
    fontSize: 16,
  },
});

export default SignatureScreen;
