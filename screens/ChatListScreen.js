import React, { useEffect } from "react";
import { Text, View, StyleSheet, Button, FlatList } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useSelector } from "react-redux";
import CustomHeaderButtton from "../components/CustomHeaderButtton";
import DataItem from "../components/DataItem";
import PageContainer from "../components/PageContainer";
import PageTitle from "../components/PageTitle";

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
    if (!selectedUserId) return;
    const chatUsers = [selectedUserId, userData.userId];
    navigation.navigate("chat screen", { chatUsers: { users: chatUsers } });
  }, [route.params]);
  return (
    <PageContainer>
      <PageTitle text="Chats"></PageTitle>
      <FlatList
        data={chatsData}
        renderItem={({ item }) => {
          const otherUser = item.users.find((user) => user !== userData.userId);
          const otherUserData = storedUsers[otherUser];

          return (
            <DataItem
              title={otherUserData?.fullName}
              subTitle={item.lastTextMessage || "new chat"}
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
});
