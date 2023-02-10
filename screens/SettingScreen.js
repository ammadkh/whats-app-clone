import React, { useReducer, useState, useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import PageTitle from "../components/PageTitle";
import PageContainer from "../components/PageContainer";
import Input from "../components/Input";
import { FontAwesome, Feather } from "@expo/vector-icons";
import SubmitButton from "../components/SubmitButton";
import { validateInput } from "../utils/actions/Formaction";
import { formReducer } from "../utils/reducers/FormReducer";
import { ActivityIndicator, Alert } from "react-native";
import colors from "../constants/colors";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, updateUser } from "../utils/actions/authAction";
import { updateUserInformation } from "../store/authSlice";
import ProfileImage from "../components/ProfileImage";
import DataItem from "../components/DataItem";
// Import the functions you need from the SDKs you need

export default function SettingScreen(props) {
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);
  const [isLoading, setIsLoading] = useState("");
  const userData = useSelector((state) => state.auth.userData);
  const starredMessages = useSelector(
    (state) => state.messages.starredMessages
  );
  const firstName = userData.firstName;
  const lastName = userData.lastName;
  const email = userData.email;
  const about = userData.about;

  const sortedStarredMsgs = useMemo(() => {
    let result = [];
    const chats = Object.values(starredMessages);
    chats.forEach((chat) => {
      const chatMessage = Object.values(chat);
      result = result.concat(chatMessage);
    });
    return result;
  }, [starredMessages]);

  const initialState = {
    inputValues: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      about: userData.about,
    },
    inputValidities: {
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      about: undefined,
    },
    formValidity: false,
  };
  const [formState, dispatchFormState] = useReducer(formReducer, initialState);

  const onChange = () => {
    return (
      formState.inputValues.firstName != firstName ||
      formState.inputValues.lastName != lastName ||
      formState.inputValues.email != email ||
      formState.inputValues.about != about
    );
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
      await updateUser(userData.userId, formState.inputValues);
      dispatch(updateUserInformation({ newData: formState.inputValues }));
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
      }, 3000);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, formState]);
  return (
    <PageContainer>
      <PageTitle text="Settings"></PageTitle>
      <ScrollView contentContainerStyle={styles.formContainer}>
        <ProfileImage
          size={80}
          userId={userData?.userId}
          uri={userData?.profilePicture}
          showEditButton
        />
        <>
          <Input
            label="First Name"
            icon="user-o"
            id="firstName"
            iconPackage={FontAwesome}
            onInputChanged={onInputChanged}
            initialValue={userData.firstName}
            errorText={formState.inputValidities["firstName"]}
          />
          <Input
            label="Last Name"
            icon="user-o"
            id="lastName"
            iconPackage={FontAwesome}
            onInputChanged={onInputChanged}
            initialValue={userData.lastName}
            errorText={formState.inputValidities["lastName"]}
          />
          <Input
            label="Email"
            icon="mail"
            id="email"
            keyboardType="email-address"
            iconPackage={Feather}
            autoCapitalize="none"
            initialValue={userData.email}
            onInputChanged={onInputChanged}
            errorText={formState.inputValidities["email"]}
          />
          <Input
            label="About"
            icon="user-o"
            id="about"
            iconPackage={FontAwesome}
            onInputChanged={onInputChanged}
            errorText={formState.inputValidities["about"]}
          />
          <DataItem
            title="Starred Messages"
            hideImage={true}
            type="link"
            onPress={() =>
              props.navigation.navigate("dataList", {
                title: "Starred Messages",
                data: sortedStarredMsgs,
                type: "messages",
              })
            }
          ></DataItem>
          <View style={{ marginTop: 20 }}>
            {successMsg && <Text>Saved!</Text>}
            {isLoading ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{ marginTop: 10 }}
              ></ActivityIndicator>
            ) : (
              <>
                {onChange() && (
                  <SubmitButton
                    disable={!formState.formValidity}
                    onPress={saveHandler}
                    style={{ marginTop: 10 }}
                    title="Save"
                  />
                )}
              </>
            )}
            <SubmitButton
              color={"red"}
              onPress={() => dispatch(logoutUser(userData))}
              style={{ marginTop: 10 }}
              title="Logout"
            />
          </View>
        </>
      </ScrollView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    alignItems: "center",
  },
});
