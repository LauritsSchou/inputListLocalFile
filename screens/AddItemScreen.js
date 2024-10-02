import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, Pressable, FlatList, Alert, Image } from "react-native";
import { db } from "../firebase.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";

export default function AddItemScreen() {
  const [text, setText] = useState("");
  const [listData, setListData] = useState([]);
  const [imageUri, setImageUri] = useState(null); // For storing selected image URI

  useEffect(() => {
    loadListData();
  }, []);

  useEffect(() => {
    // Request permissions for camera and media library
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Sorry, we need media library permissions to make this work!");
      }
    })();
  }, []);

  async function loadListData() {
    try {
      const snapshot = await db.collection("items").get();
      const items = snapshot.docs.map((doc) => ({
        key: doc.id,
        name: doc.data().name,
        completed: doc.data().completed,
        imageUrl: doc.data().imageUrl,
      }));

      setListData(items);
    } catch (error) {
      Alert.alert("Error", "Failed to load the list from Firebase.");
      console.error(error);
    }
  }

  // Function to pick an image from the device or take a new photo
  const pickImage = async (source) => {
    let result;
    if (source === "camera") {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
    }

    console.log(result); // Log the entire result object

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Set image URI from assets[0].uri
      setImageUri(result.assets[0].uri);
    } else {
      Alert.alert("Error", "No image selected.");
    }
  };

  const uploadAndSubmit = async () => {
    if (!imageUri) {
      Alert.alert("Validation", "Please select a photo.");
      return;
    }

    if (text.trim().length === 0) {
      Alert.alert("Validation", "Please enter an item name.");
      return;
    }

    try {
      const storage = getStorage();
      const uniqueFileName = new Date().getTime() + "-image";
      const storageRef = ref(storage, `images/${uniqueFileName}`);

      // Fetch the image and convert it into a blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Upload the image blob to Firebase Storage
      await uploadBytes(storageRef, blob);

      // Get the download URL of the uploaded image
      const downloadUrl = await getDownloadURL(storageRef);

      // Add the item to Firestore with the image URL
      const newDocRef = await db.collection("items").add({
        name: text,
        completed: false,
        imageUrl: downloadUrl,
      });

      const newList = [...listData, { key: newDocRef.id, name: text, imageUrl: downloadUrl }];
      setListData(newList);

      // Clear input fields
      setText("");
      setImageUri(null);
    } catch (error) {
      Alert.alert("Error", "Failed to save the item to Firebase.");
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Add a new item to your list</Text>
      <TextInput placeholder="Enter item name" onChangeText={(txt) => setText(txt)} value={text} style={styles.textinput} />

      <Pressable onPress={() => pickImage("library")} style={styles.pressable}>
        <Text style={styles.pressableText}>Select Photo</Text>
      </Pressable>

      <Pressable onPress={() => pickImage("camera")} style={styles.pressable}>
        <Text style={styles.pressableText}>Take Photo</Text>
      </Pressable>

      {/* Show the selected image */}
      {imageUri && <Image source={{ uri: imageUri }} style={{ width: 100, height: 100 }} />}

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
