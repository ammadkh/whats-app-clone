import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  TextInput,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
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

export default function NewChatScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState();
  const [noResultFound, setNoResultFound] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const userData = useSelector((state) => state.auth.userData);

  const dispatch = useDispatch();
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderButtons HeaderButtonComponent={CustomHeaderButtton}>
          <Item title="close" onPress={() => navigation.goBack()} />
        </HeaderButtons>
      ),
    });
  }, []);

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
    navigation.navigate("ChatListScreen", { selectedUserId });
  };

  return (
    <PageContainer>
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
            return (
              <DataItem
                onPress={() => onSelectUser(userData.userId)}
                title={userData.firstName + " " + userData.lastName}
                subTitle={userData.about}
                image={userData.profilePicture}
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
});
