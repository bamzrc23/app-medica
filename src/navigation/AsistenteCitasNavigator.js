import {
    CardStyleInterpolators,
    createStackNavigator,
  } from "@react-navigation/stack";
  import CitasScreen from "../screens/CitasScreen";
import CitaDetailScreen from "../screens/CitaDetailScreen";
import { Ionicons } from "@expo/vector-icons";

  const Stack = createStackNavigator();
  
  export const AsistenteCitasNavigator = () => {
  
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
        {/* <Stack.Screen
          name="Tabs"
          options={{ headerShown: false }}
          component={DrawerNavigator}
        /> */}
        <Stack.Screen
          name="Cita"
          component={CitasScreen}
          options={{
            headerShown: false,
            tabBarLabel: "Citas",
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
            headerTitleAlign: 'center',
            tabBarIcon: ({ color }) => (
              <Ionicons name="document" size={28} color={color} />
            ),
          }}
        />
      </Stack.Navigator>
    );
  };
  