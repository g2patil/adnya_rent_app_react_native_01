import React, { useContext } from 'react';
import { UserContext } from './UserContext';
import { Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import navigation hook
import config from './my_con';
const LogoutButton = () => {
  const { session_Id, logout } = useContext(UserContext);
  const navigation = useNavigation(); // Initialize navigation

  const handleLogout = async () => {
    try {
      const response = await fetch(`${config.BASE_URL}/adnya/logout`, {
        method: 'GET', // or 'GET' depending on your API
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
       //   'Authorization': `Bearer ${session_Id}`,
        },
      });
      console.log("xxxxxxx"+session_Id);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Logout failed:', response.status, response.statusText, errorText);
        Alert.alert('Logout Failed', 'An error occurred during logout. Please try again.');
        return;
      }

      logout(); // Call the logout function to clear the session ID
      Alert.alert('Logged Out', 'You have been logged out successfully.');

      // Redirect to LoginScreen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }], // Replace 'LoginScreen' with your actual login screen name
      });
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Logout Failed', 'An error occurred during logout. Please try again.');
    }
  };

  return (
    <Button title="Logout" onPress={handleLogout} />
  );
};

export default LogoutButton;


/*import React, { useContext } from 'react';
import { UserContext } from './UserContext';
import { Button, Alert } from 'react-native';

const LogoutButton = () => {
  const { session_Id, logout } = useContext(UserContext);

  const handleLogout = async () => {
    try {
      const response = await fetch( `${config.BASE_URL}/adnya/logout`, {
        method: 'POST', // or 'GET' depending on your API
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session_Id}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Logout failed:', response.status, response.statusText, errorText);
        Alert.alert('Logout Failed', 'An error occurred during logout. Please try again.');
        return;
      }

      logout(); // Call the logout function to clear the session ID
      Alert.alert('Logged Out', 'You have been logged out successfully.');
      // Redirect or perform other actions as needed
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Logout Failed', 'An error occurred during logout. Please try again.');
    }
  };

  return (
    <Button title="Logout" onPress={handleLogout} />
  );
};

export default LogoutButton;
import React, { useContext } from 'react';
import { UserContext } from './UserContext'; // Ensure the path is correct
import { Button, Alert } from 'react-native';

const LogoutButton = () => {
  const { logout } = useContext(UserContext); // Access the logout function from context

  const handleLogout = () => {
    logout(); // Call the logout function
    Alert.alert('Logged Out', 'You have been logged out successfully.');
    // Redirect or perform other actions as needed
  };

  return (
    <Button title="Logout" onPress={handleLogout} />
  );
};

export default LogoutButton;
*/