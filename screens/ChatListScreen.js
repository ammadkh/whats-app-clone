import React, { useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useSelector } from "react-redux";
import CustomHeaderButtton from "../components/CustomHeaderButtton";
import DataItem from "../components/DataItem";
import PageContainer from "../components/PageContainer";
import PageTitle from "../components/PageTitle";
import colors from "../constants/colors";

export default function ChatListScreen(props) {
  const { navigation, route } = props;
  const userData = useSelector((state) => state.auth.userData);
  const storedUsers = useSelector((state) => state.users.storedUsers);

  const chatsData = useSelector((state) => {
    const data = state.chat.chatsData;
    return (
      data &&
      Object.values(data).sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      )
    );
  });
  const selectedUserId = route.params?.selectedUserId;
  const selectedUsers = route.params?.selectedUsers;
  const chatName = route.params?.chatName;

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderButtons HeaderButtonComponent={CustomHeaderButtton}>
          <Item
            title="search"
            iconName="create-outline"
            onPress={() => navigation.navigate("newChatScreen")}
          />
        </HeaderButtons>
      ),
    });
  }, []);

  useEffect(() => {
    if (selectedUserId || selectedUsers) {
      let chatData;
      if (selectedUserId) {
        chatData = chatsData.find(
          (c) => !c.isGroupChat && c.users.includes(selectedUserId)
        );
      }
      if (chatData) {
        navigation.navigate("chat screen", {
          chatId: chatData.key,
        });
      } else {
        const chatUsers = selectedUsers || [selectedUserId];
        if (!chatUsers.includes(userData.userId)) {
          chatUsers.push(userData.userId);
        }
        navigation.navigate("chat screen", {
          chatUsers: {
            users: chatUsers,
            chatName,
            isGroupChat: selectedUsers !== undefined,
          },
        });
      }
    }
  }, [route.params]);
  return (
    <PageContainer>
      <PageTitle text="Chats"></PageTitle>
      <TouchableOpacity
        style={styles.groupChatContainer}
        onPress={() =>
          navigation.navigate("newChatScreen", { isGroupChat: true })
        }
      >
        <Text style={styles.groupChat}>Group Chat</Text>
      </TouchableOpacity>
      <FlatList
        data={chatsData}
        renderItem={({ item }) => {
          let title;
          let image;
          if (item.isGroupChat) {
            title = item.chatName;
            image = item.chatImage;
          } else {
            const otherUser = item.users.find(
              (user) => user !== userData.userId
            );
            const otherUserData = storedUsers[otherUser];
            title = otherUserData?.fullName;
            image = otherUserData?.profilePicture;
          }
          return (
            <DataItem
              title={title}
              subTitle={item.lastTextMessage || "new chat"}
              image={image}
              onPress={() =>
                navigation.navigate("chat screen", { chatId: item.key })
              }
            ></DataItem>
          );
        }}
      ></FlatList>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  txt: {
    fontFamily: "Roboto-Black",
    fontSize: 30,
  },
  groupChatContainer: {
    marginBottom: 5,
  },
  groupChat: {
    color: colors.blue,
    fontSize: 17,
  },
});
