import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useAuthService } from "../services/user.service";
import { useUser } from "../usuario";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from '@react-native-picker/picker';
import { Calendar } from 'react-native-calendars';

const MenstrualControlScreen = () => {
  const { currentUser: user } = useUser();
  const { getMenstrualControlByPatient, createMenstrualControl, updateMenstrualControl } = useAuthService();
  const [controls, setControls] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedControl, setSelectedControl] = useState(null);
  const [form, setForm] = useState({
    fechaInicialPeriodo: '',
    fluido: '',
    notas: '',
    ciclo: 28
  });
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useEffect(() => {
    const fetchControls = async () => {
      try {
        const resp = await getMenstrualControlByPatient(user._id);
        setControls(resp);
      } catch (error) {
        console.error(error);
      }
    };

    if (user) {
      fetchControls();
    }
  }, [user]);

  const openModal = (control = null, viewMode = false) => {
    setSelectedControl(control);
    setIsViewMode(viewMode);
    if (control && !viewMode) {
      setForm({
        fechaInicialPeriodo: control.fechaInicialPeriodo || '',
        fluido: control.fluido || '',
        notas: control.notas || '',
        ciclo: control.ciclo || 28,
        userId: user._id
      });
    } else {
      setForm({
        fechaInicialPeriodo: '',
        fluido: '',
        notas: '',
        ciclo: 28,
        userId: user._id
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedControl(null);
    setIsViewMode(false);
  };

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (selectedControl) {
        await updateMenstrualControl(selectedControl._id, form);
      } else {
        await createMenstrualControl(form);
      }
      handleSave();
      closeModal();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    try {
      const resp = await getMenstrualControlByPatient(user._id);
      setControls(resp);
    } catch (error) {
      console.error(error);
    }
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    handleChange('fechaInicialPeriodo', date.toISOString().split('T')[0]);
    hideDatePicker();
  };

  const formatDateRange = (dates) => {
    if (dates.length === 0) return "";
    const startDate = new Date(dates[0]).toLocaleDateString();
    const endDate = new Date(dates[dates.length - 1]).toLocaleDateString();
    return `${startDate} - ${endDate}`;
  };

  const screenWidth = Dimensions.get('window').width;

  const renderCalendar = () => {
    const markedDates = {};

    controls.forEach(control => {
      control.diasFertiles.forEach(date => {
        markedDates[date] = { color: 'lightblue', textColor: 'white' };
      });
      markedDates[control.fechaOvulacion] = { color: 'blue', textColor: 'white' };
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Controles Menstruales</Text>
      <Text style={styles.disclaimer}>
        Este control estima tu período fértil pero no garantiza embarazo ni anticoncepción. Consulta a tu médico para planificar el embarazo y elegir anticonceptivos adecuados.
      </Text>
      <TouchableOpacity style={styles.newButton} onPress={() => openModal()}>
        <Text style={styles.newButtonText}>Nuevo Registro</Text>
      </TouchableOpacity>
      <View style={styles.separator} />
      <ScrollView>
        {renderCalendar()}
        {controls.map(control => (
          <View key={control._id} style={styles.controlItem}>
            <Text style={styles.controlText}>Inicio de periodo: {new Date(control.fechaInicialPeriodo).toLocaleDateString()}</Text>
            <Text style={styles.controlText}>Fluido: {control.fluido}</Text>
            <Text style={styles.controlText}>Días Fértiles Estimados: {formatDateRange(control.diasFertiles)}</Text>
            <Text style={styles.controlText}>Fecha de Ovulación Estimada: {new Date(control.fechaOvulacion).toLocaleDateString()}</Text>
            <Text style={styles.controlText}>Ciclo: {control.ciclo} días</Text>
            <TouchableOpacity style={[styles.button, styles.buttonEdit]} onPress={() => openModal(control)}>
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => openModal(control, true)}>
              <Text style={styles.buttonText}>Ver</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalView}>
          <View style={[styles.modalContent, { width: screenWidth - 40 }]}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {isViewMode ? "Detalle del Registro" : selectedControl ? "Editar Registro" : "Nuevo Registro"}
            </Text>
            {isViewMode ? (
              selectedControl && (
                <View>
                  <Text style={styles.modalText}>Fecha Inicial del Periodo: {new Date(selectedControl.fechaInicialPeriodo).toLocaleDateString()}</Text>
                  <Text style={styles.modalText}>Flujo: {selectedControl.fluido}</Text>
                  <Text style={styles.modalText}>Notas: {selectedControl.notas}</Text>
                  <Text style={styles.modalText}>Días Fértiles Estimados: {formatDateRange(selectedControl.diasFertiles)}</Text>
                  <Text style={styles.modalText}>Fecha de Ovulación Estimada: {new Date(selectedControl.fechaOvulacion).toLocaleDateString()}</Text>
                  <Text style={styles.modalText}>Ciclo: {selectedControl.ciclo} días</Text>
                </View>
              )
            ) : (
              <View>
                <TouchableOpacity onPress={showDatePicker}>
                  <TextInput
                    style={styles.input}
                    placeholder="Fecha Inicial del Periodo"
                    value={form.fechaInicialPeriodo}
                    editable={false}
                  />
                </TouchableOpacity>
                <DateTimePickerModal
                  isVisible={isDatePickerVisible}
                  mode="date"
                  onConfirm={handleConfirm}
                  onCancel={hideDatePicker}
                />
                <Picker
                  selectedValue={form.ciclo}
                  style={styles.picker}
                  onValueChange={(itemValue) => handleChange('ciclo', itemValue)}
                >
                  {[...Array(21).keys()].map(i => {
                    const days = i + 20;
                    return <Picker.Item key={days} label={`${days} días`} value={days} />;
                  })}
                </Picker>
                <Picker
                  selectedValue={form.fluido}
                  style={styles.picker}
                  onValueChange={(itemValue) => handleChange('fluido', itemValue)}
                >
                  <Picker.Item label="Nivel de flujo" value="" enabled={false} />
                  <Picker.Item label="Bajo" value="bajo" />
                  <Picker.Item label="Medio" value="medio" />
                  <Picker.Item label="Alto" value="alto" />
                </Picker>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Notas"
                  value={form.notas}
                  onChangeText={(text) => handleChange('notas', text)}
                  multiline
                />
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.modalButton} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.buttonText2]} onPress={closeModal}>
                    <Text style={styles.buttonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#333',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5FCFF',
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#5E35B1',
  },
  newButton: {
    backgroundColor: '#5E35B1',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  newButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  separator: {
    marginVertical: 10,
  },
  controlItem: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 5,
  },
  controlText: {
    fontSize: 16,
    color: '#333',
  },
  buttonEdit: {
    backgroundColor: "#5E35B1",
  },
  button: {
    backgroundColor: '#B39DDB',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText2: {
    backgroundColor: "#B39DDB",
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    margin: 20,
    backgroundColor: '#F5FCFF',
    borderRadius: 20,
    padding: 35,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#5E35B1',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    width: 250,
    textAlignVertical: 'top',
  },
  picker: {
    backgroundColor: "#EDE7F6",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#5E35B1',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  disclaimer: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default MenstrualControlScreen;
