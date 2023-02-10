import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import DataItem from "../components/DataItem";
import PageContainer from "../components/PageContainer";
import PageTitle from "../components/PageTitle";
import ProfileImage from "../components/ProfileImage";
import SubmitButton from "../components/SubmitButton";
import colors from "../constants/colors";
import { removeUserFromChat } from "../utils/actions/chatAction";
import { getUserChats } from "../utils/actions/userActions";

export default function ContactScreen(props) {
  const [isLoading, setIsLoading] = useState(false);
  const storedUsers = useSelector((state) => state.users.storedUsers);
  const storedChats = useSelector((state) => state.chat.chatsData);
  const selectedUser = storedUsers[props.route.params.uid];
  const userData = useSelector((state) => state.auth.userData);
  const chatId = props.route.params.chatId;
  const chatData = chatId && storedChats[chatId];
  const [commonChats, setCommonChats] = useState([]);
  useEffect(() => {
    const getChats = async () => {
      const chats = await getUserChats(selectedUser.userId);
      setCommonChats(
        Object.values(chats).filter(
          (cid) => storedChats[cid] && storedChats[cid].isGroupChat
        )
      );
    };
    getChats();
  }, [selectedUser]);

  const removeFromChat = useCallback(async () => {
    try {
      setIsLoading(true);
      await removeUserFromChat(userData, selectedUser, chatData);
      props.navigation.goBack();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, props.navigation]);
  return (
    <PageContainer>
      <View style={styles.topContainer}>
        <ProfileImage
          size={80}
          uri={selectedUser.profilePicture}
          style={{ marginBottom: 20 }}
        ></ProfileImage>
        <PageTitle text={selectedUser.fullName} />
        {selectedUser.about && (
          <Text style={styles.about} numberOfLines={2}>
            {selectedUser.about}
          </Text>
        )}
      </View>
      {!!commonChats.length && (
        <>
          <Text style={styles.heading}>
            {commonChats.length} {commonChats.length === 1 ? "group" : "groups"}{" "}
            in common
          </Text>
          {commonChats.map((chatId) => {
            const chatData = storedChats[chatId];
            return (
              <DataItem
                key={chatId}
                title={chatData.chatName}
                image={chatData.chatImage}
                subTitle={chatData.lastTextMessage}
                type="link"
                onPress={() =>
                  props.navigation.push("chat screen", {
                    chatId,
                  })
                }
              ></DataItem>
            );
          })}
        </>
      )}
      {chatData &&
        chatData.isGroupChat &&
        (isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <SubmitButton
            color="red"
            title="Remove form chat"
            onPress={removeFromChat}
          ></SubmitButton>
        ))}
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    marginVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  about: {
    color: colors.grey,
    fontSize: 16,
  },
  heading: {
    marginVertical: 8,
    fontWeight: "600",
  },
});
