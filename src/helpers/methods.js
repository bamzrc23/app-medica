import Toast from "react-native-toast-message";
const handleToast = (type, message) => {
    Toast.show({
        type: type,
        text1: message,
        position: "bottom",
        visibilityTime: 2000,
    });
};
export { handleToast };