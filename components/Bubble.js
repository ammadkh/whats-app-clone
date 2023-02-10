import React, { useRef } from "react";
import {
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  Image,
} from "react-native";
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
import { starMessages } from "../utils/actions/chatAction";
import { useSelector } from "react-redux";
import ReplyTo from "./ReplyTo";

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

function formatDate(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
}

export default function Bubble(props) {
  const starredMessages = useSelector(
    (state) => state.messages.starredMessages[props?.chatId] ?? {}
  );
  const storedUser = useSelector((state) => state.users.storedUsers);
  const bubbleStyle = { ...styles.container };
  const textStyle = { ...styles.text };
  const wrapperStyle = { ...styles.wrapper };

  const menuRef = useRef();
  const id = useRef(uuid.v4());

  let Container = View;
  let isUsermessage = false;
  switch (props.type) {
    case "system":
      textStyle.color = "#65644A";
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
      isUsermessage = true;
      Container = TouchableWithoutFeedback;
      break;
    case "theirMessage":
      bubbleStyle.maxWidth = "90%";
      wrapperStyle.justifyContent = "flex-start";
      isUsermessage = true;
      Container = TouchableWithoutFeedback;
      break;
    case "reply":
      bubbleStyle.backgroundColor = "#F2F2F2";
      break;
    case "info":
      textStyle.color = "#65644A";
      bubbleStyle.backgroundColor = colors.beige;
      bubbleStyle.alignItems = "center";
      bubbleStyle.marginTop = 10;
      break;
    default:
      break;
  }

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
  };
  const replyingToUser =
    props?.replyingTo && storedUser[props.replyingTo.messages.sentBy];

  const isStarred =
    isUsermessage && (starredMessages[props.messageId] ?? undefined);

  const starMessage = async () => {
    try {
      await starMessages(props.userId, props.chatId, props.messageId);
    } catch (error) {
      console.log(error);
    }
  };

  const formattedDate = props?.date && formatDate(props?.date);

  return (
    <View style={wrapperStyle}>
      <Container
        onLongPress={() => {
          menuRef.current.props.ctx.menuActions.openMenu(id.current);
        }}
        style={{ width: "100%" }}
      >
        <View style={bubbleStyle}>
          {props.name && props.type != "info" && (
            <Text style={styles.name}>{props?.name}</Text>
          )}
          {replyingToUser && (
            <Bubble
              type="reply"
              text={props?.replyingTo?.messages.text}
              name={replyingToUser.fullName}
            />
          )}
          <Text style={textStyle}>{props.text}</Text>
          {props.imgUrl && (
            <Image
              source={{ uri: props.imgUrl }}
              style={{ width: 200, height: 200, marginBottom: 5 }}
            ></Image>
          )}
          {props.date && props.type != "info" && (
            <View style={styles.timeContainer}>
              {isStarred && (
                <FontAwesome
                  name="star"
                  color="gold"
                  style={{ marginRight: 5 }}
                />
              )}
              <Text style={styles.time}>{formattedDate}</Text>
            </View>
          )}
          <Menu name={id.current} ref={menuRef}>
            <MenuTrigger />
            <MenuOptions>
              <MenuItem
                onSelect={() => copyToClipboard(props.text)}
                text="Copy to Clipboard"
                icon="copy"
              />
              <MenuItem
                onSelect={starMessage}
                text={isStarred ? "Unstar message" : "Star message"}
                icon={isStarred ? "star-o" : "star"}
                iconPack={FontAwesome}
              />
              <MenuItem
                onSelect={props.onReply}
                text={"Reply"}
                icon={"reply"}
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
  timeContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  time: {
    fontSize: 12,
    color: colors.grey,
  },
  name: {
    fontWeight: "500",
    fontSize: 15,
  },
});
