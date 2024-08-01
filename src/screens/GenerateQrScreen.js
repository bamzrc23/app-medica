import React, { useState } from "react";
import { View, Text, Button, Image, StyleSheet, TextInput } from "react-native";
import { useAuthService } from "../services/user.service";
import Toast from "react-native-toast-message";

const GenerateQrScreen = () => {
  const [documentId, setDocumentId] = useState('');
  const [documentType, setDocumentType] = useState('factura'); // Puede ser 'factura' o 'receta'
  const [qrCode, setQrCode] = useState(null);
  const { getQRCode } = useAuthService();

  const handleGenerateQRCode = async () => {
    try {
      const qrData = await getQRCode(documentId, documentType);
      setQrCode(qrData);
      Toast.show({
        type: "success",
        text1: "Código QR generado correctamente!",
        position: "bottom",
        visibilityTime: 2000,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error al generar el código QR",
        position: "bottom",
        visibilityTime: 2000,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>ID del Documento:</Text>
      <TextInput
        style={styles.input}
        value={documentId}
        onChangeText={setDocumentId}
        placeholder="Ingrese el ID del documento"
      />
      <Text style={styles.label}>Tipo de Documento:</Text>
      <TextInput
        style={styles.input}
        value={documentType}
        onChangeText={setDocumentType}
        placeholder="Ingrese 'factura' o 'receta'"
      />
      <Button title="Generar Código QR" onPress={handleGenerateQRCode} />
      {qrCode && (
        <View style={styles.qrContainer}>
          <Text style={styles.qrText}>Código QR generado:</Text>
          <Image source={{ uri: qrCode }} style={styles.qrImage} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '100%',
  },
  qrContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  qrText: {
    fontSize: 16,
    marginBottom: 10,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
});

export default GenerateQrScreen;
