import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { UserContext } from './UserContext';
//import axios from 'axios';
//import { UserContext } from './UserContext';
import CookieManager from '@react-native-cookies/cookies';
import config from './my_con'; 

const PatientSearch = () => {
  const [searchParams, setSearchParams] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    contactNumber: '',
    email: '',
  });


  const [patients, setPatients] = useState([]);
  const { session_Id } = useContext(UserContext);
  
  //////////////////
 // const BASE_URL = __DEV__ ?   `${config.BASE_URL}`:'http://10.0.2.2:3000'; // Use your backend URL
 const BASE_URL =  `${config.BASE_URL}`;
 const { user_id } = useContext(UserContext); 
const searchPatients = async (searchParams) => {
  try {
    // Log cookies to ensure the correct session ID is being set
    const cookies = await CookieManager.get(BASE_URL);
    console.log('Cookies:', cookies);
    console.log('Seeeeee Cookies:', session_Id);
   
 

    const queryParams = Object.entries(searchParams)
      .map(([key, value]) => (value ? `${encodeURIComponent(key)}=${encodeURIComponent(value)}` : ''))
      .filter(Boolean)
      .join('&');

    const url = `${BASE_URL}/adnya/patient/search?${queryParams}`;
    console.log('Request URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include', // Ensure cookies are sent with the request
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    const responseText = await response.text();
    console.log('Response Text:', responseText);

    if (!response.ok) {
      console.error('Response Error:', response.status, response.statusText, responseText);
      throw new Error('Network response was not ok');
    }

    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      const data = JSON.parse(responseText);
      console.log('Fetched patients:', data);
      return data;
    } else {
      console.error('Expected JSON response but received:', contentType);
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
};

  
  
  //////////////////

  const handleSearch = async () => {
    const results = await searchPatients(searchParams);
    setPatients(results);
  };

  const renderTableHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerText}>First Name</Text>
      <Text style={styles.headerText}>Last Name</Text>
      <Text style={styles.headerText}>Gender</Text>
      <Text style={styles.headerText}>Mobile</Text>
      <Text style={styles.headerText}>Patient Id</Text>
    </View>
  );

  const renderTableRow = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.firstName}</Text>
      <Text style={styles.cell}>{item.lastName}</Text>
      <Text style={styles.cell}>{item.gender}</Text>
      <Text style={styles.cell}>{item.contactNumber}</Text>
      <Text style={styles.cell}>{item.patientId}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text>Search Patients</Text>
      <TextInput
        placeholder="First Name"
        value={searchParams.firstName}
        onChangeText={(text) => setSearchParams({ ...searchParams, firstName: text })}
        style={styles.input}
      />
      <TextInput
        placeholder="Last Name"
        value={searchParams.lastName}
        onChangeText={(text) => setSearchParams({ ...searchParams, lastName: text })}
        style={styles.input}
      />
      <TextInput
        placeholder="Gender"
        value={searchParams.gender}
        onChangeText={(text) => setSearchParams({ ...searchParams, gender: text })}
        style={styles.input}
      />
      <TextInput
        placeholder="Contact Number"
        value={searchParams.contactNumber}
        onChangeText={(text) => setSearchParams({ ...searchParams, contactNumber: text })}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={searchParams.email}
        onChangeText={(text) => setSearchParams({ ...searchParams, email: text })}
        style={styles.input}
      />
      <Button title="Search" onPress={handleSearch} />

      <View style={styles.table}>
        {renderTableHeader()}
        <FlatList
          data={patients}
          keyExtractor={(item) => item.patientId.toString()}
          renderItem={renderTableRow}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  table: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'gray',
    fontSize:8,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#f4f4f4',
    borderBottomWidth: 1,
    borderColor: 'gray',
    padding: 8,
  },
  headerText: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 10,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: 'gray',
    padding: 8,
   
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
  },
});

export default PatientSearch;
