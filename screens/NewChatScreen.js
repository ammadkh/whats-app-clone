import React, { useEffect, useState, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  TextInput,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import CustomHeaderButtton from "../components/CustomHeaderButtton";
import { FontAwesome } from "@expo/vector-icons";
import colors from "../constants/colors";
import PageContainer from "../components/PageContainer";
import { commonStyles } from "../constants/commonStyles";
import { searchUser } from "../utils/actions/userActions";
import DataItem from "../components/DataItem";
import { useDispatch, useSelector } from "react-redux";
import { setStoredUsers } from "../store/userSlice";
import ProfileImage from "../components/ProfileImage";

export default function NewChatScreen({ navigation, route }) {
  const { existingUsers } = route.params || {};
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState();
  const [noResultFound, setNoResultFound] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [chatName, setChatName] = useState("");
  const [selectedUsers, setSlectedUsers] = useState([]);
  const userData = useSelector((state) => state.auth.userData);
  const storedUsers = useSelector((state) => state.users.storedUsers);
  const selectedUserFlatList = useRef();

  const isGroupChat = route.params && route.params.isGroupChat;
  const chatId = route.params && route.params.chatId;
  const isNewChat = !chatId;

  const dispatch = useDispatch();
  const isGroupBtnDisable =
    selectedUsers.length === 0 || (isNewChat && !chatName);
  useEffect(() => {
    const btn = isNewChat ? "Create" : "Add";
    const screen = isNewChat ? "ChatListScreen" : "chatSetting";
    navigation.setOptions({
      headerTitle: isGroupChat ? "Add Participants" : "New Chat",
      headerLeft: () => (
        <HeaderButtons HeaderButtonComponent={CustomHeaderButtton}>
          <Item title="close" onPress={() => navigation.goBack()} />
        </HeaderButtons>
      ),
      headerRight: () => (
        <HeaderButtons HeaderButtonComponent={CustomHeaderButtton}>
          {isGroupChat && (
            <Item
              title={btn}
              onPress={() => {
                navigation.navigate(screen, {
                  selectedUsers,
                  chatName,
                  chatId,
                });
              }}
              disabled={isGroupBtnDisable}
              color={isGroupBtnDisable ? colors.grey : colors.blue}
            />
          )}
        </HeaderButtons>
      ),
    });
  }, [chatName, selectedUsers]);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (!searchTerm) {
        setUsers();
        setNoResultFound(false);
        return;
      }
      setIsLoading(true);
      const searchedUsers = await searchUser(searchTerm);
      delete searchedUsers[userData.userId];
      setUsers(searchedUsers);
      if (Object.keys(searchedUsers).length === 0) {
        setNoResultFound(true);
      } else {
        setNoResultFound(false);
        dispatch(setStoredUsers({ newUser: searchedUsers }));
      }
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const onSelectUser = (selectedUserId) => {
    if (isGroupChat) {
      const newSelectedUsers = selectedUsers.includes(selectedUserId)
        ? selectedUsers.filter((user) => user != selectedUserId)
        : selectedUsers.concat(selectedUserId);
      setSlectedUsers(newSelectedUsers);
    } else {
      navigation.navigate("ChatListScreen", { selectedUserId });
    }
  };

  return (
    <PageContainer>
      {isGroupChat && (
        <View style={styles.chatNameContainer}>
          <>
            {isNewChat && (
              <View style={styles.inputContainer}>
                <TextInput
                  value={chatName}
                  onChangeText={(text) => setChatName(text)}
                  style={styles.textBox}
                  placeholder="Enter a name for your chat"
                  autoCorrect={false}
                  autoComplete={false}
                />
              </View>
            )}
            {!!selectedUsers.length && (
              <View style={styles.selectedUserContainer}>
                <FlatList
                  ref={(ref) => (selectedUserFlatList.current = ref)}
                  style={styles.selectedUserList}
                  data={selectedUsers}
                  horizontal={true}
                  onContentSizeChange={() =>
                    selectedUserFlatList.current.scrollToEnd()
                  }
                  contentContainerStyle={{ alignItems: "center" }}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => {
                    const user = storedUsers[item];
                    return (
                      <View style={styles.selectedUserStyle}>
                        <ProfileImage
                          size={40}
                          uri={user?.profilePicture}
                          onPress={() => onSelectUser(item)}
                          showCancelButton={true}
                        ></ProfileImage>
                      </View>
                    );
                  }}
                ></FlatList>
              </View>
            )}
          </>
        </View>
      )}
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={15} color={colors.lightGray} />
        <TextInput
          style={styles.searchBox}
          placeholder="Search"
          onChangeText={(text) => setSearchTerm(text)}
        />
      </View>
      {isLoading && (
        <View style={{ ...commonStyles.center, flex: 1 }}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          ></ActivityIndicator>
        </View>
      )}
      {!isLoading && !noResultFound && users && (
        <FlatList
          data={Object.keys(users)}
          renderItem={(user) => {
            const userData = users[user.item];
            if (existingUsers && existingUsers.includes(user.item)) {
              return;
            }
            return (
              <DataItem
                onPress={() => onSelectUser(userData.userId)}
                title={userData.firstName + " " + userData.lastName}
                subTitle={userData.about}
                image={userData.profilePicture}
                type={isGroupChat ? "checkbox" : ""}
                isChecked={selectedUsers.includes(userData.userId)}
              />
            );
          }}
        ></FlatList>
      )}
      {!isLoading && noResultFound && (
        <View style={{ ...commonStyles.center, flex: 1 }}>
          <FontAwesome
            name="question"
            size={55}
            color={colors.lightGray}
            style={styles.noResultIcon}
          />
          <Text style={styles.noResultText}>No User Found</Text>
        </View>
      )}
      {!isLoading && !users && (
        <View style={{ ...commonStyles.center, flex: 1 }}>
          <FontAwesome
            name="users"
            size={55}
            color={colors.lightGray}
            style={styles.noResultIcon}
          />
          <Text style={styles.noResultText}>
            Enter a name to search for a user
          </Text>
        </View>
      )}
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    backgroundColor: colors.extraLightGray,
    alignItems: "center",
    marginVertical: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    height: 30,
  },
  searchBox: {
    fontSize: 15,
    flex: 1,
    marginLeft: 8,
  },
  noResultIcon: {
    marginBottom: 10,
  },
  noResultText: {
    color: colors.textColor,
  },
  chatNameContainer: {
    paddingVertical: 10,
  },
  inputContainer: {
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: colors.nearlyWhite,
    borderRadius: 2,
    flexDirection: "row",
  },
  textBox: {
    color: colors.textColor,
    width: "100%",
  },
  selectedUserContainer: {
    height: 50,
    justifyContent: "center",
  },
  selectedUserList: {
    paddingTop: 10,
    height: "100%",
  },
  selectedUserStyle: {
    marginRight: 10,
  },
});
