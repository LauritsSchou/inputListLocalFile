import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, Pressable, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CheckBox } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";

export default function ViewItemsScreen() {
  const [listData, setListData] = useState([]);
  const navigation = useNavigation();

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

  function handleRemoveItem(key) {
    const newList = listData.filter((item) => item.key !== key);
    setListData(newList);
    saveListData(newList);
  }

  function handleToggleComplete(key) {
    const newList = listData.map((item) => {
      if (item.key === key) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });
    setListData(newList);
    saveListData(newList);
  }

  function updateItem(updatedItem) {
    const newList = listData.map((item) => (item.key === updatedItem.key ? updatedItem : item));
    setListData(newList);
    saveListData(newList);
  }

  return (
    <View style={styles.container}>
      <Text>Here are your items</Text>
      <FlatList
        data={listData}
        renderItem={({ item }) => {
          const itemText = item.name.length > 25 ? item.name.substring(0, 25) + "..." : item.name;
          return (
            <View style={styles.listItem}>
              <CheckBox checked={item.completed} onPress={() => handleToggleComplete(item.key)} checkedColor="green" />
              <Text style={[styles.itemText, item.completed && styles.completedItemText]}>{itemText}</Text>
              <Pressable onPress={() => navigation.navigate("Details", { item, updateItem })} style={styles.detailsButton}>
                <Text style={styles.detailsButtonText}>Details</Text>
              </Pressable>
              <Pressable onPress={() => handleRemoveItem(item.key)} style={styles.removeButton}>
                <Text style={styles.removeButtonText}>Remove</Text>
              </Pressable>
            </View>
          );
        }}
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
    fontSize: 18,
  },
  completedItemText: {
    textDecorationLine: "line-through",
    color: "gray",
  },
  detailsButton: {
    backgroundColor: "blue",
    padding: 5,
    borderRadius: 3,
  },
  detailsButtonText: {
    color: "#fff",
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
