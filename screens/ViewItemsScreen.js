import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ViewItemsScreen() {
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

  return (
    <View style={styles.container}>
      <Text>Here are your items</Text>
      <FlatList data={listData} renderItem={(data) => <Text style={styles.itemText}>{data.item.name}</Text>} keyExtractor={(item) => item.key} />
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
  itemText: {
    fontSize: 18,
    padding: 10,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
});
