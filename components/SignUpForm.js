import React, { useCallback, useEffect, useReducer, useState } from "react";
import Input from "./Input";
import { FontAwesome, Feather } from "@expo/vector-icons";
import SubmitButton from "./SubmitButton";
import { validateInput } from "../utils/actions/Formaction";
import { formReducer } from "../utils/reducers/FormReducer";
import { signup } from "../utils/actions/authAction";
import { ActivityIndicator, Alert } from "react-native";
import colors from "../constants/colors";
import { useDispatch } from "react-redux";
// Import the functions you need from the SDKs you need
const initialState = {
  inputValues: {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  },
  inputValidities: {
    firstName: false,
    lastName: false,
    email: false,
    password: false,
  },
  formValidity: false,
};

export default function SignUpForm() {
  const dispatch = useDispatch();
  const [formState, dispatchFormState] = useReducer(formReducer, initialState);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState("");

  const onInputChanged = useCallback(
    (id, value) => {
      const result = validateInput(id, value);
      dispatchFormState({ id, validationResult: result, inputValue: value });
      console.log(result);
    },
    [dispatchFormState]
  );

  useEffect(() => {
    if (error) {
      Alert.alert("Error Occured", error);
    }
  }, [error]);

  const authHandler = async () => {
    try {
      setIsLoading(true);
      const action = signup(
        formState.inputValues.firstName,
        formState.inputValues.lastName,
        formState.inputValues.email,
        formState.inputValues.password
      );
      setError(null);
      await dispatch(action);
    } catch (error) {
      console.log(error.message, "xxx");
      setError(error.message);
      setIsLoading(false);
    }
  };
  return (
    <>
      <Input
        label="First Name"
        icon="user-o"
        id="firstName"
        iconPackage={FontAwesome}
        onInputChanged={onInputChanged}
        errorText={formState.inputValidities["firstName"]}
      />
      <Input
        label="Last Name"
        icon="user-o"
        id="lastName"
        iconPackage={FontAwesome}
        onInputChanged={onInputChanged}
        errorText={formState.inputValidities["lastName"]}
      />
      <Input
        label="Email"
        icon="mail"
        id="email"
        keyboardType="email-address"
        iconPackage={Feather}
        autoCapitalize="none"
        onInputChanged={onInputChanged}
        errorText={formState.inputValidities["email"]}
      />
      <Input
        label="Password"
        icon="lock"
        id="password"
        iconPackage={Feather}
        secureTextEntry
        autoCapitalize="none"
        onInputChanged={onInputChanged}
        errorText={formState.inputValidities["password"]}
      />
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={{ marginTop: 10 }}
        ></ActivityIndicator>
      ) : (
        <SubmitButton
          disable={!formState.formValidity}
          onPress={authHandler}
          style={{ marginTop: 10 }}
          title="Sign Up "
        />
      )}
    </>
  );
}
