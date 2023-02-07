import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import userImage from "../assets/images/userImage.jpeg";
import colors from "../constants/colors";
import { FontAwesome } from "@expo/vector-icons";
import {
  launchImagePicker,
  uploadImageAsync,
} from "../utils/ImagePickerHelper";
import { updateUser } from "../utils/actions/authAction";
import { useDispatch } from "react-redux";
import { updateUserInformation } from "../store/authSlice";
import { commonStyles } from "../constants/commonStyles";
import { updateChatData } from "../utils/actions/chatAction";

export default function ProfileImage(props) {
  const source = props.uri ? { uri: props.uri } : userImage;
  const showEditButton = props.showEditButton;
  const showCancelButton = props.showCancelButton;
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState(source);
  const dispatch = useDispatch();

  const chatId = props.chatId;

  useEffect(() => {
    setImage(props.uri ? { uri: props.uri } : userImage);
  }, [props.uri]);
  const imageHandler = async () => {
    try {
      const tempUri = await launchImagePicker();
      if (!tempUri) return;
      setImage({ uri: tempUri });
      setIsLoading(true);
      const uploadedImg = await uploadImageAsync(tempUri, chatId != undefined);
      setIsLoading(false);
      if (chatId) {
        await updateChatData(chatId, props.userId, { chatImage: uploadedImg });
      } else {
        await updateUser(props.userId, { profilePicture: uploadedImg });
        dispatch(
          updateUserInformation({ newData: { profilePicture: uploadedImg } })
        );
      }

      setImage({ uri: uploadedImg });
    } catch (error) {
      console.log(error, "we");
      setIsLoading(false);
    }
  };
  const Contianer = props.onPress || showEditButton ? TouchableOpacity : View;

  return (
    <Contianer onPress={props.onPress || imageHandler} style={props.style}>
      {isLoading ? (
        <View
          width={props.size}
          height={props.size}
          style={{
            ...commonStyles.center,
          }}
        >
          <ActivityIndicator
            size={"small"}
            color={colors.primary}
          ></ActivityIndicator>
        </View>
      ) : (
        <>
          <Image
            source={image}
            style={{ ...styles.image, width: props.size, height: props.size }}
          ></Image>
          {showEditButton && (
            <View style={styles.iconContainer}>
              <FontAwesome name="pencil" size={16} color="black" />
            </View>
          )}
          {showCancelButton && (
            <View style={styles.closeContainer}>
              <FontAwesome name="close" size={12} color="black" />
            </View>
          )}
        </>
      )}
    </Contianer>
  );
}

const styles = StyleSheet.create({
  image: {
    borderColor: colors.grey,
    borderWidth: 1,
    borderRadius: 50,
  },
  iconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.lightGray,
    padding: 8,
    borderRadius: 20,
  },
  closeContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.lightGray,
    padding: 4,
    borderRadius: 50,
  },
});
