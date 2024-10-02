import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, Alert, Image, Pressable } from "react-native";
import { db } from "../firebase.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker"; // Expo image picker

export default function DetailsScreen({ route, navigation }) {
  const { item } = route.params;
  const [itemText, setItemText] = useState(item.name);
  const [image, setImage] = useState(null); // Selected new image
  const [imageUri, setImageUri] = useState(item.imageUrl); // Current image URL

  // Function to request camera and media library permissions
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cameraStatus !== "granted" || mediaLibraryStatus !== "granted") {
      Alert.alert("Error", "Permission to access camera and media library is required.");
    }
  };

  // Function to pick an image from the gallery or open the camera
  const pickImage = async (source) => {
    await requestPermissions();

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

    if (!result.canceled) {
      setImage(result.assets[0]); // Set selected or taken image in state
    }
  };

  // Function to upload the image to Firebase Storage and get the URL
  const uploadImage = async () => {
    if (!image) return imageUri; // If no new image selected, return existing image URL

    const storage = getStorage();
    const uniqueFilename = `${Date.now()}_${image.fileName || "image"}`;
    const storageRef = ref(storage, `images/${uniqueFilename}`);

    // Convert image URI to a blob
    const response = await fetch(image.uri);
    const blob = await response.blob();

    // Upload image blob to Firebase Storage
    await uploadBytes(storageRef, blob);

    // Get the download URL of the uploaded image
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl; // Return the new image URL
  };

  const handleSave = async () => {
    if (itemText.trim().length === 0) {
      Alert.alert("Error", "Item text cannot be empty.");
      return;
    }

    try {
      // Upload the new image if one was selected and get the URL
      const newImageUri = await uploadImage();

      // Update the item in Firestore with the new name and image URL
      await db.collection("items").doc(item.key).update({
        name: itemText,
        imageUrl: newImageUri,
      });

      // Navigate back to the previous screen after saving
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to update the item.");
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Item</Text>

      {/* Item Text Input */}
      <TextInput style={styles.input} value={itemText} onChangeText={setItemText} placeholder="Enter item text" />

      {/* Display Current Image (if available) */}
      {imageUri && <Image source={{ uri: imageUri }} style={{ width: 200, height: 200, marginBottom: 20 }} />}

      {/* Buttons to select a new image or take a new photo */}
      <Pressable onPress={() => pickImage("library")} style={styles.pressable}>
        <Text style={styles.pressableText}>Select New Image</Text>
      </Pressable>

      <Pressable onPress={() => pickImage("camera")} style={styles.pressable}>
        <Text style={styles.pressableText}>Take New Photo</Text>
      </Pressable>

      {/* Button to save changes */}
      <Pressable onPress={handleSave} style={styles.pressable}>
        <Text style={styles.pressableText}>Save</Text>
      </Pressable>

      <Text style={styles.itemStatus}>Completed: {item.completed ? "Yes" : "No"}</Text>
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
  pressable: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    margin: 10,
    alignItems: "center",
    width: 150,
  },
  pressableText: {
    color: "#fff",
    fontSize: 16,
  },
});
