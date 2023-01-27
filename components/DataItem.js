import React from "react";
import { StyleSheet, TouchableWithoutFeedback, View, Text } from "react-native";
import colors from "../constants/colors";
import ProfileImage from "./ProfileImage";

export default function DataItem(props) {
  const { title, subTitle, image } = props;
  return (
    <TouchableWithoutFeedback>
      <View style={styles.container}>
        <ProfileImage size={40} uri={image}></ProfileImage>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subTitle} numberOfLines={1}>
            {subTitle}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 7,
    borderBottomColor: colors.lightGray,
    borderBottomWidth: 1,
    alignItems: "center",
    minHeight: 50,
  },
  textContainer: {
    marginLeft: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
  },
  subTitle: {
    color: colors.grey,
  },
});
