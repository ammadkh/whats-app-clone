import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import colors from "../constants/colors";

export default function Input(props) {
  const [value, setValue] = useState(props.initialValue);
  const changeTextHandler = (text) => {
    setValue(text);
    props.onInputChanged(props.id, text);
  };
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{props.label}</Text>
      <View style={styles.inputContainer}>
        {!!props.icon && (
          <props.iconPackage
            name={props.icon}
            size={props.iconSize || 15}
            style={styles.icon}
          />
        )}
        <TextInput
          {...props}
          style={styles.input}
          onChangeText={changeTextHandler}
          value={value}
        ></TextInput>
      </View>
      {props.errorText && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{props.errorText[0]}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    fontFamily: "Roboto-Bold",
    marginVertical: 8,
    letterSpacing: 0.3,
    color: colors.textColor,
  },
  inputContainer: {
    backgroundColor: colors.nearlyWhite,
    borderRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    color: colors.lightGray,
    marginRight: 10,
  },
  input: {
    color: colors.textColor,
    paddingTop: 0,
    letterSpacing: 0.3,
    flex: 1,
  },
  errorContainer: {
    marginVertical: 5,
  },
  errorText: {
    color: "red",
    fontSize: 13,
    letterSpacing: 0.3,
  },
});
