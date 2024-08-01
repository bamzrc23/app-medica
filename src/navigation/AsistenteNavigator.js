import {
  CardStyleInterpolators,
  createStackNavigator,
} from "@react-navigation/stack";
import ProfileScreen from "../screens/ProfileScreen";
import CitasScreen from "../screens/CitasScreen";

const Stack = createStackNavigator();

export const AsistenteNavigator = () => {

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
        name="Profiles"
        component={ProfileScreen}
        options={{
          headerShown: false,
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" size={28} color={color} />
          ),
        }}
      />

    </Stack.Navigator>
  );
};
