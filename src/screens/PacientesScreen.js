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
} from "react-native";
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

const PacientesScreen = ({ navigation }) => {
  const { currentUser } = useUser();
  const [modalVisible, setModalVisible] = useState(false);
  const [openChangePass, setOpenChangePass] = useState(false);
  const [citas, setCitas] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

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

  const { getUsers, getCitas, useChangePassword } = useAuthService();

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

  const handleGetPacientes = async () => {
    try {
      const resp = await getUsers();
      setCitas(resp?.filter((paciente) => paciente?.rol === "paciente"));
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
    } catch (error) {}
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const filteredCitas = citas.filter(
    (cita) =>
      cita?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cita?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    handleGetPacientes();
    if (!currentUser?.confirmado) {
      setOpenChangePass(true);
    }
  }, []);

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

      <View style={styles.section}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.sectionTitle}>Pacientes</Text>
          <Ionicons
            name="refresh"
            size={28}
            color={"#000"}
            onPress={handleGetPacientes}
          />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o apellido"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {filteredCitas.length > 0 &&
          filteredCitas.map((cita, index) => (
            <View style={styles.item} key={index}>
              <Text style={styles.itemContent}>Nombre: {cita?.name}</Text>
              <Text style={styles.itemSubtitle}>Email: {cita?.email}</Text>
              <Text style={styles.itemContent}>Teléfono: {cita?.phone}</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  navigation.navigate("PacienteDetailScreen", {
                    paciente: cita._id,
                  })
                }
              >
                <Text>Ver</Text>
              </TouchableOpacity>
            </View>
          ))}
      </View>
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
  searchInput: {
    height: 40,
    borderColor: "#c1c1c1",
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 10,
    marginBottom: 10,
  },
});

export default PacientesScreen;
