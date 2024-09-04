// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { enableScreens } from "react-native-screens";
import HomeScreen from "./screens/HomeScreen.js";
import AddItemScreen from "./screens/AddItemScreen.js";
import ViewItemsScreen from "./screens/ViewItemsScreen.js";

enableScreens();

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Add Item" component={AddItemScreen} />
        <Stack.Screen name="View Items" component={ViewItemsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
