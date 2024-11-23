import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const RegisterClubMember = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mob, setMob] = useState('');
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedRoleName, setSelectedRoleName] = useState('');

  // Fetch roles from the API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('http://192.168.1.114:8082/adnya/club/rolelike?name=CLUB');
        if (response.ok) {
          const data = await response.json();
          setRoles(data);
        } else {
          console.error('Failed to fetch roles.');
        }
      } catch (error) {
        console.error('Error fetching roles:', error.message);
      }
    };

    fetchRoles();
  }, []);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^[0-9]{10}$/;

  const handleSubmit = async () => {
    // Validate fields
    if (!username || !email || !password || !mob || !selectedRoleId || !selectedRoleName) {
      Alert.alert('Validation Error', 'All fields are required!');
      return;
    }

    if (!username.trim()) {
      Alert.alert('Validation Error', 'Username is required.');
      return;
    }
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }
    if (!mobileRegex.test(mob)) {
      Alert.alert('Validation Error', 'Mobile number must be exactly 10 digits.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Validation Error', 'Password is required.');
      return;
    }
    if (!selectedRole || !roleId) {
      Alert.alert('Validation Error', 'Please select a role.');
      return;
    }

    // Construct the JSON payload
    const user = {
      username,
      email,
      password,
      mob: Number(mob), // Convert mob to a number
      otp: '', // Set default OTP as empty
      isActive: true, // Default value
      deactivationDate: null, // Explicitly set as null
      role_name: selectedRoleName.replace('ROLE_', ''), // Selected role name from the dropdown
      roles: [
        {
          id: selectedRoleId, // Selected role ID from the dropdown
          role: selectedRoleName, // Selected role name
        },
      ],
    };

    try {
      const response = await fetch('http://192.168.1.114:8082/adnya/club/add_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert('Success', `User ${data.username} added successfully!`);
        setUsername('');
        setEmail('');
        setPassword('');
        setMob('');
        setSelectedRoleId('');
        setSelectedRoleName('');
      } else {

        if (response.status === 409) {
          Alert.alert('Error', 'User already exists.');
        } else if (response.status === 400) {
          Alert.alert('Error', 'Invalid data. Please check the input fields.');
        } else {
          console.log("xxxx"+response.status);
          Alert.alert('Error', 'Failed to add user. Please try again.');
        }
      
        //Alert.alert('Error', 'Failed to add user. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Club User</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        value={mob}
        onChangeText={setMob}
        keyboardType="phone-pad"
      />
      <Text style={styles.label}>Select Role</Text>
      <Picker
        selectedValue={selectedRoleId}
        onValueChange={(itemValue, itemIndex) => {
          setSelectedRoleId(itemValue);
          setSelectedRoleName(roles[itemIndex - 1]?.role); // Get role name
        }}
        style={styles.picker}
      >
        <Picker.Item label="Select Role" value="" />
        {roles.map((role) => (
          <Picker.Item key={role.id} label={role.role} value={role.id} />
        ))}
      </Picker>
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  picker: {
    height: 50,
    marginBottom: 15,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
});

export default RegisterClubMember;
