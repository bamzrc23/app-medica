import {
  CardStyleInterpolators,
  createStackNavigator,
} from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import PacienteDetailScreen from "../screens/PacienteDetailScreen";
import PacientesScreen from "../screens/PacientesScreen";
import CitaDetailScreen from "../screens/CitaDetailScreen";

const Stack = createStackNavigator();

export const PacientesNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          elevation: 0,
          shadowColor: "transparent",
        },
        cardStyle: {
          backgroundColor: "white",
        },
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
    >
      <Stack.Screen
        name="Users"
        component={PacientesScreen}
        options={{
          headerShown: false,
          tabBarLabel: "Pacientes",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" size={28} color={color} />
          ),
        }}
      />
      <Stack.Screen
        name="CitaDetail"
        component={CitaDetailScreen}
        options={{
          headerShown: true,
          title: "Detalle de cita",
          headerTitleAlign: "center",
          tabBarIcon: ({ color }) => (
            <Ionicons name="document" size={28} color={color} />
          ),
        }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" size={28} color={color} />
          ),
        }}
      />
      <Stack.Screen
        name="PacienteDetailScreen"
        component={PacienteDetailScreen}
        options={{
          headerShown: true,
          title: "Historial de paciente",
          headerTitleAlign: "center",
          tabBarIcon: ({ color }) => (
            <Ionicons name="document" size={28} color={color} />
          ),
        }}
      />
    </Stack.Navigator>
  );
};
