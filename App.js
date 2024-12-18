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
import Pdf_cert from './Pdf_cert';
import PDFViewer from './PDFViewer';
import Register_club_member from './Register_club_member';

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
        <Stack.Screen name="Pdf_cert" component={Pdf_cert} />
        <Stack.Screen name="PDFViewer" component={PDFViewer} />
        <Stack.Screen name="Register_club_member" component={Register_club_member} />
         </Stack.Navigator>
    </NavigationContainer>
    </UserProvider>
  );
};

export default App;
