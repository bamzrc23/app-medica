import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Badge } from "react-native-paper";

//screens
import NotificationScreen from "../screens/NotificationScreen";
import CalendarScreen from "../screens/CalendarScreen";
import ProfileScreen from "../screens/ProfileScreen";
import CreateProfileScreen from "../screens/CreateProfileScreen";
import SignatureScreen from "../screens/SignatureScreen";
import MenstrualControlMenuScreen from "../screens/MenstrualControlMenuScreen";
import RecipeScreen from "../screens/RecipeScreen";
import DoctorProfileScreen from "../screens/DoctorProfileScreen";
import ScanQrScreen from "../screens/ScanQrScreen";
import GenerateQrScreen from "../screens/GenerateQrScreen";

// Importa el hook useUser de tu contexto
import { useUser } from "../usuario";
import LoginNavigator from "./LoginNavigator";
import { AsistenteNavigator } from "./AsistenteNavigator";
import { AsistenteCitasNavigator } from "./AsistenteCitasNavigator";
import { HomeNavigator } from "./HomeNavigator";
import { PacientesNavigator } from "./PacientesNavigator";
import { useAuthService } from "../services/user.service";

const Tab = createMaterialBottomTabNavigator();

const MyTabs = () => {
  const { currentUser } = useUser();
  const { getNotificationByUser } = useAuthService();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchUnreadNotifications = async () => {
    if (currentUser) {
      try {
        const resp = await getNotificationByUser(currentUser._id);
        const unreadCount = resp.filter(
          (notification) => !notification.read
        ).length;
        setUnreadNotifications(unreadCount);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();
  }, [currentUser]);

  return (
    <>
      {currentUser?.rol === "paciente" && (
        <Tab.Navigator
          initialRouteName="home"
          activeColor="#3e2465"
          inactiveColor="#ffffff"
          barStyle={{ backgroundColor: "#8384ee" }}
        >
          <Tab.Screen
            name="Home"
            component={HomeNavigator}
            options={{
              tabBarLabel: "Home",
              tabBarIcon: ({ color }) => (
                <Ionicons name="home" size={28} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Notification"
            component={NotificationScreen}
            options={{
              tabBarLabel: "Alertas",
              tabBarIcon: ({ color }) => (
                <View>
                  <Ionicons name="notifications" size={28} color={color} />
                  {unreadNotifications > 0 && (
                    <Badge
                      size={18}
                      style={{
                        position: "absolute",
                        top: -5,
                        right: -10,
                        backgroundColor: "red",
                      }}
                    >
                      {unreadNotifications}
                    </Badge>
                  )}
                </View>
              ),
            }}
          />
          <Tab.Screen
            name="Calendar"
            component={CalendarScreen}
            options={{
              tabBarLabel: "Agendar",
              tabBarIcon: ({ color }) => (
                <Ionicons name="calendar" size={28} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="control"
            component={MenstrualControlMenuScreen}
            options={{
              tabBarLabel: "Control",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons
                  name="calendar-heart"
                  size={28}
                  color={color}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarLabel: "Perfil",
              tabBarIcon: ({ color }) => (
                <FontAwesome name="user" size={28} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      )}

      {currentUser?.rol === "asistente" && (
        <Tab.Navigator
          activeColor="#3e2465"
          inactiveColor="#ffffff"
          barStyle={{ backgroundColor: "#8384ee" }}
        >
          <Tab.Screen
            name="Citas"
            component={AsistenteCitasNavigator}
            options={{
              tabBarLabel: "Citas",
              tabBarIcon: ({ color }) => (
                <Ionicons name="document" size={28} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Notification"
            component={NotificationScreen}
            options={{
              tabBarLabel: "Alertas",
              tabBarIcon: ({ color }) => (
                <View>
                  <Ionicons name="notifications" size={28} color={color} />
                  {unreadNotifications > 0 && (
                    <Badge
                      size={18}
                      style={{
                        position: "absolute",
                        top: -5,
                        right: -10,
                        backgroundColor: "red",
                      }}
                    >
                      {unreadNotifications}
                    </Badge>
                  )}
                </View>
              ),
            }}
          />
          <Tab.Screen
            name="users"
            component={PacientesNavigator}
            options={{
              tabBarLabel: "Pacientes",
              tabBarIcon: ({ color }) => (
                <FontAwesome5 name="users" size={25} color={color} />
              ),
            }}
          />
          {/*<Tab.Screen
            name="addCita"
            component={CalendarScreen}
            options={{
              tabBarLabel: "Crear cita",
              tabBarIcon: ({ color }) => (
                <Ionicons name="document" size={28} color={color} />
              ),
            }}
          />*/}
          <Tab.Screen
            name="subir"
            component={ScanQrScreen}
            options={{
              tabBarLabel: "Subir",
              tabBarIcon: ({ color }) => (
                <FontAwesome5 name="qrcode" size={28} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Profile"
            component={AsistenteNavigator}
            options={{
              tabBarLabel: "Perfil",
              tabBarIcon: ({ color }) => (
                <FontAwesome name="user" size={28} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      )}

      {currentUser?.rol === "doctor" && (
        <Tab.Navigator
          activeColor="#3e2465"
          inactiveColor="#ffffff"
          barStyle={{ backgroundColor: "#8384ee" }}
        >
          <Tab.Screen
            name="Citas"
            component={DoctorProfileScreen}
            options={{
              tabBarLabel: "Agenda",
              tabBarIcon: ({ color }) => (
                <Ionicons name="book" size={28} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Notification"
            component={NotificationScreen}
            options={{
              tabBarLabel: "Alertas",
              tabBarIcon: ({ color }) => (
                <View>
                  <Ionicons name="notifications" size={28} color={color} />
                  {unreadNotifications > 0 && (
                    <Badge
                      size={18}
                      style={{
                        position: "absolute",
                        top: -5,
                        right: -10,
                        backgroundColor: "red",
                      }}
                    >
                      {unreadNotifications}
                    </Badge>
                  )}
                </View>
              ),
            }}
          />
          <Tab.Screen
            name="firmar"
            component={SignatureScreen}
            options={{
              tabBarLabel: "Firmar",
              tabBarIcon: ({ color }) => (
                <FontAwesome5 name="file-signature" size={28} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="subir"
            component={ScanQrScreen}
            options={{
              tabBarLabel: "Cargar",
              tabBarIcon: ({ color }) => (
                <FontAwesome5 name="file-upload" size={28} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarLabel: "Perfil",
              tabBarIcon: ({ color }) => (
                <FontAwesome name="user" size={28} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      )}

      {currentUser?.rol === "admin" && (
        <Tab.Navigator
          initialRouteName="home"
          activeColor="#3e2465"
          inactiveColor="#ffffff"
          barStyle={{ backgroundColor: "#8384ee" }}
        >
          <Tab.Screen
            name="Create"
            component={CreateProfileScreen}
            options={{
              tabBarLabel: "Crear usuario",
              tabBarIcon: ({ color }) => (
                <FontAwesome name="user-plus" size={28} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="codigo"
            component={GenerateQrScreen}
            options={{
              tabBarLabel: "Generador QR",
              tabBarIcon: ({ color }) => (
                <FontAwesome name="qrcode" size={28} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarLabel: "Perfil",
              tabBarIcon: ({ color }) => (
                <FontAwesome name="user" size={28} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      )}
    </>
  );
};

export default function AppNavigator() {
  const { currentUser } = useUser();
  return (
    <>
      {currentUser ? (
        <NavigationContainer>
          <MyTabs />
        </NavigationContainer>
      ) : (
        <LoginNavigator />
      )}
    </>
  );
}
