import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, Pressable, Alert, Image } from "react-native";
import { CheckBox } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import { db } from "../firebase.js";

export default function ViewItemsScreen() {
  const [listData, setListData] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = db.collection("items").onSnapshot((snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        key: doc.id,
        name: doc.data().name,
        completed: doc.data().completed,
        imageUrl: doc.data().imageUrl,
        location: doc.data().location,
      }));
      setListData(items);
    });

    return () => unsubscribe();
  }, []);

  const handleRemoveItem = async (key) => {
    try {
      await db.collection("items").doc(key).delete();
    } catch (error) {
      Alert.alert("Error", "Failed to delete the item from Firebase.");
    }
  };

  const handleToggleComplete = async (key, completed) => {
    try {
      await db.collection("items").doc(key).update({
        completed: !completed,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to update the item.");
    }
  };

  return (
    <View style={styles.container}>
      <Text>Here are your items</Text>
      <FlatList
        data={listData}
        renderItem={({ item }) => {
          const itemText = item.name.length > 25 ? item.name.substring(0, 25) + "..." : item.name;
          return (
            <View style={styles.listItem}>
              <CheckBox checked={item.completed} onPress={() => handleToggleComplete(item.key, item.completed)} checkedColor="green" />

              <Text style={[styles.itemText, item.completed && styles.completedItemText]}>{itemText}</Text>

              <Pressable onPress={() => navigation.navigate("Details", { item })} style={styles.detailsButton}>
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
    width: 350,
  },
  itemText: {
    fontSize: 18,
    marginHorizontal: 10,
  },
  completedItemText: {
    textDecorationLine: "line-through",
    color: "gray",
  },
  detailsButton: {
    backgroundColor: "blue",
    padding: 5,
    borderRadius: 3,
    marginHorizontal: 5,
  },
  detailsButtonText: {
    color: "#fff",
  },
  removeButton: {
    backgroundColor: "red",
    padding: 5,
    borderRadius: 3,
    marginHorizontal: 5,
  },
  removeButtonText: {
    color: "#fff",
  },
  downloadButton: {
    backgroundColor: "green",
    padding: 5,
    borderRadius: 3,
    marginHorizontal: 5,
  },
  downloadButtonText: {
    color: "#fff",
  },
});
