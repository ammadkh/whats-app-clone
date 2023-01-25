import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import colors from "../constants/colors";

export default function SubmitButton(props) {
  const enabledBgColor = props.color || colors.primary;
  const disabledbgColor = colors.lightGray;
  const bgColor = props.disable ? disabledbgColor : enabledBgColor;
  return (
    <TouchableOpacity
      onPress={props.disable ? () => {} : props.onPress}
      style={{
        ...styles.btnContainer,
        ...props.style,
        backgroundColor: bgColor,
      }}
    >
      <Text style={{ color: props.disable ? colors.grey : "white" }}>
        {props.title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btnContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
