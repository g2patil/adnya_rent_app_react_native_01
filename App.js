// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen';
import HomeScreen from './HomeScreen';
import { UserProvider } from './UserContext';
import Logout_Button from './LogoutButton';
import Practise from './Practise';
import Quiz from './Quiz';

const Stack = createStackNavigator();

const App = () => {
  return (
    <UserProvider>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Menu" component={HomeScreen} />
        <Stack.Screen name="Logout_Button" component={Logout_Button} />
        <Stack.Screen name="Practise" component={Practise} />
        <Stack.Screen name="Quiz" component={Quiz} />
         </Stack.Navigator>
    </NavigationContainer>
    </UserProvider>
  );
};

export default App;
