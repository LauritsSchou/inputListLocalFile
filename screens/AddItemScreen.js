import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, Pressable, FlatList, Alert } from "react-native";
import { db } from "../firebase.js";

export default function AddItemScreen() {
  const [text, setText] = useState("");
  const [listData, setListData] = useState([]);

  useEffect(() => {
    loadListData();
  }, []);

  async function loadListData() {
    try {
      const snapshot = await db.collection("items").get();
      const items = snapshot.docs.map((doc) => ({
        key: doc.id,
        name: doc.data().name,
        completed: doc.data().completed,
      }));

      setListData(items);
      saveListData(items);
    } catch (error) {
      Alert.alert("Error", "Failed to load the list from Firebase.");
      console.error(error);
    }
  }

  async function saveListData(newList) {
    try {
      await AsyncStorage.setItem("listData", JSON.stringify(newList));
    } catch (error) {
      Alert.alert("Error", "Failed to save the list to storage.");
      console.error(error);
    }
  }

  async function handleSubmit() {
    if (text.trim().length > 0) {
      try {
        const newDocRef = await db.collection("items").add({
          name: text,
          completed: false,
        });

        const newList = [...listData, { key: newDocRef.id, name: text }];
        setListData(newList);
        saveListData(newList);

        setText("");
      } catch (error) {
        Alert.alert("Error", "Failed to save the item to Firebase.");
        console.error(error);
      }
    } else {
      Alert.alert("Validation", "Please enter an item name.");
    }
  }

  async function handleRemoveItem(key) {
    try {
      await db.collection("items").doc(key).delete();

      const newList = listData.filter((item) => item.key !== key);
      setListData(newList);
      saveListData(newList);
    } catch (error) {
      Alert.alert("Error", "Failed to delete the item from Firebase.");
      console.error(error);
    }
  }

  return (
    <View style={styles.container}>
      <Text>Add a new item to your list</Text>
      <TextInput placeholder="Enter item name" onChangeText={(txt) => setText(txt)} value={text} style={styles.textinput} />
      <Pressable onPress={handleSubmit} style={styles.pressable}>
        <Text style={styles.pressableText}>Submit</Text>
      </Pressable>
      <FlatList
        data={listData}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.itemText}>{item.name}</Text>
            <Pressable onPress={() => handleRemoveItem(item.key)} style={styles.removeButton}>
              <Text style={styles.removeButtonText}>Remove</Text>
            </Pressable>
          </View>
        )}
        keyExtractor={(item) => item.key}
      />
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
  pressable: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    margin: 10,
    width: 100,
    alignItems: "center",
  },
  pressableText: {
    color: "#fff",
    fontSize: 16,
  },
  textinput: {
    borderColor: "black",
    borderWidth: 1,
    padding: 10,
    margin: 10,
    width: 200,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    width: 300,
  },
  itemText: {
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: "red",
    padding: 5,
    borderRadius: 3,
  },
  removeButtonText: {
    color: "#fff",
  },
});
