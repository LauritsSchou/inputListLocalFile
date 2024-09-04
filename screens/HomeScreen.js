// screens/HomeScreen.js
import React from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text>Welcome to the bucket list app</Text>
      <Button title="Add Item" onPress={() => navigation.navigate("AddItem")} />
      <Button title="View Items" onPress={() => navigation.navigate("ViewItems")} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
