import React, { useCallback, useEffect, useRef, useState } from "react";
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
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import backgroundImage from "../assets/images/droplet.jpeg";
import { Feather } from "@expo/vector-icons";
import colors from "../constants/colors";
import { useSelector } from "react-redux";
import PageContainer from "../components/PageContainer";
import Bubble from "../components/Bubble";
import {
  createChat,
  sendImgMessage,
  sendTextMessage,
} from "../utils/actions/chatAction";
import ReplyTo from "../components/ReplyTo.js";
import {
  launchCamera,
  launchImagePicker,
  uploadImageAsync,
} from "../utils/ImagePickerHelper";
import AwesomeAlert from "react-native-awesome-alerts";

export default function ChatScreen(props) {
  const [chatId, setChatId] = useState(props.route.params.chatId);
  const storedUsers = useSelector((state) => state.users.storedUsers);
  const userData = useSelector((state) => state.auth.userData);
  const [replyTo, setReplyTo] = useState();
  const [tempImgUri, setTempImgUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const flatList = useRef();

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
  const chatsUsers =
    (chatId && chatsData[chatId]) || props.route.params?.chatUsers;

  const getNameFromUserData = () => {
    const otherUserId = chatsUsers.users?.find(
      (user) => user !== userData.userId
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
  }, [props.navigation, chatsUsers, storedUsers, userData]);
  const [messageText, setMessageText] = useState("");
  const sendMessage = useCallback(async () => {
    try {
      if (!chatId) {
        const id = await createChat(userData.userId, chatsUsers);
        setChatId(id);
        return;
      }
      await sendTextMessage(
        chatId,
        userData.userId,
        messageText,
        replyTo && replyTo.key
      );
      setReplyTo(null);
    } catch (error) {
      console.log(error, "ss");
      setErrorBannerText("Message is not sent. Try again");
      setTimeout(() => {
        setErrorBannerText(null);
      }, 5000);
    }
    setMessageText("");
  }, [messageText]);

  const sendImageHandler = async () => {
    try {
      const tempUri = await launchImagePicker();
      if (!tempUri) return;
      setTempImgUri(tempUri);
    } catch (error) {
      console.log(error);
    }
  };

  const cameraHandler = async () => {
    try {
      const tempUri = await launchCamera();
      if (!tempUri) return;
      setTempImgUri(tempUri);
    } catch (error) {
      console.log(error);
    }
  };

  const uploadImg = async () => {
    try {
      setIsLoading(true);
      let id;
      if (!chatId) {
        id = await createChat(userData.userId, chatsUsers);
        setChatId(id);
      }
      const uploadedImgUrl = await uploadImageAsync(tempImgUri, true);
      await sendImgMessage(
        chatId ?? id,
        userData.userId,
        uploadedImgUrl,
        replyTo && replyTo.key
      );
      setIsLoading(false);
      setReplyTo(null);
      setTempImgUri(null);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

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
                ref={(ref) => (flatList.current = ref)}
                onContentSizeChange={() =>
                  flatList.current.scrollToEnd({
                    animate: false,
                  })
                }
                onLayout={() =>
                  flatList.current.scrollToEnd({
                    animate: false,
                  })
                }
                data={messagesData}
                renderItem={({ item }) => {
                  const isOwnMsg = item?.messages.sentBy === userData.userId;
                  const msgType = isOwnMsg ? "myMessage" : "theirMessage";
                  return (
                    <Bubble
                      type={msgType}
                      text={item.messages.text}
                      userId={userData.userId}
                      chatId={chatId}
                      messageId={item.key}
                      date={new Date(item.messages.sentAt)}
                      onReply={() => setReplyTo(item)}
                      replyingTo={
                        item.messages.replyTo &&
                        messagesData.find(
                          (message) => message.key === item.messages.replyTo
                        )
                      }
                      imgUrl={item.messages.imageUrl}
                    ></Bubble>
                  );
                }}
              ></FlatList>
            )}
          </PageContainer>
          {replyTo && (
            <ReplyTo
              user={storedUsers[replyTo.messages.sentBy]}
              text={replyTo.messages.text}
              onCancel={() => setReplyTo(null)}
            ></ReplyTo>
          )}
        </ImageBackground>
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={sendImageHandler} style={styles.mediaBtn}>
            <Feather name="plus" size={24} color={colors.blue} />
          </TouchableOpacity>
          <TextInput
            style={styles.textBox}
            value={messageText}
            onChangeText={(text) => setMessageText(text)}
            onSubmitEditing={sendMessage}
          />
          {!messageText && (
            <TouchableOpacity onPress={cameraHandler} style={styles.mediaBtn}>
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
        <AwesomeAlert
          show={!!tempImgUri}
          showProgress={false}
          title="Send Image?"
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={true}
          showConfirmButton={true}
          cancelText="Cancel"
          confirmText="Send Image"
          confirmButtonColor={colors.primary}
          onCancelPressed={() => {
            setTempImgUri(null);
          }}
          onConfirmPressed={uploadImg}
          customView={
            <View>
              {isLoading && (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                ></ActivityIndicator>
              )}
              {!isLoading && !!tempImgUri && (
                <Image
                  source={{ uri: tempImgUri }}
                  style={{ width: 200, height: 200 }}
                ></Image>
              )}
            </View>
          }
        />
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
