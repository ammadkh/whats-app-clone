import React from "react";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";
import colors from "../constants/colors";
import { AntDesign } from "@expo/vector-icons";

export default function ReplyTo({ text, user, onCancel }) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text numberOfLines={1} style={styles.name}>
          {user?.fullName}
        </Text>
        <Text numberOfLines={1}>{text}</Text>
      </View>
      <TouchableOpacity onPress={onCancel}>
        <AntDesign name="closecircleo" size={18} color={colors.blue} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.lightGray,
    padding: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.blue,
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    marginRight: 5,
    flex: 1,
  },
  name: {
    color: colors.blue,
    fontWeight: "500",
  },
});
