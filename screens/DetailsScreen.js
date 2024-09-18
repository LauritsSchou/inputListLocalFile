import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, Button, Alert } from "react-native";
import { db } from "../firebase.js";

export default function DetailsScreen({ route, navigation }) {
  const { item } = route.params;
  const [itemText, setItemText] = useState(item.name);

  const handleSave = async () => {
    if (itemText.trim().length === 0) {
      Alert.alert("Error", "Item text cannot be empty.");
      return;
    }

    try {
      await db.collection("items").doc(item.key).update({
        name: itemText,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to update the item.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Item</Text>
      <TextInput style={styles.input} value={itemText} onChangeText={setItemText} placeholder="Enter item text" />
      <Text style={styles.itemStatus}>Completed: {item.completed ? "Yes" : "No"}</Text>
      <Button title="Save" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
    width: "100%",
  },
  itemStatus: {
    fontSize: 16,
    color: "gray",
    marginBottom: 20,
  },
});
