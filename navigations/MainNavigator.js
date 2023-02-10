import React, { useEffect, useState, useRef } from "react";
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
import ContactScreen from "../screens/ContactScreen";
import ChatSetting from "../screens/ChatSetting";
import DataListScreen from "../screens/DataListScreen";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { StackActions, useNavigation } from "@react-navigation/native";
import { createNavigationContainerRef } from "@react-navigation/native";
import * as RootNavigation from "./RootNavigation.js";

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
        <Stack.Screen
          name="chatSetting"
          component={ChatSetting}
          options={{ headerTitle: "", headerShadowVisible: false }}
        />
        <Stack.Screen
          name="dataList"
          component={DataListScreen}
          options={{ headerTitle: "", headerShadowVisible: false }}
        />
      </Stack.Group>
      <Stack.Group screenOptions={{ presentation: "containedModal" }}>
        <Stack.Screen
          name="newChatScreen"
          component={NewChatScreen}
          options={{ headerShown: true }}
        />
      </Stack.Group>
      <Stack.Group>
        <Stack.Screen
          name="ContactScreen"
          component={ContactScreen}
          options={{ headerShown: true }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default function MainNavigator() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const userId = useSelector((state) => state.auth.userData.userId);
  const storedUsers = useSelector((state) => state.users.storedUsers);

  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
      console.log("toke", token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        // handle received notification
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const { chatId } =
          response.notification.request.content.data || undefined;
        if (chatId) {
          const pushAction = StackActions.push("chat screen", { chatId });
          navigation.dispatch(pushAction);
        } else {
          console.log("no chat id sent with notification");
        }
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

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
            if (!data.users.includes(userId)) {
              return;
            }
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

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}
