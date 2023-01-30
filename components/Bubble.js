import React, { useRef } from "react";
import { StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import colors from "../constants/colors";
// somewhere in your app
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import uuid from "react-native-uuid";
import * as Clipboard from "expo-clipboard";
import { Feather, FontAwesome } from "@expo/vector-icons";

const MenuItem = (props) => {
  const Icon = props.iconPack ?? Feather;
  return (
    <MenuOption onSelect={props.onSelect}>
      <View style={styles.menuItemContainer}>
        <Text style={styles.menuText}>{props.text} </Text>
        <Icon name={props.icon} size={18}></Icon>
      </View>
    </MenuOption>
  );
};

export default function Bubble(props) {
  const bubbleStyle = { ...styles.container };
  const textStyle = { ...styles.text };
  const wrapperStyle = { ...styles.wrapper };

  const menuRef = useRef();
  const id = useRef(uuid.v4());

  let Container = View;

  switch (props.type) {
    case "system":
      textStyle.color = "65644A";
      bubbleStyle.backgroundColor = colors.beige;
      bubbleStyle.alignItems = "center";
      bubbleStyle.marginTop = 10;
      break;
    case "error":
      textStyle.color = "white";
      bubbleStyle.backgroundColor = "red";
      bubbleStyle.alignItems = "center";
      bubbleStyle.marginTop = 10;
      break;
    case "myMessage":
      bubbleStyle.maxWidth = "90%";
      wrapperStyle.justifyContent = "flex-end";
      bubbleStyle.backgroundColor = "#E7FED6";
      Container = TouchableWithoutFeedback;
      break;
    case "theirMessage":
      bubbleStyle.maxWidth = "90%";
      wrapperStyle.justifyContent = "flex-start";
      Container = TouchableWithoutFeedback;

      break;
    default:
      break;
  }

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
  };

  return (
    <View style={wrapperStyle}>
      <Container
        onLongPress={() => {
          menuRef.current.props.ctx.menuActions.openMenu(id.current);
        }}
        style={{ width: "100%" }}
      >
        <View style={bubbleStyle}>
          <Text style={textStyle}>{props.text}</Text>
          <Menu name={id.current} ref={menuRef}>
            <MenuTrigger />
            <MenuOptions>
              <MenuItem
                onSelect={() => copyToClipboard(props.text)}
                text="Copy to Clipboard"
                icon="copy"
              />
              <MenuItem
                onSelect={() => copyToClipboard(props.text)}
                text="Star"
                icon="star-o"
                iconPack={FontAwesome}
              />
            </MenuOptions>
          </Menu>
        </View>
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    justifyContent: "center",
  },
  container: {
    backgroundColor: "white",
    padding: 5,
    borderRadius: 6,
    marginBottom: 10,
    borderColor: "#E2DACC",
    borderWidth: 1,
  },
  text: {
    letterSpacing: 0.3,
  },
  menuItemContainer: {
    flexDirection: "row",
    padding: 5,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
  },
});
