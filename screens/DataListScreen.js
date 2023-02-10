import React, { useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import { useSelector } from "react-redux";
import DataItem from "../components/DataItem";
import PageContainer from "../components/PageContainer";

export default function DataListScreen(props) {
  const { title, data, type, chatId } = props.route.params;

  const storedUsers = useSelector((state) => state.users.storedUsers);
  const storedMessages = useSelector((state) => state.messages.messageData);
  const userData = useSelector((state) => state.auth.userData);

  useEffect(() => {
    props.navigation.setOptions({
      headerTitle: title,
    });
  }, [title]);

  return (
    <PageContainer>
      <FlatList
        data={data}
        keyExtractor={(item) => item.messageId || item}
        renderItem={({ item }) => {
          let key, onPress, image, title, subTitle, itemType;
          if (type === "messages") {
            const { chatId, messageId } = item;
            const chatMessages = storedMessages[chatId];
            const messageData = chatMessages[messageId];
            const sender =
              messageData.sentBy && storedUsers[messageData.sentBy];
            const name = sender && sender.fullName;
            title = name;
            image = sender.profilePicture;
            subTitle = messageData.text;
            key = messageId;
            itemType = undefined;
            onPress = () => {};
          }
          if (type === "users") {
            const uid = item;
            const currentUser = storedUsers[uid];
            if (!currentUser) return;
            const isLoggedInUser = uid == userData.userId;
            key = uid;
            title = currentUser.fullName;
            image = currentUser.profilePicture;
            subTitle = currentUser.about;
            itemType = isLoggedInUser ? undefined : "link";
            onPress = isLoggedInUser
              ? undefined
              : () =>
                  props.navigation.navigate("ContactScreen", { uid, chatId });
          }
          return (
            <DataItem
              key={key}
              onPress={onPress}
              image={image}
              title={title}
              subTitle={subTitle}
              type={itemType}
            ></DataItem>
          );
        }}
      ></FlatList>
    </PageContainer>
  );
}
