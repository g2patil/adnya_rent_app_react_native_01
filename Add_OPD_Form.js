//import React, { useContext, useState } from 'react';
import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Alert, ScrollView, Dimensions, TouchableOpacity, Modal, Pressable, ActivityIndicator  } from 'react-native';
import { UserContext } from './UserContext';
import { DataTable } from 'react-native-paper';
import config from './my_con';
const Add_OPD_Form = ({ navigation }) => {
  const { user_id } = useContext(UserContext); 
  const [patientId, setPatientId] = useState('');
  const [patientDetails, setPatientDetails] = useState(null);
  const [findings, setFindings] = useState('');
  const [feesAmount, setFeesAmount] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [reasonForVisit, setReasonForVisit] = useState('');
 
  const [patientHistory, setPatientHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);



  
  const [prescriptionModalVisible, setPrescriptionModalVisible] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');


  const [medicineSuggestions, setMedicineSuggestions] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  
  const { width } = Dimensions.get('window');

  const fetchPatientDetails = () => {
    if (patientId.trim() === '') {
      Alert.alert('Error', 'Patient ID cannot be empty');
      return;
    }
///login`
    fetch(`${config.BASE_URL}/adnya/patient/find/${patientId}`)
      .then(response => response.json())
      .then(data => {
        if (data) {
          setPatientDetails(data);
          console.log("Patient data:", data);
        } else {
          Alert.alert('Error', 'No patient found with the given ID');
          setPatientId("");
          setPatientDetails(null);
        }
      })
      .catch(error => {
        Alert.alert('Error', 'Failed to fetch patient details');
        setPatientDetails(null);
      });
  };

  const handlePatientIdChange = (value) => {
    setPatientId(value);
  };

  const handleFetchPatientDetails = () => {
    fetchPatientDetails();
  };

  const handleFocus = () => {
    setPatientDetails(null);
   
  };

  const handleBlur = () => {
    fetchPatientDetails();
  };

  const validateFeesAmount = (amount) => {
    // Regular expression to check if it's a positive number
    return /^(\d+(\.\d{1,2})?)?$/.test(amount) && parseFloat(amount) > 0;
  };

  const handleRegister = () => {
    if (!patientId) {
      Alert.alert('Error', 'Patient ID cannot be empty');
      return;
    }
    if (!findings) {
      Alert.alert('Error', 'Findings cannot be empty');
      return;
    }
    if (!treatmentPlan) {
      Alert.alert('Error', 'Treatment Plan cannot be empty');
      return;
    }
    if (!reasonForVisit) {
      Alert.alert('Error', 'Reason for Visit cannot be empty');
      return;
    }
    if (!validateFeesAmount(feesAmount)) {
      Alert.alert('Error', 'Invalid Fees Amount');
      return;
    }

    
    
    const dataToSend = {
      patientId,
      doctorId: user_id,
      doctorid: user_id,
      findings,
      feesAmount: parseFloat(feesAmount), // Ensure feesAmount is a number
      treatmentPlan,
      reasonForVisit,
      prescriptions: medicines, // Include the medicines list in the data
    };
    console.log("Data to send:",medicines);
    console.log("Data to send:", JSON.stringify(dataToSend));
    fetch(`${config.BASE_URL}/adnya/register/opd`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    })
      .then(response => response.json())
      .then(data => {
        Alert.alert('Success', 'OPD data saved successfully');
        setPatientId('');
        setFindings('');
        setTreatmentPlan('');
        setReasonForVisit('');
        setFeesAmount('');
        setPatientDetails(null);
        setMedicines([]); // Reset medicines to an empty array
      })
      .catch(error => {
        Alert.alert('Error', 'Failed to save OPD data');
      });
  };

  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  
  const fetchPatientHistory = () => {
    setIsLoading(true);
    fetch(`${config.BASE_URL}/adnya/opd/history/${patientId}/${user_id}`)
      .then(response => response.json())
      .then(data => {
        setPatientHistory(data);
        console.log(data);
        setIsLoading(false);
      })
      .catch(error => {
        Alert.alert('Error', 'Failed to fetch patient history');
        setIsLoading(false);
      });
  };

  const toggleHistoryModal = () => {
    if (isHistoryVisible) {
      setIsHistoryVisible(false);
    } else {
      fetchPatientHistory();
      setIsHistoryVisible(true);
    }
  };


  const [noOfDays, setNoOfDays] = useState('');

  const addPrescription = () => {
    if (!medicineName || !dosage || !noOfDays || !instructions) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    const newMedicine = { medicineName, dosage, noOfDays, instructions };
    setMedicines([...medicines, newMedicine]);
    setMedicineName('');
    setDosage('');
    setNoOfDays('');
    setInstructions('');
    setPrescriptionModalVisible(true);
  };


  const openPrescriptionModal = () => {
    if (patientId) {
      setIsLoading(true); // Start loading indicator
      setPrescriptionModalVisible(true);
    } else {
      Alert.alert('Error', 'Patient ID cannot be empty');
    }
     // setIsDisabled(text.length === 0);
    
  };

  const closePrescriptionModal = () => {
    setPrescriptionModalVisible(false);
  };

 

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Text style={styles.label}>Patient ID:</Text>
        <TextInput
          style={styles.input}
          value={patientId}
          onChangeText={handlePatientIdChange}
          onFocus={handleFocus}
          onBlur={handleBlur} 
          placeholder="Enter patient ID"
          placeholderTextColor="#5F6368"
        />
       
        {patientDetails && (
          <View style={styles.container}>
            <DataTable>
              <DataTable.Header style={styles.header}>
                <DataTable.Title style={styles.title}>Label</DataTable.Title>
                <DataTable.Title style={styles.title}>Details</DataTable.Title>
              </DataTable.Header>

              <DataTable.Row>
                <DataTable.Cell style={styles.labelCell}>Patient Name:</DataTable.Cell>
                <DataTable.Cell style={styles.valueCell}>{patientDetails.firstName} {patientDetails.lastName}</DataTable.Cell>
              </DataTable.Row>

              <DataTable.Row>
                <DataTable.Cell style={styles.labelCell}>Contact Number:</DataTable.Cell>
                <DataTable.Cell style={styles.valueCell}>{patientDetails.contactNumber}</DataTable.Cell>
              </DataTable.Row>

              <DataTable.Row>
                <DataTable.Cell style={styles.labelCell}>Address:</DataTable.Cell>
                <DataTable.Cell style={styles.valueCell}>{patientDetails.address}</DataTable.Cell>
              </DataTable.Row>
            </DataTable>
            <TouchableOpacity style={styles.button} onPress={toggleHistoryModal}>
            <Text style={styles.buttonText}>History</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.label}>Reason for Visit:</Text>
        <TextInput
          style={styles.input}
          value={reasonForVisit}
          onChangeText={setReasonForVisit}
          placeholder="Enter reason for visit"
          placeholderTextColor="#5F6368"
        />

        <Text style={styles.label}>Findings:</Text>
        <TextInput
          style={styles.input}
          value={findings}
          onChangeText={setFindings}
          placeholder="Enter findings"
          placeholderTextColor="#5F6368"
        />

        <Text style={styles.label}>Treatment Plan:</Text>
        <TextInput
          style={styles.input}
          value={treatmentPlan}
          onChangeText={setTreatmentPlan}
          placeholder="Enter treatment plan"
          placeholderTextColor="#5F6368"
        />

        <Text style={styles.label}>OPD Fees:</Text>
        <TextInput
          style={styles.input}
          value={feesAmount}
          onChangeText={setFeesAmount}
          placeholder="Enter Fees Amount"
          placeholderTextColor="#5F6368"
          keyboardType="numeric" // Ensure numeric input
        />




        <TouchableOpacity style={styles.button} onPress={openPrescriptionModal}>
          <Text style={styles.buttonText}>Create Prescription</Text>
        </TouchableOpacity>


      
      </View>

 {/* History Modal */}
 <Modal
          visible={isHistoryVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsHistoryVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Patient History for {patientDetails ? `${patientDetails.firstName} ${patientDetails.lastName}` : 'N/A'}
              </Text>

              {isLoading ? (
                <ActivityIndicator size="large" color="#005EB8" />
              ) : (
                <ScrollView style={styles.modalScrollView}>
                  <DataTable>
                    <DataTable.Header style={styles.header}>
                      <DataTable.Title style={styles.srNoTitle}>No</DataTable.Title>
                      <DataTable.Title style={styles.srNoTitle}>Date</DataTable.Title>
                      <DataTable.Title style={styles.title}>Visit Reason</DataTable.Title>
                      <DataTable.Title style={styles.title}>Finding</DataTable.Title>
                      <DataTable.Title style={styles.title}>Treatment</DataTable.Title>
                    </DataTable.Header>

                    {patientHistory.length > 0 ? (
                      patientHistory.map((history, index) => (
                        <DataTable.Row key={index} style={styles.srNoTitle} >
                          <DataTable.Cell style={styles.srNoTitle}>
                            <Text style={styles.cellText}>{index + 1}</Text>
                          </DataTable.Cell>
                          <DataTable.Cell style={styles.srNoTitle}>
                            <Text style={styles.cellText}>{history.visitDate}</Text>
                          </DataTable.Cell>
                          <DataTable.Cell style={styles.cell}>
                            <Text style={styles.cellText}>{history.reasonForVisit}</Text>
                          </DataTable.Cell>
                          <DataTable.Cell style={styles.cell}>
                            <Text style={styles.cellText}>{history.findings}</Text>
                          </DataTable.Cell>
                          <DataTable.Cell style={styles.cell}>
                            <Text style={styles.cellText}>{history.treatmentPlan}</Text>
                          </DataTable.Cell>
                        </DataTable.Row>
                      ))
                    ) : (
                      <DataTable.Row>
                        <DataTable.Cell colSpan={5} style={styles.noData}>
                          No history available
                        </DataTable.Cell>
                      </DataTable.Row>
                    )}
                  </DataTable>
                </ScrollView>
              )}
              <Pressable style={styles.modalCloseButton} onPress={() => setIsHistoryVisible(false)}>
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>


{/* Modal for prescription input */}

        <Modal
          visible={prescriptionModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closePrescriptionModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Prescription</Text>
              <TextInput
                style={styles.input_med}
                value={medicineName}
                onChangeText={setMedicineName}
                                //onChangeText={setMedicineName}
                placeholder="Medicine Name"
              />



              <TextInput
                style={styles.input_med}
                value={dosage}
                onChangeText={setDosage}
                placeholder="Dosage"
              />
              <TextInput
                style={styles.input_med}
                value={noOfDays}
                onChangeText={setNoOfDays}
                placeholder="No. of Days"
              />
              <TextInput
                style={styles.input_med}
                value={instructions}
                onChangeText={setInstructions}
                placeholder="Instructions"
              />

{medicines.length > 0 && (
   <ScrollView style={styles.modalScrollView}>
          <View style={styles.container1}>
            <Text style={styles.modalTitle}>Prescriptions:</Text>
            <DataTable>
              <DataTable.Header style={styles.header}>

                <DataTable.Title style={styles.srNoTitle}>No</DataTable.Title>
                <DataTable.Title style={styles.title}>Medicine Name</DataTable.Title>
                <DataTable.Title style={styles.title}>Dosage</DataTable.Title>
                <DataTable.Title style={styles.title}>No. of Days</DataTable.Title>
                <DataTable.Title style={styles.title}>Instructions</DataTable.Title>
              </DataTable.Header>

              {medicines.map((medicine, index) => (
                  <DataTable.Row key={index} style={styles.srNoTitle} >
                  <DataTable.Cell style={styles.srNoTitle}>
                  <Text style={styles.cellText}>{index + 1}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell><Text style={styles.label_med}>{medicine.medicineName}</Text></DataTable.Cell>
                  <DataTable.Cell><Text style={styles.label_med}>{medicine.dosage}</Text></DataTable.Cell>
                  <DataTable.Cell><Text style={styles.label_med}>{medicine.noOfDays}</Text></DataTable.Cell>
                  <DataTable.Cell><Text style={styles.label_med}>{medicine.instructions}</Text></DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </View>
          </ScrollView>
        )}
      

              <TouchableOpacity style={styles.button} onPress={addPrescription}>
                <Text style={styles.buttonText}>Add Prescription</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register .... OPD</Text>
        </TouchableOpacity>

              <Pressable style={styles.modalCloseButton} onPress={closePrescriptionModal}>
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
 {/* Display added prescriptions */}
 

      

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#F4F4F4',
  },
  label: {
    marginVertical: 10,
    fontWeight: 'bold',
    fontSize: 16,
    width: '100%',
    textAlign: 'left',
    color: '#005EB8',
  },
  label_med: {
    marginVertical: 5,
    fontWeight: 'bold',
    fontSize: 10,
    width: '100%',
    textAlign: 'center',
    color: '#005EB8',
  },


  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    marginLeft: 10,
    borderRadius: 5,
    borderColor: '#005EB8',
    backgroundColor: '#FFFFFF',
   // width: width * 0.88,
  },
  input_med: {
    borderWidth: 1,
    padding: 2,
    marginVertical: 2,
    marginLeft: 2,
    borderRadius: 1,
    borderColor: '#005EB8',
    backgroundColor: '#FFFFFF',
   // width: width * 0.88,
  },


  button: {
    backgroundColor: '#005EB8',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    margin: 15,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#d3d3d3',
    backgroundColor: '#fff',
  },

  container1: {
    margin: 5,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#d3d3d3',
    backgroundColor: '#fff',
  },
  /*header: {
    backgroundColor: '#f4f4f4',
  },*/
  scrollView: {
    flex: 1,
  },
  title: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },

  title_med: {
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
  },

  labelCell: {
    flex: 2,
    paddingVertical: 2,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#d3d3d3',
    backgroundColor: '#f9f9f9',
  },
  valueCell: {
    flex: 3,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#d3d3d3',
    flexWrap: 'wrap',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%', // Adjust to fit your needs
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5, // Adds shadow on Android
    shadowColor: '#000', // Adds shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center', // Center-aligns the title
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#f4f4f4',
  },
  title: {
    color: '#333',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row', // Ensure rows are laid out in a row
  },
  cell: {
    flex: 1, // Allows cell to grow and wrap text
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#d3d3d3',
  },
  cellText: {
    fontSize: 12,
    color: '#333',
    flexWrap: 'wrap', // Ensures text wraps within the cell
    flexShrink: 1, // Allows text to shrink and fit the cell if needed
  },
  noData: {
    textAlign: 'center',
    padding: 10,
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: '#005EB8',
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  srNoCell: {
    width: 10, // Adjust width as needed
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#d3d3d3',
    justifyContent: 'right', // Center-aligns content vertically
  },
  suggestionsContainer: {
    marginTop: 10,
  },
  suggestionItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  suggestionText: {
    fontSize: 16,
    color: '#000',
  },

});

export default Add_OPD_Form;
