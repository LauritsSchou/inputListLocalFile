// screens/AddItemScreen.js
import React from "react";
import { StyleSheet, Text, View, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { FlatList } from "react-native-web";

export default function AddItemScreen() {

  const [text, setText] = useState("");
  const [listData, setListData] = useState([]);

  function handleSubmit(params) {
    console.log(text);
    setListData([...listData, {key: listData.length, name: text}]);
  }

  return (
    <View style={styles.container}>
      <Text>Add a new item to your list</Text>
      <TextInput placeholder="Enter item name" onChangeText={(txt) => setText(txt)} style={styles.textinput}/>
      <Pressable title="Submit" onPress={handleSubmit} style={styles.pressable}></Pressable>
      <FlatList 
      data={listData} 
      renderItem={(data) => <Text>{data.item.name}</Text>} />

    
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
    backgroundColor: "grey",
    padding: 10,
    borderRadius: 5,
    margin: 10,
    width: 100,
  },
  textinput: {
    borderColor: "black",
    borderWidth: 1,
    padding: 10,
    margin: 10,
    width: 200,
  },
});
