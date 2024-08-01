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
  TextInput,
  Button
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useIsFocused } from "@react-navigation/native";
import { useUser } from "../usuario";
import { FontAwesome } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuthService } from "../services/user.service";
import { useForm, Controller } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import moment from "moment";
import "moment/locale/es";
import * as yup from "yup";
import { Calendar } from "react-native-calendars";
import { Picker } from "@react-native-picker/picker";

const CitasScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { currentUser } = useUser();
  const [modalVisible, setModalVisible] = useState(false);
  const [citas, setCitas] = useState([]);
  const [filteredCitas, setFilteredCitas] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState({});
  const [openChangePass, setOpenChangePass] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDateEdit, setSelectedDateEdit] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [occupiedHours, setOccupiedHours] = useState([]);
  const [showPending, setShowPending] = useState(true);
  const [showApproved, setShowApproved] = useState(false);
  const [showFinished, setShowFinished] = useState(false);

  const schema = yup.object().shape({
    password: yup
      .string()
      .matches(
        /^(?=.*[A-Z])(?=.*[0-9])/,
        "La contraseña debe contener al menos una letra mayúscula y al menos un número"
      )
      .required("Contraseña es requerido")
      .min(8, "La contraseña debe tener minimo 8 caracteres"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      password: "",
    },
  });

  const {
    getCitas,
    updateStatusCita,
    useChangePassword,
    getOccupiedHours,
  } = useAuthService();

  const handleOpenEditModal = (cita) => {
    setSelectedCita(cita);
    setSelectedDateEdit(moment(cita.date).format("YYYY-MM-DD"));
    setSelectedHour(cita.time);
    setShowEditModal(true);
    handleGetOccupiedHours(moment(cita.date).format("YYYY-MM-DD"), cita.doctor._id);
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

  const handleFinishCita = async (cita) => {
    try {
      const updatedCita = {
        status: "finalizado"
      };
      await updateStatusCita(cita._id, updatedCita);
      Toast.show({
        type: "success",
        text1: "Cita finalizada correctamente!",
        position: "bottom",
        visibilityTime: 2000,
      });
      handleGetCitas();
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Error al finalizar la cita!",
        position: "bottom",
        visibilityTime: 2000,
      });
    }
  };

  const handleUpdateCita = async () => {
    try {
      const updatedCita = {
        ...selectedCita,
        date: selectedDateEdit,
        time: selectedHour,
        status: "aprobado"
      };
      await updateStatusCita(selectedCita._id, updatedCita);
      Toast.show({
        type: "success",
        text1: "Cita actualizada correctamente!",
        position: "bottom",
        visibilityTime: 2000,
      });
      setShowEditModal(false);
      handleGetCitas();
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Error al actualizar la cita!",
        position: "bottom",
        visibilityTime: 2000,
      });
    }
  };

  const handleChangePassword = async (formData) => {
    try {
      const resp = await useChangePassword(currentUser?.token, formData);
      Toast.show({
        type: "success",
        text1: resp?.msg,
        position: "bottom",
        visibilityTime: 2000,
      });
      setOpenChangePass(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const filtered = citas.filter((cita) => moment(cita.date).isSame(selectedDate, 'day'));
      setFilteredCitas(filtered);
    }
  };

  const openPrescriptionModal = (prescription) => {
    setSelectedPrescription(prescription);
    setModalVisible(true);
  };

  const handleGetCitas = async () => {
    try {
      const resp = await getCitas();
      setCitas(resp);
      setFilteredCitas(resp);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleGetCitas();
    if (!currentUser?.confirmado) {
      setOpenChangePass(true);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      handleGetCitas();
    }
  }, [isFocused]);

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text>Cargando usuario...</Text>
      </View>
    );
  }

  const AppointmentCard = ({ cita }) => (
    <View style={styles.card}>
      <Text style={styles.itemTitle}>Fecha: {moment(cita?.date).format("DD/MM/YY")}</Text>
      <Text style={styles.itemSubtitle}>Hora: {cita?.time}</Text>
      <Text style={styles.itemSubtitle}>Especialidad: {cita?.specialty?.name}</Text>
      <Text style={styles.itemContent}>Doctor: {cita?.doctor?.name}</Text>
      <Text style={styles.itemContent}>Paciente: {cita?.paciente?.name}</Text>
      <Text style={styles.itemContent}>Estado: {cita?.status}</Text>
      {cita?.status === "pendiente" && (
        <TouchableOpacity style={styles.button} onPress={() => handleOpenEditModal(cita)}>
          <Text>Aprobar</Text>
        </TouchableOpacity>
      )}
      {cita?.status === "aprobado" && (
        <>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("CitaDetail", { cita })}>
            <Text>Ver</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleFinishCita(cita)}>
            <Text>Finalizar</Text>
          </TouchableOpacity>
        </>
      )}
      {cita?.status === "finalizado" && (
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("CitaDetail", { cita })}>
          <Text>Ver</Text>
        </TouchableOpacity>
      )}
    </View>
  );

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

        <Modal
          animationType="slide"
          transparent={true}
          visible={openChangePass}
          onRequestClose={() => {
            setOpenChangePass(false);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.itemTitle}>Cambiar contraseña</Text>
              <Text style={[styles.itemSubtitle, { marginBottom: 10 }]}>
                Ingresa tu nueva contraseña
              </Text>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Password"
                    secureTextEntry
                  />
                )}
                name="password"
              />
              {errors.password && (
                <Text style={{ color: "red", fontSize: 12 }}>
                  *{errors.password.message}
                </Text>
              )}
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={handleSubmit(handleChangePassword)}
              >
                <Text style={styles.textStyle}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={showEditModal} animationType="slide" transparent={true}>
          <View>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Editar Cita</Text>
              <Text style={styles.modalLabel}>Fecha: {selectedDateEdit}</Text>
              <Text style={styles.modalLabel}>Especialidad: {selectedCita?.specialty?.name}</Text>
              <Text style={styles.modalLabel}>Doctor: {selectedCita?.doctor?.name}</Text>
              <Text style={styles.modalLabel}>Paciente: {selectedCita?.paciente?.name}</Text>
              <Calendar
                minDate={moment().format("YYYY-MM-DD")}
                onDayPress={(day) => {
                  setSelectedDateEdit(day.dateString);
                  handleGetOccupiedHours(day.dateString, selectedCita.doctor._id);
                }}
                markedDates={{
                  [selectedDateEdit]: { selected: true, marked: true, selectedColor: "#7b97e1" }
                }}
              />
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedHour}
                  onValueChange={(itemValue) => setSelectedHour(itemValue)}
                >
                  {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                    <Picker.Item
                      key={hour}
                      label={`${hour}:00`}
                      value={`${hour}:00`}
                      enabled={!occupiedHours.includes(`${hour}:00`)}
                    />
                  ))}
                </Picker>
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  color={"#7b97e1"}
                  title="Guardar"
                  onPress={handleUpdateCita}
                />
                <Button
                  color={"#c1b2d3"}
                  title="Cancelar"
                  onPress={() => setShowEditModal(false)}
                />
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle} onPress={() => setShowPending(!showPending)}>Citas pendientes</Text>
            <Ionicons
              name={showPending ? "chevron-up" : "chevron-down"}
              size={28}
              color={"#000"}
              onPress={() => setShowPending(!showPending)}
            />
          </View>
          {showPending && filteredCitas.length > 0 &&
            filteredCitas
              .filter((cita) => cita?.status === "pendiente")
              .map((cita, index) => (
                <AppointmentCard key={index} cita={cita} />
              ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle} onPress={() => setShowApproved(!showApproved)}>Citas Aprobadas</Text>
            <Ionicons
              name={showApproved ? "chevron-up" : "chevron-down"}
              size={28}
              color={"#000"}
              onPress={() => setShowApproved(!showApproved)}
            />
          </View>
          {showApproved && filteredCitas.length > 0 &&
            filteredCitas
              .filter((cita) => cita?.status === "aprobado")
              .map((cita, index) => (
                <AppointmentCard key={index} cita={cita} />
              ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle} onPress={() => setShowFinished(!showFinished)}>Citas Finalizadas</Text>
            <Ionicons
              name={showFinished ? "chevron-up" : "chevron-down"}
              size={28}
              color={"#000"}
              onPress={() => setShowFinished(!showFinished)}
            />
          </View>
          {showFinished && filteredCitas.length > 0 &&
            filteredCitas
              .filter((cita) => cita?.status === "finalizado")
              .map((cita, index) => (
                <AppointmentCard key={index} cita={cita} />
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
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  containerTitle: {
    padding: 15,
  },
  modalView: {
    width: "80%",
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContent: {
    margin: 10,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 35,
    width: "95%",
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
  },
  pickerContainer: {
    width: "100%",
    marginBottom: 15,
    color: "#5E35B1",
  },
  modalLabel: {
    alignSelf: "flex-start",
    marginBottom: 15,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-around",
  },
  input: {
    width: "100%",
    height: 45,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#c1c1c1",
    marginBottom: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
    color: "#000",
  },
  button2: {
    width: "100%",
    height: 35,
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: "#5E35B1",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: "100%",
    height: 35,
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: "#B39DDB",
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
    padding: 13,
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  section: {
    backgroundColor: "#EDE7F6",
    margin: 10,
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  sectionHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#5E35B1",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5E35B1",
    marginBottom: 5,
  },
  itemSubtitle: {
    fontSize: 16,
    color: "#7E57C2",
    marginBottom: 5,
  },
  itemContent: {
    fontSize: 16,
    color: "#673AB7",
    marginBottom: 5,
  },
});

export default CitasScreen;
