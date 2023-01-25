import React from "react";
import { Text, View, StyleSheet, Button } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

export default function ChatListScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text>ChatListScreen</Text>
        <Button
          title="on navigate"
          onPress={() => navigation.navigate("chat screen")}
        ></Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "red",
    alignItems: "center",
    justifyContent: "center",
  },
  txt: {
    fontFamily: "Roboto-Black",
    fontSize: 30,
  },
});
