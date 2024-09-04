import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, Pressable, FlatList, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddItemScreen() {
  const [text, setText] = useState("");
  const [listData, setListData] = useState([]);

  useEffect(() => {
    loadListData();
  }, []);

  async function loadListData() {
    try {
      const savedList = await AsyncStorage.getItem("listData");
      if (savedList !== null) {
        setListData(JSON.parse(savedList));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load the list from storage.");
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

  function handleSubmit() {
    if (text.trim().length > 0) {
      const newList = [...listData, { key: listData.length.toString(), name: text }];
      setListData(newList);
      saveListData(newList);
      setText("");
    } else {
      Alert.alert("Validation", "Please enter an item name.");
    }
  }

  return (
    <View style={styles.container}>
      <Text>Add a new item to your list</Text>
      <TextInput placeholder="Enter item name" onChangeText={(txt) => setText(txt)} value={text} style={styles.textinput} />
      <Pressable onPress={handleSubmit} style={styles.pressable}>
        <Text style={styles.pressableText}>Submit</Text>
      </Pressable>
      <FlatList data={listData} renderItem={(data) => <Text>{data.item.name}</Text>} keyExtractor={(item) => item.key} />
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
});
