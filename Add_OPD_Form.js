//import React, { useContext, useState } from 'react';
import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Alert, ScrollView, Dimensions, TouchableOpacity, Modal, Pressable, ActivityIndicator  } from 'react-native';
import { UserContext } from './UserContext';
import { DataTable } from 'react-native-paper';
import config from './my_con';
//import RNHTMLtoPDF from 'rn-html-to-pdf';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import FileViewer from 'react-native-file-viewer';
import { PermissionsAndroid, Platform,Linking} from 'react-native';
import Share from 'react-native-share';
import SendIntentAndroid from 'react-native-send-intent';

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
      //  generatePDF(data);
     
      
      

      generatePDF(data); // Call the PDF generation function
        setPatientId('');
        setFindings('');
        setTreatmentPlan('');
        setReasonForVisit('');
        setFeesAmount('');
        setPatientDetails(null);
        setMedicines([]); // Reset medicines to an empty array
        setPrescriptionModalVisible(false);
       

        
      })
      .catch(error => {
        Alert.alert('Error', 'Failed to save OPD data');
      });
  };

/************ pdf */
const generatePDF = async (data) => {
/********************** */
//try {

  const response = await fetch(`${config.BASE_URL}/adnya/search/doctor?doctor_id=${data.doctorId}`, {
    method: 'GET', // or 'POST' if your API requires it
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const dr_data = await response.json();
  console.log("Dr Data",dr_data); // Process the data as needed
  const doctorname = dr_data.doctor_name; 
  const doctorregno =dr_data.doctor_reg_no;
  const doctorothinfo =dr_data.doctor_oth_info;
  const doctordg =dr_data.doctor_dg;
  console.log("--------",doctorname); // Process the data as needed
//} catch (error) {
 // console.error('There was a problem with the fetch operation:', error);
//}
/************** */

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
        }
        .container {
            margin: 20px;
            padding: 20px;
            border: 2px solid #000;
        }
        .header {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .doctor-info, .patient-info {
            margin-bottom: 15px;
        }
        .doctor-info td, .patient-info td {
            padding: 5px 10px;
        }
        .prescription-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .prescription-table, .prescription-table th, .prescription-table td {
            border: 1px solid #000;
        }
        .prescription-table th, .prescription-table td {
            padding: 10px;
            text-align: left;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">Doctor's Prescription</div>

        <table class="prescription-table">
            <tr>
                <td><strong>Doctor Name:</strong> ${doctorname}</td>
                <td align="right"><strong>Doctor ID:</strong> ${data.doctorId}</td>
            </tr>
            <tr>
                <td><strong>Degree:</strong> ${doctordg}</td>
                <td align="right"><strong>Reg No.:</strong> ${doctorregno}</td>
            </tr>
            <tr>
                <td colspan="2"><strong>Other Info:</strong> ${doctorothinfo}</td>
            </tr>
        </table>
         <hr>
        <table class="prescription-table">
            <tr>
                <td><strong>Patient ID:</strong> ${data.patientId}</td>
                <td align="right"><strong>Date:</strong> ${new Date().toLocaleDateString()}</td>
            </tr>
        </table>
         <hr>
        <h3>Prescription</h3>
        <table class="prescription-table">
            <thead>
                <tr>
                    <th>Sr. No.</th>
                    <th>Medicine Name</th>
                    <th>Dosage/Instruction</th>
                    <th>No. oF Dys</th>
                </tr>
            </thead>
            <tbody>
                ${medicines.map((med, index) => `
                <tr>
                 <td>${index + 1}</td> <!-- Serial number -->
                    <td>${med.medicineName}</td>
                    <td> ${med.dosage}
                    <p>${med.instructions}</p>
                    <th> (${med.noOfDays} days)</th>
                    </td>
                  
                                       
                </tr>`).join('')}
            </tbody>
        </table>

        <div class="footer">
            <p>Please follow the dosage as prescribed and consult the doctor for any side effects or queries.</p>
            <p>Signature: ______________________</p>
        </div>
    </div>
</body>
</html>

  `;
 /* const permissionGranted = await requestStoragePermission();
  if (!permissionGranted) {
    Alert.alert('Error', 'Storage permission is required to save the PDF.');
    return;
  }*/
  // Generate PDF
  let options = {
    html: htmlContent,
    fileName: 'Patient_prescription',
    directory: 'Download',
  };

  let file = await RNHTMLtoPDF.convert(options);
  Alert.alert('PDF Generated', `PDF saved at: ${file.filePath}`);


  sendWhatsAppMessage('9960059223', 'Hello G2, this is a test message!');

  const patientMobileNumber = '9503605749'; // Replace with the patient's mobile number
  const pdfFilePath = `${file.filePath}`; // Path to your PDF file

/*
  const message = `Hello, please find the attached PDF.`;
    
  // WhatsApp URL format
  const whatsappURL = `whatsapp://send?phone=${patientMobileNumber}&text=${encodeURIComponent(message)} ${pdfFilePath}`;

 //  Attempt to share the PDF file with WhatsApp
  Share.open({
    url: whatsappURL,
    title: 'Send PDF',
  })
    .then((res) => console.log('Share response:', res))
    .catch((err) => err && console.log('Error:', err));

*/


  const shareOptions = {
    title: 'Share PDF',
    url: `file://${file.filePath}`, // Ensure the URL starts with 'file://'
    type: 'application/pdf',
    social: Share.Social.WHATSAPP,
  };

  Share.open(shareOptions)
    .then((res) => console.log('Share response:', res))
    .catch((err) => err && console.log('Error:', err));
 
 


  
};


/************ end Pdf*/

/*****************sendmessage********* */

const sendWhatsAppMessage = (phoneNumber, message) => {
  // Remove any non-numeric characters from the phone number
  const cleanedPhoneNumber = phoneNumber.replace(/[^0-9]/g, '');

  // Construct WhatsApp URL
  const whatsappURL = `whatsapp://send?phone=${cleanedPhoneNumber}&text=${encodeURIComponent(message)}`;

  // Check if WhatsApp is installed
  Linking.canOpenURL(whatsappURL)
    .then((supported) => {
      if (!supported) {
        Alert.alert('WhatsApp is not installed on this device.');
      } else {
        // Open WhatsApp
        return Linking.openURL(whatsappURL);
      }
    })
    .catch((err) => {
      console.error('Error:', err);
    });
};

// Example Usage




/****************************** */
/*************search Doctor********** */
const searchDoctor = async (doctor_id) => {
  try {
    const response = await fetch(`${config.BASE_URL}/adnya/search/doctor?doctor_id=${doctor_id}`, {
      method: 'GET', // or 'POST' if your API requires it
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log(data); // Process the data as needed
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
};
/*************search Doctor end***** */

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

  
  async function requestStoragePermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'This app needs access to your storage to save PDF files.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  }
  

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
