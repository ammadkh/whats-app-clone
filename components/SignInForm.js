import React, { useCallback, useReducer, useEffect, useState } from "react";
import { Alert, ActivityIndicator } from "react-native";
import Input from "./Input";
import { Feather } from "@expo/vector-icons";
import SubmitButton from "./SubmitButton";
import { validateInput } from "../utils/actions/Formaction";
import { formReducer } from "../utils/reducers/FormReducer";
import { signin } from "../utils/actions/authAction";
import { useDispatch } from "react-redux";
import colors from "../constants/colors";

const initialState = {
  inputValues: {
    email: "",
    password: "",
  },
  inputValidities: {
    email: false,
    password: false,
  },
  formValidity: false,
};

export default function SignInForm() {
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState("");

  const [formState, dispatchFormState] = useReducer(formReducer, initialState);
  const onInputChanged = useCallback(
    (id, value) => {
      const result = validateInput(id, value);

      dispatchFormState({ id, validationResult: result, inputValue: value });
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
      const action = signin(
        formState.inputValues.email,
        formState.inputValues.password
      );
      setError(null);
      await dispatch(action);
    } catch (error) {
      console.log(error.message);
      setError(error.message);
      setIsLoading(false);
    }
  };
  return (
    <>
      <Input
        label="Email"
        icon="mail"
        id="email"
        iconPackage={Feather}
        keyboardType="email-address"
        autoCapitalize="none"
        onInputChanged={onInputChanged}
        errorText={formState.inputValidities["email"]}
      />
      <Input
        label="Password"
        icon="lock"
        id="password"
        iconPackage={Feather}
        onInputChanged={onInputChanged}
        secureTextEntry
        autoCapitalize="none"
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
          title="Sign In  "
        />
      )}
    </>
  );
}
