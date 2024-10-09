import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity,ScrollView } from 'react-native';
import { UserContext } from './UserContext';
import CookieManager from '@react-native-cookies/cookies';
import DateTimePickerModal from 'react-native-modal-datetime-picker'; // Date picker package
import DateTimePicker from '@react-native-community/datetimepicker';

const OPDSearch = () => {
  const [searchParams, setSearchParams] = useState({
    fromDate: '',
    toDate: '',
  });
  const [opdList, setOpdList] = useState([]);
  const { session_Id } = useContext(UserContext);
  const { user_id } = useContext(UserContext);
  const [isFromDatePickerVisible, setFromDatePickerVisibility] = useState(false);
  const [isToDatePickerVisible, setToDatePickerVisibility] = useState(false);
  const BASE_URL = 'http://192.168.1.114:8082'; // Adjust to your backend URL

  // Date pickers
  const showFromDatePicker = () => setFromDatePickerVisibility(true);
  const hideFromDatePicker = () => setFromDatePickerVisibility(false);
  const showToDatePicker = () => setToDatePickerVisibility(true);
  const hideToDatePicker = () => setToDatePickerVisibility(false);

  const handleConfirmFromDate = (date) => {
    setSearchParams({ ...searchParams, fromDate: date.toISOString().split('T')[0] });
    hideFromDatePicker();
  };

  const handleConfirmToDate = (date) => {
    setSearchParams({ ...searchParams, toDate: date.toISOString().split('T')[0] });
    hideToDatePicker();
  };

  const searchOpdByVisitDate = async (fromDate, toDate) => {
    try {
      const cookies = await CookieManager.get(BASE_URL);
      console.log('Cookies:', cookies);

      const url = `${BASE_URL}/adnya/opd/search?doctorid=${user_id}&fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`;
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
        console.log('Fetched OPD records:', data);
        return data;
      } else {
        console.error('Expected JSON response but received:', contentType);
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching OPD records:', error);
      return [];
    }
  };

  const handleSearch = async () => {
    const results = await searchOpdByVisitDate(searchParams.fromDate, searchParams.toDate);
    setOpdList(results);
  };

  // Calculate total fees amount
  const getTotalFees = () => {
    return opdList.reduce((sum, item) => sum + (item.feesAmount || 0), 0);
  };

  const renderTableHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerText}>OPD ID</Text>
      <Text style={styles.headerText}>Visit Date</Text>
      <Text style={styles.headerText}>Patient Id</Text>
      <Text style={[styles.headerText, { textAlign: 'right' }]}>Fees Amount</Text>
    </View>
  );

  const renderTableRow = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.opdId}</Text>
      <Text style={styles.cell}>{item.visitDate}</Text>
      <Text style={styles.cell}>{item.patientId}</Text>
      <Text style={[styles.cell, { textAlign: 'right' }]}>
           {item.feesAmount ? parseFloat(item.feesAmount).toFixed(2) : '0.00'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text>Search OPD Records by Visit Date</Text>


      

      <TouchableOpacity onPress={showFromDatePicker}>
        <TextInput
          placeholder="From Date (YYYY-MM-DD)"
          value={searchParams.fromDate}
          editable={false} // Disable manual editing
          style={styles.input}
        />
      </TouchableOpacity>

      





      <TouchableOpacity onPress={showToDatePicker}>
        <TextInput
          placeholder="To Date (YYYY-MM-DD)"
          value={searchParams.toDate}
          editable={false} // Disable manual editing
          style={styles.input}
        />
      </TouchableOpacity>

      <Button title="Search" onPress={handleSearch} />
      
      <ScrollView style={styles.table}>
        {renderTableHeader()}
        <FlatList
          data={opdList}
          keyExtractor={(item) => item.opdId.toString()}
          renderItem={renderTableRow}
          scrollEnabled={false} // Disable FlatList scrolling
        />
        {/* Display total fees */}
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Total Fees:</Text>
          <Text style={[styles.totalText, { textAlign: 'right' }]}>{getTotalFees()}</Text>
        </View>
      </ScrollView>

      {/* From Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isFromDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmFromDate}
        onCancel={hideFromDatePicker}
      />

      {/* To Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isToDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmToDate}
        onCancel={hideToDatePicker}
      />
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
    height:'70%',
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'gray',
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
  },
  totalRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: 'gray',
    padding: 8,
    backgroundColor: '#f4f4f4',
  },
  totalText: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
});

export default OPDSearch;
