// screens/ViewItemsScreen.js
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ViewItemsScreen() {
  return (
    <View style={styles.container}>
      <Text>Here are your items</Text>
      {/* Display the list of items here */}
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
