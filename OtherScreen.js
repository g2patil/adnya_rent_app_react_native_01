

    // screens/OtherScreen.js

 

    import React, { useState } from 'react';
    import { StyleSheet, Text,Button, View, TextInput, TouchableOpacity, Alert } from 'react-native';
    
    const OtherScreen = ({ navigation }) => {
      const [name, setName] = useState('');
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
    
      const handleRegister = () => {
        if (!name || !email || !password) {
          Alert.alert('Error', 'Please fill all fields');
          return;
        }
    
        // Add your registration logic here
    
        Alert.alert('Success', 'Registration successful');
        navigation.navigate('Home');
      };
    
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Register</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
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
        
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        

          <Button style={styles.button}
        title="Go back"
        onPress={() => navigation.goBack()}
      />
        </View>
      );
    };
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
      },
      title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
      },
      input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
      },
      button: {
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        borderRadius: 5,
        marginBottom: 20,
      },
      buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
      },
    });
    
    export default OtherScreen;
    
      
 