import React, { useReducer, useCallback, useState, useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import Input from "../components/Input";
import PageContainer from "../components/PageContainer";
import PageTitle from "../components/PageTitle";
import ProfileImage from "../components/ProfileImage";
import SubmitButton from "../components/SubmitButton";
import colors from "../constants/colors";
import {
  addUsersToChat,
  removeUserFromChat,
  updateChatData,
} from "../utils/actions/chatAction";
import { validateInput } from "../utils/actions/Formaction";
import { formReducer } from "../utils/reducers/FormReducer";
import DataItem from "../components/DataItem";

export default function ChatSetting(props) {
  const chatId = props.route.params.chatId;
  const chatData = useSelector((state) => state.chat.chatsData[chatId] || {});
  const storedUsers = useSelector((state) => state.users.storedUsers);
  const userData = useSelector((state) => state.auth.userData);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const storedStarredMessages = useSelector(
    (state) => state.messages.starredMessages[chatId]
  );

  const selectedUsers = props.route.params && props.route.params.selectedUsers;
  useEffect(() => {
    if (!selectedUsers) return;
    const selectedUserData = [];
    selectedUsers.forEach((uid) => {
      if (!storedUsers[uid]) {
        console.log("no user data found");
        return;
      }
      const userData = storedUsers[uid];
      selectedUserData.push(userData);
    });

    addUsersToChat(userData, selectedUserData, chatData);
  }, [selectedUsers]);

  const initialState = {
    inputValues: {
      chatName: chatData.chatName,
    },
    inputValidities: {
      chatName: undefined,
    },
    formValidity: false,
  };
  const [formState, dispatchFormState] = useReducer(formReducer, initialState);

  const onChange = () => {
    return formState.inputValues.chatName != chatData.chatName;
  };

  const onInputChanged = useCallback(
    (id, value) => {
      const result = validateInput(id, value);
      dispatchFormState({ id, validationResult: result, inputValue: value });
    },
    [dispatchFormState]
  );

  const saveHandler = useCallback(async () => {
    try {
      setIsLoading(true);
      await updateChatData(chatId, userData.userId, formState.inputValues);
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
      }, 3000);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [formState]);

  const leaveChat = useCallback(async () => {
    try {
      setIsLoading(true);
      await removeUserFromChat(userData, userData, chatData);
      props.navigation.popToTop();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, props.navigation]);

  if (!chatData.users) {
    return;
  }

  return (
    <PageContainer>
      <PageTitle text="Chat Setting"></PageTitle>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <ProfileImage
          size={80}
          showEditButton={true}
          chatId={chatId}
          userId={userData.userId}
          uri={chatData.chatImage}
        ></ProfileImage>
        <Text>{chatData.chatName}</Text>
        <Input
          id="chatName"
          label="Chat Name"
          initialValue={chatData.chatName}
          onInputChanged={onInputChanged}
          errorText={formState.inputValidities["chatName"]}
        />
        <View style={styles.sectionContainer}>
          <Text style={styles.heading}>
            {chatData.users.length} participants{" "}
          </Text>
          <DataItem
            title="Add users"
            icon="plus"
            type="button"
            onPress={() =>
              props.navigation.navigate("newChatScreen", {
                isGroupChat: true,
                existingUsers: chatData.users,
                chatId,
              })
            }
          />
          {chatData.users.slice(0, 4).map((userId) => {
            const currentUser = storedUsers[userId];
            return (
              <DataItem
                image={currentUser.profilePicture}
                key={userId}
                title={currentUser.fullName}
                subTitle={currentUser.about}
                type={userId !== userData.userId && "link"}
                onPress={() =>
                  userId !== userData.userId &&
                  props.navigation.navigate("ContactScreen", {
                    uid: userId,
                    chatId,
                  })
                }
              />
            );
          })}
          {chatData.users.length > 4 && (
            <DataItem
              title="View More"
              hideImage={true}
              type="link"
              onPress={() =>
                props.navigation.navigate("dataList", {
                  title: "Participants",
                  data: chatData.users,
                  type: "users",
                  chatId,
                })
              }
            ></DataItem>
          )}
        </View>
        {successMsg && <Text>Saved!</Text>}
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          onChange() && (
            <SubmitButton
              color={colors.primary}
              disable={!formState.formValidity}
              title="Save Changes"
              onPress={saveHandler}
            ></SubmitButton>
          )
        )}
        <DataItem
          title="Starred Messages"
          hideImage={true}
          type="link"
          onPress={() =>
            props.navigation.navigate("dataList", {
              title: "Starred Messages",
              data: Object.values(storedStarredMessages),
              type: "messages",
            })
          }
        ></DataItem>
      </ScrollView>
      <SubmitButton
        color="red"
        title="Leave Chat"
        onPress={leaveChat}
        style={{ marginBottom: 20 }}
      ></SubmitButton>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    alignItems: "center",
    justifyContent: "center",
  },
  sectionContainer: {
    width: "100%",
    marginVertical: 10,
  },
  heading: {
    fontWeight: "600",
    marginVertical: 8,
  },
});
