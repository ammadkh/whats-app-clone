import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function PageContainer(props) {
  return (
    <View style={{ ...styles.container, ...props.styles }}>
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "white",
  },
});
