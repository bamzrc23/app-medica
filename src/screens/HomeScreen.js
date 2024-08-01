import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Linking,
  Alert,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useUser } from "../usuario";
import { FontAwesome } from "@expo/vector-icons";
import { useAuthService } from "../services/user.service";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import "moment/locale/es";
import Toast from "react-native-toast-message";
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Picker } from "@react-native-picker/picker";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { url } from "../../url"; // Importa tu base URL

const schema = yup.object().shape({
  password: yup
    .string()
    .matches(
      /^(?=.*[A-Z])(?=.*[0-9])/,
      "La contraseña debe contener al menos una letra mayúscula y al menos un número"
    )
    .required("Contraseña es requerido")
    .min(8, "La contraseña debe tener mínimo 8 caracteres"),
});

const HomeScreen = ({ navigation }) => {
  const isFocused = useIsFocused(); // Verifica si la pantalla está enfocada
  const { socket, currentUser } = useUser();
  const { currentUser: user } = useUser();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [openChangePass, setOpenChangePass] = useState(false);
  const [citas, setCitas] = useState([]);
  const [filteredCitas, setFilteredCitas] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("aprobado");
  const [selectedPrescription, setSelectedPrescription] = useState({});
  const [recetas, setRecetas] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [showCitasAgendadas, setShowCitasAgendadas] = useState(true);
  const [showRecetas, setShowRecetas] = useState(false);
  const [showFacturas, setShowFacturas] = useState(false);
  const { getRecetasByUser, getFacturasByUser } = useAuthService();
  const [selectedReceta, setSelectedReceta] = useState(null);
  const [modalRecetaVisible, setModalRecetaVisible] = useState(false);  
  const apiUrl = url;

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

  const fetchRecetas = async () => {
    try {
      const response = await getRecetasByUser(user._id);
      setRecetas(response);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFacturas = async () => {
    try {
      const response = await getFacturasByUser(user._id);
      setFacturas(response);
    } catch (error) {
      console.error(error);
    }
  };

  const { getCitas, useChangePassword } = useAuthService();

  const openFacturaModal = (factura) => {
    setSelectedFactura(factura);
    setModalVisible(true);
  };

  const openRecetaModal = (receta) => {
    setSelectedReceta(receta);
    setModalRecetaVisible(true);
  };

  const handleGetCitas = async () => {
    try {
      const resp = await getCitas();
      const userCitas = resp?.filter((cita) => cita?.paciente?._id === currentUser?._id);
      setCitas(userCitas);
      filterCitas(userCitas, selectedFilter);
    } catch (error) {
      console.log(error);
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

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    filterCitas(citas, filter);
  };

  const filterCitas = (citas, filter) => {
    let filtered = citas;
    if (filter !== "all") {
      filtered = filtered.filter((cita) => cita.status === filter);
    }
    setFilteredCitas(filtered);
  };

  const statusColors = {
    pendiente: "rgba(255, 245, 157, 0.5)", // Color amarillo para pendiente
    aprobado: "rgba(129, 199, 132, 0.5)", // Color verde para aprobado
    finalizado: "rgba(176, 190, 197, 0.5)", // Color gris para finalizado
    cancelado: "rgba(244, 67, 54, 0.5)", // Color rojo para cancelado
  };

  useEffect(() => {
    if (currentUser) {
      handleGetCitas();
      if (!currentUser.confirmado) {
        setOpenChangePass(true);
      }
    }
    fetchRecetas();
    fetchFacturas();
  }, [currentUser, user]);

  useEffect(() => {
    if (isFocused) {
      handleGetCitas();
    }
  }, [isFocused]);

  useEffect(() => {
    if (socket) {
      socket.on('newCita', (newCita) => {
        if (newCita && newCita.paciente && newCita.paciente._id === currentUser._id) {
          setCitas((prevCitas) => {
            const updatedCitas = [...prevCitas, newCita];
            filterCitas(updatedCitas, selectedFilter);
            return updatedCitas;
          });
        }
      });

      socket.on('approveCita', (approvedCita) => {
        if (approvedCita && approvedCita.paciente && approvedCita.paciente._id === currentUser._id) {
          setCitas((prevCitas) => {
            const updatedCitas = prevCitas.map((cita) =>
              cita._id === approvedCita._id ? approvedCita : cita
            );
            filterCitas(updatedCitas, selectedFilter);
            return updatedCitas;
          });
        }
      });

      return () => {
        socket.off('newCita');
        socket.off('approveCita');
      };
    }
  }, [socket, currentUser]);

  const handleSaveImage = async (url) => {
    try {
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        FileSystem.documentDirectory + 'factura.png',
        {},
        ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
          const progress = totalBytesWritten / totalBytesExpectedToWrite;
          console.log(`Downloaded: ${progress * 100}%`);
        }
      );

      const { uri } = await downloadResumable.downloadAsync();

      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Hubo un error al guardar la imagen');
    }
  };
  

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text>Cargando usuario...</Text>
      </View>
    );
  }

  return (
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
            {selectedFactura && (
              <>
                <Text style={styles.itemTitle}>Número: {selectedFactura.numero}</Text>
                <Text style={styles.itemSubtitle}>Fecha de Emisión: {selectedFactura.fechaEmision}</Text>
                <Text style={styles.itemContent}>Deuda: {selectedFactura.deuda}</Text>
                <Text style={styles.itemContent}>Total: {selectedFactura.total}</Text>
                <Text style={styles.itemContent}>Usuario: {selectedFactura.usuario.name}</Text>
                {selectedFactura.pdf && (
                  <Image
                    source={{ uri: apiUrl + selectedFactura.pdf }} // Ajusta la URL según sea necesario
                    style={{ width: 300, height: 300, marginTop: 20 }}
                  />
                )}
                <TouchableOpacity
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => handleSaveImage( apiUrl + selectedFactura.pdf )} // Ajusta la URL según sea necesario
                >
                  <Text style={styles.textStyle}>Guardar Imagen</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => setModalVisible(!modalVisible)}
                >
                  <Text style={styles.textStyle}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
<Modal
  animationType="slide"
  transparent={true}
  visible={modalRecetaVisible}
  onRequestClose={() => {
    setModalRecetaVisible(!modalRecetaVisible);
  }}
>
  <View style={styles.centeredView}>
    <View style={styles.modalView}>
      {selectedReceta && (
        <>
          <Text style={styles.itemTitle}>Código: {selectedReceta.codigo}</Text>
          <Text style={styles.itemSubtitle}>Médico: {selectedReceta.medico.name}</Text>
          <Text style={styles.itemSubtitle}>Paciente: {selectedReceta.paciente.name}</Text>
          <Text style={styles.itemContent}>Fecha de Creación: {selectedReceta.createAt}</Text>
          <Text style={styles.itemContent}>Activo: {selectedReceta.activo ? 'Sí' : 'No'}</Text>
          {selectedReceta.fecanulacion && (
            <Text style={styles.itemContent}>Fecha de Anulación: {selectedReceta.fecanulacion}</Text>
          )}
          {selectedReceta.pdf && (
            <Image
              source={{ uri: apiUrl + selectedReceta.pdf }} // Ajusta la URL según sea necesario
              style={{ width: 300, height: 300, marginTop: 20 }}
            />
          )}
          <TouchableOpacity
            style={[styles.button, styles.buttonClose]}
            onPress={() => handleSaveImage(apiUrl + selectedReceta.pdf)} // Ajusta la URL según sea necesario
          >
            <Text style={styles.textStyle}>Guardar Imagen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonClose]}
            onPress={() => setModalRecetaVisible(!modalRecetaVisible)}
          >
            <Text style={styles.textStyle}>Cerrar</Text>
          </TouchableOpacity>
        </>
      )}
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

      <View style={styles.section}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text onPress={() => setShowCitasAgendadas(!showCitasAgendadas)} style={styles.sectionTitle} >Citas Agendadas</Text>
          <Ionicons
            name={showCitasAgendadas ? "chevron-up" : "chevron-down"}
            size={35}
            color={"#000"}
            onPress={() => setShowCitasAgendadas(!showCitasAgendadas)}
          />
        </View>
        {showCitasAgendadas && (
          <>
            <View style={styles.filtersContainer}>
              <View style={styles.filterPickerContainer}>
                <Picker
                  selectedValue={selectedFilter}
                  onValueChange={handleFilterChange}
                  style={styles.picker}
                >
                  <Picker.Item label="Todas" value="all" />
                  <Picker.Item label="Pendientes" value="pendiente" />
                  <Picker.Item label="Aprobadas" value="aprobado" />
                  <Picker.Item label="Finalizadas" value="finalizado" />
                  <Picker.Item label="Canceladas" value="cancelado" />
                </Picker>
              </View>
            </View>
            <ScrollView style={styles.containerTitle}>
              {filteredCitas.length > 0 &&
                filteredCitas.map((cita, index) => (
                  <View
                    style={[
                      styles.item,
                      { backgroundColor: statusColors[cita?.status] || "#FFFFFF" }, // Aplica el color basado en el estado de la cita
                    ]}
                    key={index}
                  >
                    <Text style={styles.itemTitle}>
                      Fecha: {moment(cita?.date).format("DD/MM/YY")}
                    </Text>
                    <Text style={styles.itemSubtitle}>
                      Hora: {cita?.time}
                    </Text>
                    <Text style={styles.itemSubtitle}>
                      Especialidad: {cita?.specialty?.name}
                    </Text>
                    <Text style={styles.itemContent}>
                      Doctor: {cita?.doctor?.name}
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
            </ScrollView>
          </>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: "#E1BEE7" }]}>
  <View
    style={{
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
    }}
  >
    <Text onPress={() => setShowRecetas(!showRecetas)} style={[styles.sectionTitle, { color: "#6A1B9A" }]}>Recetas</Text>
    <Ionicons
      name={showRecetas ? "chevron-up" : "chevron-down"}
      size={35}
      color={"#000"}
      onPress={() => setShowRecetas(!showRecetas)}
    />
  </View>
  {showRecetas && recetas.map((receta) => (
    <View key={receta._id} style={styles.item}>
      <Text style={styles.itemTitle}>Código: {receta.codigo}</Text>
      <Text style={styles.itemSubtitle}>Médico: {receta.medico.name}</Text>
      <Text style={styles.itemSubtitle}>Paciente: {receta.paciente.name}</Text>
      <Text style={styles.itemContent}>Fecha de Creación: {receta.createAt}</Text>
      <Text style={styles.itemContent}>Activo: {receta.activo ? 'Sí' : 'No'}</Text>
      {receta.fecanulacion && (
        <Text style={styles.itemContent}>Fecha de Anulación: {receta.fecanulacion}</Text>
      )}
      {receta.pdf && (
        <TouchableOpacity style={styles.button} onPress={() => openRecetaModal(receta)}>
          <Text style={styles.link}>Ver PDF</Text>
        </TouchableOpacity>
      )}
    </View>
  ))}
</View>


      <View style={[styles.section, { backgroundColor: "#FCE4EC" }]}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text onPress={() => setShowFacturas(!showFacturas)} style={[styles.sectionTitle, { color: "#AD1457" }]}>Facturas</Text>
          <Ionicons
            name={showFacturas ? "chevron-up" : "chevron-down"}
            size={35}
            color={"#000"}
            onPress={() => setShowFacturas(!showFacturas)}
          />
        </View>
        {showFacturas && facturas.map((factura) => (
          <View key={factura._id} style={styles.item}>
            <Text style={styles.itemTitle}>Número: {factura.numero}</Text>
            <Text style={styles.itemSubtitle}>Fecha de Emisión: {factura.fechaEmision}</Text>
            <Text style={styles.itemContent}>Deuda: {factura.deuda}</Text>
            <Text style={styles.itemContent}>Total: {factura.total}</Text>
            <Text style={styles.itemContent}>Usuario: {factura.usuario.name}</Text>
            {factura.pdf && (
              <TouchableOpacity style={styles.button} onPress={() => openFacturaModal(factura)}>
                <Text style={styles.link}>Ver PDF</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
      <View style={styles.containerTitle}></View>
    </ScrollView>
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
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
  button: {
    width: "100%",
    height: 35,
    marginTop: 10,
    borderRadius: 10,
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
    padding: 13,
    flex: 1,
    backgroundColor: "#F5FCFF",
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
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterPickerContainer: {
    flex: 1,
    marginVertical: 10,
  },
  picker: {
    backgroundColor: "#DDD1E6",
    borderRadius: 5,
  },
});

export default HomeScreen;
