import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, Alert, Image, Pressable } from "react-native";
import { db } from "../firebase.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import MapView, { Marker } from "react-native-maps";

export default function DetailsScreen({ route, navigation }) {
  const { item } = route.params;

  const [itemText, setItemText] = useState(item.name);
  const [imageUri, setImageUri] = useState(item.imageUrl);
  const [location, setLocation] = useState({
    latitude: item.location.latitude,
    longitude: item.location.longitude,
  });
  const [showMap, setShowMap] = useState(false);
  const [image, setImage] = useState(null);

  // Request permissions for camera and media library
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cameraStatus !== "granted" || mediaLibraryStatus !== "granted") {
      Alert.alert("Error", "Permission to access camera and media library is required.");
    }
  };

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
      setImage(result.assets[0]); // Save selected image
    }
  };

  const uploadImage = async () => {
    if (!image) return imageUri; // Return existing URL if no new image

    const storage = getStorage();
    const uniqueFilename = `${Date.now()}_${image.fileName || "image"}`;
    const storageRef = ref(storage, `images/${uniqueFilename}`);

    const response = await fetch(image.uri);
    const blob = await response.blob();

    await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl; // Return new image URL
  };

  const handleSave = async () => {
    if (itemText.trim().length === 0) {
      Alert.alert("Error", "Item text cannot be empty.");
      return;
    }

    try {
      const newImageUri = await uploadImage(); // Upload image if provided

      // Update Firestore with the new details
      await db
        .collection("items")
        .doc(item.key)
        .update({
          name: itemText,
          imageUrl: newImageUri,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        });

      navigation.goBack(); // Navigate back after saving
    } catch (error) {
      Alert.alert("Error", "Failed to update the item.");
      console.error(error);
    }
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLocation({ latitude, longitude }); // Update location
  };

  const handleChangeLocation = () => {
    setShowMap((prev) => !prev); // Toggle map visibility
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Item</Text>

      {/* Text Input for item name */}
      <TextInput style={styles.input} value={itemText} onChangeText={setItemText} placeholder="Enter item text" />

      {/* Display Current Image */}
      {imageUri && <Image source={{ uri: imageUri }} style={{ width: 200, height: 200, marginBottom: 20 }} />}

      {/* Select New Image */}
      <Pressable onPress={() => pickImage("library")} style={styles.pressable}>
        <Text style={styles.pressableText}>Select New Image</Text>
      </Pressable>

      <Pressable onPress={() => pickImage("camera")} style={styles.pressable}>
        <Text style={styles.pressableText}>Take New Photo</Text>
      </Pressable>

      {/* Change Location Button */}
      <Pressable onPress={handleChangeLocation} style={styles.pressable}>
        <Text style={styles.pressableText}>Change Location</Text>
      </Pressable>

      {/* Show Map to select location */}
      {showMap && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onPress={handleMapPress}
        >
          <Marker coordinate={location} />
        </MapView>
      )}

      {/* Save Changes Button */}
      <Pressable onPress={handleSave} style={styles.pressable}>
        <Text style={styles.pressableText}>Save</Text>
      </Pressable>
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
  map: {
    width: "100%",
    height: 300,
    marginBottom: 20,
  },
});
