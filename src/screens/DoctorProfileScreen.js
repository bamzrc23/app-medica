import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Button
} from "react-native";
import { Agenda } from "react-native-calendars";
import { useAuthService } from "../services/user.service";
import { useUser } from "../usuario";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import "moment/locale/es";
import Toast from "react-native-toast-message";

const DoctorProfileScreen = () => {
  const { currentUser } = useUser();
  const [citas, setCitas] = useState({});
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [showModal, setShowModal] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [description, setDescription] = useState("");
  
  const { getCitas, cancelCita } = useAuthService();

  const handleGetCitas = async () => {
    try {
      const resp = await getCitas();
      const citasByDate = resp.reduce((acc, cita) => {
        if (cita.doctor._id === currentUser._id && cita.status === "aprobado") {
          const date = moment(cita.date).format("YYYY-MM-DD");
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(cita);
        }
        return acc;
      }, {});
      setCitas(citasByDate);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancelCita = async () => {
    try {
      await cancelCita(selectedCita._id, { motivo: description });
      setCancelModalVisible(false);
      setDescription("");
      handleGetCitas();
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

  useEffect(() => {
    handleGetCitas();
  }, []);

  return (
    <View style={styles.container}>
      <Agenda
        items={citas}
        selected={selectedDate}
        renderItem={(item) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>Fecha: {moment(item.date).format("DD/MM/YY")}</Text>
            <Text style={styles.itemSubtitle}>Hora: {item.time}</Text>
            <Text style={styles.itemContent}>Paciente: {item.paciente.name}</Text>
            <Text style={styles.itemContent}>Especialidad: {item.specialty.name}</Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#B39DDB" }]}
              onPress={() => {
                setSelectedCita(item);
                setCancelModalVisible(true);
              }}
            >
              <Text style={styles.buttonText}>Cancelar Cita</Text>
            </TouchableOpacity>
          </View>
        )}
        renderEmptyData={() => (
          <View style={styles.emptyDate}>
            <Text>No tienes citas para hoy.</Text>
          </View>
        )}
        rowHasChanged={(r1, r2) => r1 !== r2}
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
        }}
        theme={{
          calendarBackground: "#f2f2f2",
          textSectionTitleColor: "#5E35B1",
          selectedDayBackgroundColor: "#7b97e1",
          selectedDayTextColor: "#ffffff",
          todayTextColor: "#5E35B1",
          dayTextColor: "#2d4150",
          arrowColor: "#5E35B1",
          agendaDayTextColor: "#5E35B1",
          agendaDayNumColor: "#5E35B1",
          agendaTodayColor: "#5E35B1",
          agendaKnobColor: "#5E35B1"
        }}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={cancelModalVisible}
        onRequestClose={() => {
          setCancelModalVisible(false);
          setDescription("");
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Cancelar Cita</Text>
            <TextInput
              multiline
              numberOfLines={4}
              style={styles.input}
              placeholder="Motivo de la cancelación"
              value={description}
              onChangeText={setDescription}
            />
            <View style={styles.buttonContainer}>
              <Button
                color={"#5E35B1"}
                title="Cancelar Cita"
                onPress={handleCancelCita}
              />
              <Button
                color={"#B39DDB"}
                title="Cerrar"
                onPress={() => {
                  setCancelModalVisible(false);
                  setDescription("");
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: "#f2f2f2",
  },
  item: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
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
  button: {
    height: 35,
    marginTop: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
    paddingLeft: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "80%",
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    height: 90,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#c1c1c1",
    marginBottom: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
    color: "#000",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-around",
  },
});

export default DoctorProfileScreen;
