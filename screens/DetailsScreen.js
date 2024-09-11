import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, Button, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DetailsScreen({ route, navigation }) {
  const { item, updateItem } = route.params;
  const [itemText, setItemText] = useState(item.name);

  const handleSave = async () => {
    if (itemText.trim().length === 0) {
      Alert.alert("Error", "Item text cannot be empty.");
      return;
    }

    const updatedItem = { ...item, name: itemText };

    try {
      const savedList = await AsyncStorage.getItem("listData");
      const listData = savedList ? JSON.parse(savedList) : [];

      const updatedList = listData.map((listItem) => {
        if (listItem.key === item.key) {
          return updatedItem;
        }
        return listItem;
      });

      await AsyncStorage.setItem("listData", JSON.stringify(updatedList));

      updateItem(updatedItem);

      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to save the changes.");
      console.error(error);
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
