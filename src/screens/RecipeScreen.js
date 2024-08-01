import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Button, Modal } from 'react-native';
import { useAuthService } from '../services/user.service';
import { useUser } from '../usuario';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const RecipeScreen = () => {
  const { currentUser: user } = useUser();
  const { getRecetasByUser, createReceta } = useAuthService();
  const [recipes, setRecipes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    userId: user._id,
    doctorId: '', // Doctor ID should be set appropriately
    fecha: '',
    medicamentos: [{ nombre: '', dosis: '', frecuencia: '' }],
    instrucciones: ''
  });
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const resp = await getRecetasByUser(user._id);
        setRecipes(resp);
      } catch (error) {
        console.error(error);
      }
    };

    fetchRecipes();
  }, [user]);

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleMedicineChange = (index, name, value) => {
    const updatedMedicines = form.medicamentos.map((med, i) => 
      i === index ? { ...med, [name]: value } : med
    );
    setForm({ ...form, medicamentos: updatedMedicines });
  };

  const addMedicine = () => {
    setForm({ ...form, medicamentos: [...form.medicamentos, { nombre: '', dosis: '', frecuencia: '' }] });
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    handleChange('fecha', date.toISOString().split('T')[0]);
    hideDatePicker();
  };

  const handleSubmit = async () => {
    try {
      await createReceta(form);
      handleSave();
      closeModal();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    const resp = await getRecetasByUser(user._id);
    setRecipes(resp);
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const RecipeItem = ({ item }) => (
    <View style={styles.recipeItem}>
      <Text>Fecha: {new Date(item.fecha).toLocaleDateString()}</Text>
      <Text>Doctor: {item.doctor.name}</Text>
      <Text>Medicamentos:</Text>
      {item.medicamentos.map((med, index) => (
        <View key={index}>
          <Text> - {med.nombre}: {med.dosis} ({med.frecuencia})</Text>
        </View>
      ))}
      <Text>Instrucciones: {item.instrucciones}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recetas</Text>
      <Button title="Nueva Receta" onPress={openModal} />
      <FlatList
        data={recipes}
        renderItem={({ item }) => <RecipeItem item={item} />}
        keyExtractor={item => item._id}
        style={{ width: '100%', flex: 1 }}
      />

      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalView}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Receta</Text>
            <TouchableOpacity onPress={showDatePicker}>
              <TextInput
                style={styles.input}
                placeholder="Fecha"
                value={form.fecha}
                editable={false}
              />
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
            />
            {form.medicamentos.map((med, index) => (
              <View key={index}>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre del Medicamento"
                  value={med.nombre}
                  onChangeText={(text) => handleMedicineChange(index, 'nombre', text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Dosis"
                  value={med.dosis}
                  onChangeText={(text) => handleMedicineChange(index, 'dosis', text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Frecuencia"
                  value={med.frecuencia}
                  onChangeText={(text) => handleMedicineChange(index, 'frecuencia', text)}
                />
              </View>
            ))}
            <Button title="Agregar Medicamento" onPress={addMedicine} />
            <TextInput
              style={styles.input}
              placeholder="Instrucciones"
              value={form.instrucciones}
              onChangeText={(text) => handleChange('instrucciones', text)}
            />
            <View style={styles.buttonContainer}>
              <Button title="Guardar" onPress={handleSubmit} />
              <Button title="Cancelar" onPress={closeModal} />
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
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  recipeItem: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 5,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default RecipeScreen;
