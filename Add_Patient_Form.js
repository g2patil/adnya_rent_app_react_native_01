import React, { useContext, useState } from 'react';
import { StyleSheet, Text, Button, View, TextInput, Alert, ScrollView, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Import Picker component
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker component
import { UserContext } from './UserContext';
import config from './my_con';
const Add_Patient_Form = ({ navigation,setUser_id }) => {
  const { user_id } = useContext(UserContext);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validateContactNumber = (number) => {
    const contactNumberPattern = /^[0-9]{10}$/; // Assuming 10-digit mobile numbers
    return contactNumberPattern.test(number);
  };

  const handleRegister = () => {
    if (!firstName || !lastName || !dateOfBirth || !gender || !contactNumber  || !address) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (!validateContactNumber(contactNumber)) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (!validateEmail(email) && email  ) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    const dataToSend = {
      firstName,
      lastName,
      dateOfBirth: dateOfBirth.toISOString().split('T')[0], // Convert date to YYYY-MM-DD format
      gender,
      contactNumber,
      email,
      address,
      userId: user_id,
      doctorId: user_id   ,
    };
   // console.log(""+JSON.stringify(dataToSend));
    fetch(`${config.BASE_URL}/adnya/register/patient`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    })
   // .then(response => response.json())
    .then(response => {
      // Check the Content-Type of the response
      const contentType = response.headers.get('Content-Type');
  
      if (contentType && contentType.includes('application/json')) {

        Alert.alert('Success', 'Patient data saved successfully');
        // Parse JSON response
        return response.json().then(data => {
          console.log("JSON Response:", data);
        });
      } else {
        // Handle text/html or other types
        return response.text().then(text => {
          console.log("Non-JSON Response:", text);
              if(response.status==409)
              Alert.alert('Fail', ' Already patient Exist ');
              else  Alert.alert('Fail', ' Error  '+response.status);


        })
      }
    })
    .then(data => {
    
    
      
       
// Reset the form fields
/*
setFirstName('');
setLastName('');
setDateOfBirth(new Date());
setGender('');
setContactNumber('');
setEmail('');
setAddress(''); */

      //navigation.navigate('Home');
    })
    .catch(error => {
      if (error.response) {
        // The request was made, and the server responded with a status code
        alert("Error! Status code: " + error.response.status);
      } else if (error.request) {
        // The request was made, but no response was received
        console.error("Request was made but no response:", error.request);
        alert("No response from the server. Please try again.");
      } else {
        // Something else happened in setting up the request that triggered an error
        console.error("Error setting up request:", error.message);
        alert("An error occurred. Please try again.");
      }
    });
  }; 

  const showDatePickerHandler = () => {
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Text style={styles.label}>First Name:</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter first name"
          placeholderTextColor="#5F6368" // Soft gray placeholder text
        />

        <Text style={styles.label}>Last Name:</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter last name"
          placeholderTextColor="#5F6368" // Soft gray placeholder text
        />

        <Text style={styles.label}>Date of Birth:</Text>
        <TouchableOpacity onPress={showDatePickerHandler} style={styles.input}>
          <Text style={styles.inputText}>{dateOfBirth.toISOString().split('T')[0]}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()} // Optional: prevent selecting future dates
          />
        )}

        <Text style={styles.label}>Gender:</Text>
        <Picker
          selectedValue={gender}
          style={styles.picker}
          onValueChange={(itemValue) => setGender(itemValue)}
        >
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Male" value="Male" />
          <Picker.Item label="Female" value="Female" />
        </Picker>

        <Text style={styles.label}>Contact Number:</Text>
        <TextInput
          style={styles.input}
          value={contactNumber}
          onChangeText={setContactNumber}
          keyboardType="phone-pad"
          placeholder="Enter contact number"
          placeholderTextColor="#5F6368" // Soft gray placeholder text
        />

        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder="Enter email"
          placeholderTextColor="#5F6368" // Soft gray placeholder text
        />

        <Text style={styles.label}>Address:</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Enter address"
          placeholderTextColor="#5F6368" // Soft gray placeholder text
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register Patient</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#F4F4F4', // Light gray background for calmness
  },
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginVertical: 10,
    fontWeight: 'bold',
    fontSize: 16,
    width: '100%',
    textAlign: 'left',
    color: '#005EB8', // Professional blue color for labels
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5, // Subtle rounded corners
    borderColor: '#005EB8', // Professional blue border color
    backgroundColor: '#FFFFFF', // White background for inputs
    width: width * 0.9, // Make input width responsive
  },
  inputText: {
    color: '#005EB8', // Professional blue color for input text
  },
  picker: {
    height: 50,
    width: width * 0.9,
    marginVertical: 10,
    color: '#005EB8', // Professional blue color for Picker text
  },
  button: {
    backgroundColor: '#005EB8', // Professional blue color for the button
    borderRadius: 5, // Subtle rounded corners
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF', // White text color on button
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Add_Patient_Form;
