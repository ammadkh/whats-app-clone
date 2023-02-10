import React from "react";
import { StyleSheet, TouchableWithoutFeedback, View, Text } from "react-native";
import colors from "../constants/colors";
import ProfileImage from "./ProfileImage";
import { Ionicons, AntDesign } from "@expo/vector-icons";

export default function DataItem(props) {
  const { title, subTitle, image, type, isChecked, icon, hideImage } = props;
  return (
    <TouchableWithoutFeedback onPress={props.onPress}>
      <View style={styles.container}>
        {!icon && !hideImage && (
          <ProfileImage size={40} uri={image}></ProfileImage>
        )}
        {icon && (
          <View style={styles.leftIconContainer}>
            <AntDesign name={icon} size={20} color={colors.blue} />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text
            style={{
              ...styles.title,
              color: type === "button" ? colors.blue : colors.textColor,
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subTitle && (
            <Text style={styles.subTitle} numberOfLines={1}>
              {subTitle}
            </Text>
          )}
        </View>
        {type === "checkbox" && (
          <View
            style={{
              ...styles.checkboxContainer,
              ...(isChecked && styles.checkedContainer),
            }}
          >
            <Ionicons name="checkmark" size={18} color="white" />
          </View>
        )}
        {type === "link" && (
          <View>
            <Ionicons name="chevron-forward-outline" size={18} color="black" />
          </View>
        )}
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
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
  },
  subTitle: {
    color: colors.grey,
  },
  checkboxContainer: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 50,
    backgroundColor: colors.white,
  },
  checkedContainer: {
    backgroundColor: colors.primary,
    borderColor: colors.lightGray,
    borderColor: "transparent",
  },
  leftIconContainer: {
    backgroundColor: colors.extraLightGray,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
  },
});
