import React, { createContext, useState, useContext } from "react";
import { useAuthService } from "./services/user.service";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from "react-native-toast-message";


const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const { login } = useAuthService();
  // Inicializa el estado con un arreglo de usuarios
  const [users, setUsers] = useState();

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const [currentUser, setCurrentUser] = useState(null);

  const updateUser = (userIndex, userInfo) => {
    setUsers((prevUsers) => {
      const newUsers = [...prevUsers];
      newUsers[userIndex] = { ...newUsers[userIndex], ...userInfo };
      return newUsers;
    });
  };

  const loginUser = async (email, password) => {
    try {
      const resp = await login({ email, password });
      await AsyncStorage.setItem('clinica', resp.token);
      setCurrentUser(resp);
      Toast.show({
        type: "success",
        text1: "Inicio exitoso",
        position: "bottom",
        visibilityTime: 2000,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: error.response?.data?.msg,
        position: "bottom",
        visibilityTime: 3000,
      });
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('clinica');
    setCurrentUser(null);
  }

  return (
    <UserContext.Provider
      value={{ users, updateUser, currentUser, setCurrentUser, loginUser, logoutUser, handleLogout }}
    >
      {children}
    </UserContext.Provider>
  );
};
