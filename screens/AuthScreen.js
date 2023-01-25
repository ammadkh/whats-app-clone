import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Input from "../components/Input";
import PageContainer from "../components/PageContainer";
import { FontAwesome, Feather } from "@expo/vector-icons";
import SubmitButton from "../components/SubmitButton";
import SignUpForm from "../components/SignUpForm";
import SignInForm from "../components/SignInForm";
import colors from "../constants/colors";
import logo from "../assets/images/logo.png";

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      enabled
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container}>
        <SafeAreaView style={styles.container}>
          <PageContainer>
            <View style={styles.imageContainer}>
              <Image
                source={logo}
                style={styles.img}
                resizeMode="contain"
              ></Image>
            </View>
            {isSignUp ? <SignUpForm /> : <SignInForm />}
            <TouchableOpacity
              style={styles.linkContainer}
              onPress={() => setIsSignUp((prevState) => !prevState)}
            >
              <Text style={styles.link}>
                {`Switch to ${isSignUp ? "Sign in" : "Sign up"}`}
              </Text>
            </TouchableOpacity>
          </PageContainer>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  linkContainer: {
    marginVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  link: {
    color: colors.blue,
  },
  img: {
    width: "50%",
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "center",
  },
});
