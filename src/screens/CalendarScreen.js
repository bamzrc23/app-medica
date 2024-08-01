import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Modal, Button, Dimensions } from "react-native";
import { Calendar } from "react-native-calendars";
import { Picker } from "@react-native-picker/picker";
import { useAuthService } from "../services/user.service";
import { useUser } from "../usuario";
import Toast from "react-native-toast-message";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const CalendarScreen = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState();
  const [doctors, setDoctors] = useState([]);
  const [specialtys, setSpecialtys] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSeleted, setSelectedPaciente] = useState();
  const [occupiedHours, setOccupiedHours] = useState([]);

  const { currentUser } = useUser();
  const { getUsers, getSpecialty, createCita, getCitas, getOccupiedHours } = useAuthService();
  const navigation = useNavigation();

  const saveAppointment = async () => {
    const newAppointment = {
      date: selectedDate,
      time: selectedHour,
      specialty: selectedSpecialty,
      doctor: selectedDoctor,
      idUser: currentUser?.rol === 'asistente' ? pacienteSeleted : currentUser?._id,
    };

    try {
      const resp = await createCita(newAppointment);
      Toast.show({
        type: "success",
        text1: "Cita registrada correctamente!",
        position: "bottom",
        visibilityTime: 2000,
      });
      setShowModal(false);
      setMarkedDates({
        ...markedDates,
        [selectedDate]: { selected: true, dots: [...(markedDates[selectedDate]?.dots || []), { color: "#7b97e1" }] },
      });
      loadAppointments();
      handleGetOccupiedHours(selectedDate, selectedDoctor);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        Toast.show({
          type: "error",
          text1: error.response.data.msg || "Hora no disponible para esa fecha",
          position: "bottom",
          visibilityTime: 2000,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error al registrar la cita",
          position: "bottom",
          visibilityTime: 2000,
        });
      }
    }
  };

  const resetModal = () => {
    setSelectedHour("");
  };

  const cancelAppointment = () => {
    setShowModal(false);
    resetModal();
  };

  const handleGetDoctors = async () => {
    const resp = await getUsers();
    setDoctors(resp.filter((e) => e.rol === "doctor"));
    setPacientes(resp.filter((e) => e.rol === "paciente"));
  };

  const handleGetSpecialty = async () => {
    const resp = await getSpecialty();
    setSpecialtys(resp);
  };

  const loadAppointments = async () => {
    try {
      const citas = await getCitas();
      const marked = {};
      citas.forEach((cita) => {
        if (!marked[cita.date]) {
          marked[cita.date] = {
            marked: true,
            dots: [{ color: '#7b97e1' }]
          };
        } else {
          marked[cita.date].dots.push({ color: '#7b97e1' });
        }
      });
      setMarkedDates(marked);
      setAppointments(citas);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGetOccupiedHours = async (date, doctorId) => {
    try {
      const resp = await getOccupiedHours(date, doctorId);
      setOccupiedHours(resp || []);
    } catch (error) {
      console.error(error);
      setOccupiedHours([]);
    }
  };

  useEffect(() => {
    handleGetDoctors();
    handleGetSpecialty();
    loadAppointments();
  }, []);

  useEffect(() => {
    if (specialtys.length > 0 && !selectedSpecialty) {
      setSelectedSpecialty(specialtys[0]._id);
    }
    if (doctors.length > 0 && !selectedDoctor) {
      setSelectedDoctor(doctors[0]._id);
    }
  }, [specialtys, doctors]);

  useFocusEffect(
    React.useCallback(() => {
      loadAppointments();
    }, [])
  );

  const currentDate = new Date().toISOString().slice(0, 10);
  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seleccione una fecha</Text>
      <Calendar
        style={{ ...styles.calendar, width: screenWidth - 40 }}
        minDate={currentDate}
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          setShowModal(true);
          handleGetOccupiedHours(day.dateString, selectedDoctor);
        }}
        markedDates={markedDates}
        markingType={'multi-dot'}
        theme={{
          calendarBackground: "#f2f2f2",
          textSectionTitleColor: "#5E35B1",
          selectedDayBackgroundColor: "#7b97e1",
          selectedDayTextColor: "#ffffff",
          todayTextColor: "#5E35B1",
          dayTextColor: "#2d4150",
          arrowColor: "#5E35B1",
        }}
      />
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalView}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Agendar Cita</Text>
            <Text style={styles.modalLabel}>Fecha: {selectedDate}</Text>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedSpecialty}
                onValueChange={(itemValue) => setSelectedSpecialty(itemValue)}
                style={styles.picker}
              >
                {specialtys?.map((specialty) => (
                  <Picker.Item
                    key={specialty?._id}
                    label={specialty?.name}
                    value={specialty?._id}
                  />
                ))}
              </Picker>
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedDoctor}
                onValueChange={(itemValue) => {
                  setSelectedDoctor(itemValue);
                  handleGetOccupiedHours(selectedDate, itemValue);
                }}
                style={styles.picker}
              >
                {doctors?.map((doctor) => (
                  <Picker.Item
                    key={doctor?._id}
                    label={doctor?.name}
                    value={doctor?._id}
                  />
                ))}
              </Picker>
            </View>
            {currentUser?.rol === "asistente" && (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={pacienteSeleted}
                  onValueChange={(itemValue) => setSelectedPaciente(itemValue)}
                  style={styles.picker}
                >
                  {pacientes?.map((paciente) => (
                    <Picker.Item
                      key={paciente?._id}
                      label={paciente?.name}
                      value={paciente?._id}
                    />
                  ))}
                </Picker>
              </View>
            )}
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedHour}
                onValueChange={(itemValue) => setSelectedHour(itemValue)}
                style={styles.picker}
              >
                {Array.from({ length: 24 }, (_, i) => `${i}:00`)
                  .filter(hour => !occupiedHours.includes(hour))
                  .map(hour => (
                    <Picker.Item
                      key={hour}
                      label={hour}
                      value={hour}
                    />
                  ))}
              </Picker>
            </View>
            <View style={styles.buttonContainer}>
              <Button
                color={"#5E35B1"}
                title="Guardar"
                onPress={saveAppointment}
              />
              <Button
                color={"#B39DDB"}
                title="Cancelar"
                onPress={cancelAppointment}
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
    backgroundColor: "#F5FCFF",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  calendar: {
    borderRadius: 10,
    backgroundColor: "#f7f7f7",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginVertical: 20,
  },
  modalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    margin: 20,
    backgroundColor: "#F5FCFF",
    borderRadius: 20,
    padding: 35,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#5E35B1",
  },
  pickerContainer: {
    width: "100%",
    marginBottom: 15,
  },
  picker: {
    backgroundColor: "#EDE7F6",
    borderRadius: 5,
  },
  modalLabel: {
    alignSelf: "flex-start",
    marginBottom: 15,
    fontSize: 16,
    color: "#5E35B1",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-around",
  },
});

export default CalendarScreen;
