import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, Pressable, FlatList, Alert, Image } from "react-native";
import { db } from "../firebase.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Firebase storage functions
import { launchImageLibrary } from "react-native-image-picker"; // Image picker

export default function AddItemScreen() {
  const [text, setText] = useState("");
  const [listData, setListData] = useState([]);
  const [image, setImage] = useState(null); // Image object selected from device
  const [imageUri, setImageUri] = useState(null); // Image download URL after upload

  useEffect(() => {
    loadListData();
  }, []);

  // Function to load list data from Firestore
  async function loadListData() {
    try {
      const snapshot = await db.collection("items").get();
      const items = snapshot.docs.map((doc) => ({
        key: doc.id,
        name: doc.data().name,
        completed: doc.data().completed,
        imageUrl: doc.data().imageUrl, // Include image URL
      }));

      setListData(items);
    } catch (error) {
      Alert.alert("Error", "Failed to load the list from Firebase.");
      console.error(error);
    }
  }

  // Function to pick an image from the device
  const pickImage = async () => {
    let result = await launchImageLibrary({
      mediaType: "photo",
    });

    if (!result.didCancel) {
      const selectedImage = result.assets[0];
      setImage(selectedImage); // Store selected image in state
    }
  };

  // Function to upload the image to Firebase Storage and get the URL
  const uploadAndSubmit = async () => {
    if (!image) {
      Alert.alert("Validation", "Please select a photo.");
      return;
    }

    if (text.trim().length === 0) {
      Alert.alert("Validation", "Please enter an item name.");
      return;
    }

    try {
      // Upload image to Firebase Storage
      const storage = getStorage();
      const uniqueFileName = new Date().getTime() + "-" + image.fileName;
      const storageRef = ref(storage, `images/${uniqueFileName}`);

      // Convert image URI to a blob
      const response = await fetch(image.uri);
      const blob = await response.blob();

      // Upload image blob to Firebase Storage
      await uploadBytes(storageRef, blob);

      // Get the download URL of the uploaded image
      const downloadUrl = await getDownloadURL(storageRef);
      setImageUri(downloadUrl);

      // Add item to Firestore with image URL
      const newDocRef = await db.collection("items").add({
        name: text,
        completed: false,
        imageUrl: downloadUrl, // Save image URL in Firestore with the note
      });

      const newList = [...listData, { key: newDocRef.id, name: text, imageUrl: downloadUrl }];
      setListData(newList);

      // Clear input and image fields
      setText("");
      setImage(null);
      setImageUri(null);
    } catch (error) {
      Alert.alert("Error", "Failed to save the item to Firebase.");
      console.error(error);
    }
  };

  // Function to handle item removal
  async function handleRemoveItem(key) {
    try {
      await db.collection("items").doc(key).delete();

      const newList = listData.filter((item) => item.key !== key);
      setListData(newList);
    } catch (error) {
      Alert.alert("Error", "Failed to delete the item from Firebase.");
      console.error(error);
    }
  }

  return (
    <View style={styles.container}>
      <Text>Add a new item to your list</Text>
      <TextInput placeholder="Enter item name" onChangeText={(txt) => setText(txt)} value={text} style={styles.textinput} />

      <Pressable onPress={pickImage} style={styles.pressable}>
        <Text style={styles.pressableText}>Select Photo</Text>
      </Pressable>

      {image && <Image source={{ uri: image.uri }} style={{ width: 100, height: 100 }} />}

      <Pressable onPress={uploadAndSubmit} style={styles.pressable}>
        <Text style={styles.pressableText}>Submit Item</Text>
      </Pressable>

      <FlatList
        data={listData}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.itemText}>{item.name}</Text>
            {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={{ width: 50, height: 50 }} />}
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
    width: 150,
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
