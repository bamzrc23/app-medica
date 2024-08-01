import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useIsFocused } from "@react-navigation/native"; // Importa el hook
import { useUser } from "../usuario";
import { useAuthService } from "../services/user.service";
import { Ionicons } from "@expo/vector-icons";

const NotificationScreen = () => {
  const isFocused = useIsFocused(); // Verifica si la pantalla está enfocada
  const { currentUser } = useUser();
  const { getNotificationByUser, deleteNotification } = useAuthService();
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    if (currentUser) {
      const resp = await getNotificationByUser(currentUser._id);
      setNotifications(resp);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentUser]);

  useEffect(() => {
    if (isFocused) {
      fetchNotifications();
    }
  }, [isFocused]);

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      fetchNotifications();
    } catch (error) {
      console.error(`Error al eliminar la notificación con ID ${id}:`, error);
    }
  };  
  

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prevNotifications) => prevNotifications.filter((notification) => notification._id !== id));
    } catch (error) {
      console.error("Error al eliminar la notificación:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notificaciones</Text>
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <View style={styles.notification}>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationDescription}>{item.description}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteButton}>
              <Ionicons name="trash" size={20} color="white" />
        </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item._id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5FCFF",
    marginTop: 22,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  notification: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  notificationContent: {
    flex: 1,
  },
  notificationDescription: {
    fontSize: 14,
    color: "#666",
  },
  deleteButton: {
    backgroundColor: "#ff3b3b",
    borderRadius: 50,
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default NotificationScreen;
