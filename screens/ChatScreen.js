import React, { useCallback, useEffect, useState } from "react";
import {
  Text,
  View,
  ImageBackground,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import backgroundImage from "../assets/images/droplet.jpeg";
import { Feather } from "@expo/vector-icons";
import colors from "../constants/colors";
import { useSelector } from "react-redux";
import PageContainer from "../components/PageContainer";
import Bubble from "../components/Bubble";
import { createChat, sendTextMessage } from "../utils/actions/chatAction";

export default function ChatScreen(props) {
  const [chatId, setChatId] = useState(props.route.params.chatId);
  const storedUsers = useSelector((state) => state.users.storedUsers);
  const userData = useSelector((state) => state.auth.userData);
  const messagesData = useSelector((state) => {
    const allMessages = state.messages.messageData;
    if (!allMessages) return [];
    const filterMessages = allMessages[chatId];
    if (!filterMessages) return [];
    const messagesArray = [];
    for (let key in filterMessages) {
      const messages = filterMessages[key];
      messagesArray.push({
        key,
        messages,
      });
    }
    return messagesArray;
  });
  const [errorBannerText, setErrorBannerText] = useState();
  const chatsData = useSelector((state) => state.chat.chatsData);
  console.log(messagesData, "messagesData data");
  const chatsUsers =
    (chatId && chatsData[chatId]) || props.route.params?.chatUsers;
  const getNameFromUserData = () => {
    const otherUserId = chatsUsers.users?.find(
      (user) => user.userId !== userData.userId
    );
    const otherUserData = storedUsers[otherUserId];
    return (
      otherUserData && `${otherUserData.firstName} ${otherUserData.lastName}`
    );
  };

  useEffect(() => {
    props.navigation.setOptions({
      headerTitle: getNameFromUserData(),
    });
  }, []);
  const [messageText, setMessageText] = useState("");
  const sendMessage = useCallback(async () => {
    try {
      if (!chatId) {
        const id = await createChat(userData.userId, chatsUsers);
        setChatId(id);
        return;
      }
      await sendTextMessage(chatId, userData.userId, messageText);
    } catch (error) {
      console.log(error, "ss");
      setErrorBannerText("Message is not sent. Try again");
      setTimeout(() => {
        setErrorBannerText(null);
      }, 5000);
    }
    setMessageText("");
  }, [messageText]);
  return (
    <SafeAreaView style={styles.container} edges={["bottom", "right", "left"]}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        <ImageBackground source={backgroundImage} style={styles.bgImg}>
          <PageContainer styles={{ backgroundColor: "transparent" }}>
            {!chatId && (
              <Bubble type="system" text="This is new chat. Say Hi"></Bubble>
            )}
            {!!errorBannerText && (
              <Bubble type="error" text={errorBannerText}></Bubble>
            )}
            {chatId && (
              <FlatList
                data={messagesData}
                renderItem={({ item }) => {
                  const isOwnMsg = item?.messages.sentBy === userData.userId;
                  const msgType = isOwnMsg ? "myMessage" : "theirMessage";
                  return (
                    <Bubble type={msgType} text={item.messages.text}></Bubble>
                  );
                }}
              ></FlatList>
            )}
          </PageContainer>
        </ImageBackground>
        <View style={styles.inputContainer}>
          <TouchableOpacity
            onPress={() => console.log("on pressed")}
            style={styles.mediaBtn}
          >
            <Feather name="plus" size={24} color={colors.blue} />
          </TouchableOpacity>
          <TextInput
            style={styles.textBox}
            value={messageText}
            onChangeText={(text) => setMessageText(text)}
            onSubmitEditing={sendMessage}
          />
          {!messageText && (
            <TouchableOpacity
              onPress={() => console.log("on pressed")}
              style={styles.mediaBtn}
            >
              <Feather name="camera" size={24} color={colors.blue} />
            </TouchableOpacity>
          )}
          {messageText && (
            <TouchableOpacity
              onPress={sendMessage}
              style={{ ...styles.mediaBtn, ...styles.sendBtn }}
            >
              <Feather name="send" size={20} color={"white"} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  bgImg: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 8,
    height: 50,
  },
  textBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: colors.lightGray,
    marginHorizontal: 15,
    paddingHorizontal: 12,
  },
  mediaBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: 35,
  },
  sendBtn: {
    backgroundColor: colors.blue,
    borderRadius: 50,
    padding: 8,
  },
});
