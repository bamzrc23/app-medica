import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  SafeAreaView,
} from "react-native";
import { useUser } from "../usuario";
import { FontAwesome } from "@expo/vector-icons";
import { useAuthService } from "../services/user.service";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import moment from "moment";
import "moment/locale/es";

const PacienteDetailScreen = ({ navigation, route }) => {
  const { paciente } = route.params;
  const { currentUser } = useUser();
  const [modalVisible, setModalVisible] = useState(false);
  const [citas, setCitas] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState({});

  // const navigation = useNavigation();

  const { getCitas, updateStatusCita } = useAuthService();

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text>Cargando usuario...</Text>
      </View>
    );
  }

  const openPrescriptionModal = (prescription) => {
    setSelectedPrescription(prescription);
    setModalVisible(true);
  };

  const handleGetCitas = async () => {
    try {
      const resp = await getCitas();
      setCitas(resp);
    } catch (error) {
      console.log(error);
    }
  };

  const handleApproveCita = async (id) => {
    try {
      const resp = await updateStatusCita(id, "aprobado");
      Toast.show({
        type: "success",
        text1: "Cita aprobada correctamente!",
        position: "bottom",
        visibilityTime: 2000,
      });
      handleGetCitas();
    } catch (error) {}
  };
  const handleFinishCita = async (id) => {
    try {
      const resp = await updateStatusCita(id, "finalizado");
      Toast.show({
        type: "success",
        text1: "Cita aprobada correctamente!",
        position: "bottom",
        visibilityTime: 2000,
      });
      handleGetCitas();
    } catch (error) {}
  };
  useEffect(() => {
    handleGetCitas();
  }, []);
  console.log('citss', citas)

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Image
                source={{ uri: selectedPrescription.imageUrl }}
                style={{ width: 300, height: 300 }}
              />
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={styles.textStyle}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={styles.section}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.sectionTitle}>Citas pendientes</Text>
            <Ionicons
              name="refresh"
              size={28}
              color={"#000"}
              onPress={handleGetCitas}
            />
          </View>
          {citas.length > 0 &&
            citas
              .filter((cita) => cita?.status === "pendiente" && cita?.idUser === paciente)
              .map((cita, index) => (
                <View style={styles.item} key={index}>
                  <Text style={styles.itemTitle}>Fecha: {moment(cita?.date).format("DD/MM/YY")}</Text>
                  <Text style={styles.itemSubtitle}>
                    Especialidad: {cita?.specialty?.name}
                  </Text>
                  <Text style={styles.itemContent}>
                    Doctor: {cita?.doctor?.name}
                  </Text>
                  <Text style={styles.itemContent}>
                    Paciente: {cita?.paciente?.name}
                  </Text>
                  <Text style={styles.itemContent}>Estado: {cita?.status}</Text>

                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleApproveCita(cita._id)}
                  >
                    <Text>Aprobar</Text>
                  </TouchableOpacity>
                </View>
              ))}
        </View>
        <View style={styles.section}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.sectionTitle}>Citas Aprobadas</Text>
            <Ionicons
              name="refresh"
              size={28}
              color={"#000"}
              onPress={handleGetCitas}
            />
          </View>
          {citas.length > 0 &&
            citas
              .filter((cita) => cita?.status === "aprobado")
              .map((cita, index) => (
                <View style={styles.item} key={index}>
                  <Text style={styles.itemTitle}>Fecha: {moment(cita?.date).format("DD/MM/YY")}</Text>
                  <Text style={styles.itemSubtitle}>
                    Especialidad: {cita?.specialty?.name}
                  </Text>
                  <Text style={styles.itemContent}>
                    Doctor: {cita?.doctor?.name}
                  </Text>
                  <Text style={styles.itemContent}>
                    Paciente: {cita?.paciente?.name}
                  </Text>
                  <Text style={styles.itemContent}>Estado: {cita?.status}</Text>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate("CitaDetail", { cita })}
                  >
                    <Text>Ver</Text>
                  </TouchableOpacity>
                  
                </View>
              ))}
        </View>
        <View style={styles.section}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.sectionTitle}>Citas Finalizadas</Text>
            <Ionicons
              name="refresh"
              size={28}
              color={"#000"}
              onPress={handleGetCitas}
            />
          </View>
          {citas.length > 0 &&
            citas
              .filter((cita) => cita?.status === "finalizado")
              .map((cita, index) => (
                <View style={styles.item} key={index}>
                  <Text style={styles.itemTitle}>Fecha: {moment(cita?.date).format("DD/MM/YY")}</Text>
                  <Text style={styles.itemSubtitle}>
                    Especialidad: {cita?.specialty?.name}
                  </Text>
                  <Text style={styles.itemContent}>
                    Doctor: {cita?.doctor?.name}
                  </Text>
                  <Text style={styles.itemContent}>
                    Paciente: {cita?.paciente?.name}
                  </Text>
                  <Text style={styles.itemContent}>Estado: {cita?.status}</Text>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate("CitaDetail", { cita })}
                  >
                    <Text>Ver</Text>
                  </TouchableOpacity>
                  {/* <TouchableOpacity
                style={styles.button}
                onPress={() => handleFinishCita(cita._id)}
              >
                <Text>Finalizar</Text>
              </TouchableOpacity> */}
                </View>
              ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
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
    height: 35,
    marginTop: 10,
    borderRadius: 20,
    backgroundColor: "#EDE7F6",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  container: {
    paddingTop: 45,
    padding: 10,
    flex: 1,
    height: "100%",
    backgroundColor: "#f2f2f2",
  },
  section: {
    backgroundColor: "#EDE7F6",
    margin: 10,
    marginBottom: 20,
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#5E35B1",
  },
  item: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 18,
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

export default PacienteDetailScreen;
