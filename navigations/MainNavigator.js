import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChatListScreen from "../screens/ChatListScreen";
import SettingScreen from "../screens/SettingScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import ChatScreen from "../screens/ChatScreen";
import NewChatScreen from "../screens/NewChatScreen";
import { useDispatch, useSelector } from "react-redux";
import { getFirebaseApp } from "../utils/firebaseHelper";
import { get, getDatabase, off, onValue, ref } from "firebase/database";
import { setChatData } from "../store/chatSlice";
import { ActivityIndicator, View } from "react-native";
import colors from "../constants/colors";
import { commonStyles } from "../constants/commonStyles";
import { setStoredUsers } from "../store/userSlice";
import { setMessagesData, setStarredMessage } from "../store/messageSlice";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{ headerTitle: "", headerShadowVisible: false }}
  >
    <Tab.Screen
      name="ChatListScreen"
      component={ChatListScreen}
      options={{
        tabBarLabel: "Chats",
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="chatbubble-outline" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingScreen}
      options={{
        tabBarLabel: "Setting",
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="settings" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Group>
        <Stack.Screen
          name="Home"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="chat screen"
          component={ChatScreen}
          options={{ headerShown: true }}
        />
        <Stack.Screen name="Setting" component={SettingScreen} />
      </Stack.Group>
      <Stack.Group screenOptions={{ presentation: "containedModal" }}>
        <Stack.Screen
          name="newChatScreen"
          component={NewChatScreen}
          options={{ headerShown: true }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default function MainNavigator() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const userId = useSelector((state) => state.auth.userData.userId);
  const storedUsers = useSelector((state) => state.users.storedUsers);
  useEffect(() => {
    const app = getFirebaseApp();
    const db = getDatabase(app);
    const userChatRef = ref(db, `userChat/${userId}`);
    const refs = [userChatRef];
    let chatFountCount = 0;
    onValue(userChatRef, (querySnapshot) => {
      const chatIdsData = querySnapshot.val() || {};
      const chatIds = Object.values(chatIdsData);
      const chatsData = {};
      for (let i = 0; i < chatIds.length; i++) {
        const chatId = chatIds[i];
        const chatDataRef = ref(db, `chats/${chatId}`);
        refs.push(chatDataRef);
        onValue(chatDataRef, async (chatSnapshot) => {
          chatFountCount++;
          const data = chatSnapshot.val();
          if (data) {
            data.key = chatSnapshot.key;
            chatsData[chatSnapshot.key] = data;
            const users = data.users;
            for (let i = 0; i < users.length; i++) {
              const user = users[i];
              if (!storedUsers[user]) {
                try {
                  const userNewData = await get(ref(db, `users/${user}`));
                  const userDataVal = userNewData.val();
                  dispatch(
                    setStoredUsers({
                      newUser: { [userDataVal.userId]: userDataVal },
                    })
                  );
                } catch (error) {
                  console.log("user error", error);
                }
              }
            }
          }
          if (chatFountCount >= chatIds.length) {
            dispatch(setChatData({ chatsData }));
            setIsLoading(false);
          }

          const messageRef = ref(db, `messages/${chatId}`);
          // const messageData = await get(messageRef);
          onValue(messageRef, (messageSnapshot) => {
            const messagesData = messageSnapshot.val();
            dispatch(setMessagesData({ chatId, messagesData }));
          });
        });
      }
      if (chatFountCount === 0) {
        setIsLoading(false);
      }
    });

    const starredMessageRef = ref(db, `userStarMessages/${userId}`);
    refs.push(starredMessageRef);
    onValue(starredMessageRef, (querySnapshot) => {
      const starredMessages = querySnapshot.val() ?? {};
      dispatch(setStarredMessage({ starredMessages }));
    });
    return () => {
      refs.forEach((ref) => off(ref));
    };
  }, []);
  if (isLoading) {
    return (
      <View style={{ ...commonStyles.center, flex: 1 }}>
        <ActivityIndicator
          size={"large"}
          color={colors.primary}
        ></ActivityIndicator>
      </View>
    );
  }
  return <StackNavigator></StackNavigator>;
}
