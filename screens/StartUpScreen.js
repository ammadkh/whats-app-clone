import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useDispatch } from "react-redux";
import colors from "../constants/colors";
import { commonStyles } from "../constants/commonStyles";
import { authenticate, didTryAutoLogin } from "../store/authSlice";
import { getUser } from "../utils/actions/userActions";

export default function StartUpScreen() {
  const dispatch = useDispatch();
  useEffect(() => {
    const tryLogin = async () => {
      const storedAuthInfo = await AsyncStorage.getItem("user");
      if (!storedAuthInfo) {
        dispatch(didTryAutoLogin());
        return;
      }
      const parsedData = JSON.parse(storedAuthInfo);
      const { token, userId, expiryDate: expiryDateString } = parsedData;
      const expiryDate = new Date(expiryDateString);
      if (!token || !userId || expiryDate <= new Date()) {
        dispatch(didTryAutoLogin());
        return;
      }
      const userData = await getUser(userId);
      dispatch(authenticate({ token, userData }));
    };
    tryLogin();
  }, []);
  return (
    <View style={commonStyles.center}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}
