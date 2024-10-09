import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, Pressable, Alert, Image } from "react-native";
import { db } from "../firebase.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import MapView, { Marker } from "react-native-maps"; // Import MapView and Marker

export default function AddItemScreen({ navigation }) {
  // Added navigation prop
  const [text, setText] = useState("");
  const [imageUri, setImageUri] = useState(null); // For storing selected image URI
  const [selectedLocation, setSelectedLocation] = useState(null); // For storing selected GPS location

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Sorry, we need media library permissions to make this work!");
      }
    })();
  }, []);

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

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    } else {
      Alert.alert("Error", "No image selected.");
    }
  };

  // Function to handle map press
  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate); // Store the selected location
  };

  const uploadAndSubmit = async () => {
    if (text.trim().length === 0) {
      Alert.alert("Validation", "Please enter an item name.");
      return;
    }
    try {
      const storage = getStorage();
      const uniqueFileName = new Date().getTime() + "-image";
      const storageRef = ref(storage, `images/${uniqueFileName}`);

      const response = await fetch(imageUri);
      const blob = await response.blob();

      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);

      // Add the item to Firestore with the image URL and location
      await db.collection("items").add({
        name: text,
        completed: false,
        imageUrl: downloadUrl,
        location: selectedLocation, // Save selected location
      });

      // Show confirmation alert
      Alert.alert("Success", "Item added successfully!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Home"), // Navigate back to home screen
        },
      ]);

      // Clear input fields
      setText("");
      setImageUri(null);
      setSelectedLocation(null); // Clear selected location
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

      {/* Map to select location */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 55.6761,
          longitude: 12.5683,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }}
        onPress={handleMapPress}
      >
        {selectedLocation && <Marker coordinate={selectedLocation} title="Selected Location" />}
      </MapView>

      <Pressable onPress={uploadAndSubmit} style={styles.pressable}>
        <Text style={styles.pressableText}>Submit Item</Text>
      </Pressable>
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
  map: {
    width: "100%",
    height: 300,
    marginTop: 20,
  },
});
