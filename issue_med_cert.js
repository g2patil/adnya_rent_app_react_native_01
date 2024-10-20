import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, Alert, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { UserContext } from './UserContext';
import config from './my_con';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import DateTimePickerModal from 'react-native-modal-datetime-picker'; // Date picker package

const IssueMedicalCertificate = ({ navigation }) => {
  const { user_id } = useContext(UserContext);
  const [patientId, setPatientId] = useState('');
  const [patientDetails, setPatientDetails] = useState(null);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [reason, setReason] = useState('');
  const [certificateBody, setCertificateBody] = useState('');
  const [loading, setLoading] = useState(false);

  // Date pickers state
  const [fromDate, setFromDate] = useState(new Date()); // Default is current date
  const [toDate, setToDate] = useState(new Date());
  const [isFromDatePickerVisible, setFromDatePickerVisibility] = useState(false);
  const [isToDatePickerVisible, setToDatePickerVisibility] = useState(false);

  const showFromDatePicker = () => setFromDatePickerVisibility(true);
  const hideFromDatePicker = () => setFromDatePickerVisibility(false);
  const showToDatePicker = () => setToDatePickerVisibility(true);
  const hideToDatePicker = () => setToDatePickerVisibility(false);

  const handleConfirmFromDate = (date) => {
    setFromDate(date); // Update the fromDate state
    hideFromDatePicker();
  };

  const handleConfirmToDate = (date) => {
    setToDate(date); // Update the toDate state
    hideToDatePicker();
  };

  const fetchPatientDetails = async () => {
    if (patientId.trim() === '') {
      Alert.alert('Error', 'Patient ID cannot be empty');
      return;
    }

    setLoading(true);
    try {
     // setPatientId('');
      setPatientDetails(null);
      setDoctorDetails(null);

      const response = await fetch(`${config.BASE_URL}/adnya/patient/find/${patientId}`);
      const data = await response.json();
      if (data) {
        setPatientDetails(data);
        fetchDoctorDetails(data.doctorId); // Automatically fetch doctor details using the doctor ID from patient data
      } else {
        Alert.alert('Error', 'No patient found with the given ID');
        setPatientId('');
        setPatientDetails(null);
        setDoctorDetails(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch patient details');
      setPatientDetails(null);
      setDoctorDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = () => {
    fetchPatientDetails();
  };
  const handleFocus = () => {
    setPatientDetails(null);
   
  };
  const fetchDoctorDetails = async (doctorId) => {
    if (!doctorId) {
      Alert.alert('Error', 'Doctor ID cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${config.BASE_URL}/adnya/search/doctor?doctor_id=${doctorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const dr_data = await response.json();
      if (dr_data) {
        setDoctorDetails(dr_data);
      } else {
        Alert.alert('Error', 'No doctor found with the given ID');
        setDoctorDetails(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch doctor details');
      setDoctorDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificate = async () => {
    if (!patientDetails || !doctorDetails) {
      Alert.alert('Error', 'Please fetch patient and doctor details first');
      return;
    }

    if (!reason || !certificateBody) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

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
           
        <div class="header">Medical Certificate</div>

        <table class="prescription-table">
            <tr>
                <td colspan="2"><strong>Doctor Name:</strong> ${doctorDetails.doctor_name}</td>
            </tr>
            <tr>
                <td><strong>Degree:</strong> ${doctorDetails.doctor_dg}</td>
                <td align="right"><strong>Reg No.:</strong> ${doctorDetails.doctor_reg_no}</td>
            </tr>
            <tr>
                <td colspan="2"> Date: ${new Date().toLocaleDateString()}</td>
            </tr>
        </table>
           
            <p>To Whom It May Concern,</p>

            <p>This is to certify that <strong>${patientDetails.firstName} 
            ${patientDetails.lastName}</strong>, resident of <strong>${patientDetails.address}</strong>, was examined and treated at us.</p>

            <p class="section-title"><b>Medical Diagnosis:</b> ${reason}</p>
            <p class="section-title"><b>Recommendations:</b>  ${certificateBody}</p>
            <p>The patient is advised to rest for a period from <strong>${fromDate.toLocaleDateString()}</strong> to <strong>${toDate.toLocaleDateString()}</strong>.</p>

            <p>This certificate is issued upon the patient’s request for the purpose of <strong>${reason}</strong> treatment.</p>

            <p>Sincerely,</p>
            <p>${doctorDetails.doctor_name}<br>
            ${doctorDetails.doctor_dg}<br>
            Reg.No.:-${doctorDetails.doctor_reg_no}</p>
            <div class="signature">
                <p>____________________</p>
                <p>Signature</p>
            </div>
        </div>
    </body>
    </html>`;

    // Generate PDF
    const options = {
      html: htmlContent,
      fileName: 'Medical_Certificate',
      directory: 'Download',
    };

    try {
      const file = await RNHTMLtoPDF.convert(options);
      Alert.alert('PDF Generated', `PDF saved at: ${file.filePath}`);
      
      // Share PDF
      const shareOptions = {
        title: 'Share Medical Certificate',
        url: `file://${file.filePath}`,
        type: 'application/pdf',
      };

      Share.open(shareOptions)
        .then((res) => console.log('Share response:', res))
        .catch((err) => err && console.log('Error:', err));
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#005EB8" />
      ) : (
        <>
          <Text style={styles.label}>Patient ID:</Text>
          <TextInput
            style={styles.input}
            value={patientId}
            onChangeText={setPatientId}
            onFocus={handleFocus}
            onBlur={handleBlur} 
            placeholder="Enter patient ID"
          />
          <TouchableOpacity style={styles.button} onPress={fetchPatientDetails}>
            <Text style={styles.buttonText}>Fetch Patient Details</Text>
          </TouchableOpacity>

          {patientDetails && (
            <View>
              <Text style={styles.label}>Patient Name: {patientDetails.firstName} {patientDetails.lastName}</Text>
              <Text style={styles.label}>Contact Number: {patientDetails.contactNumber}</Text>
              <Text style={styles.label}>Address: {patientDetails.address}</Text>
            </View>
          )}

          {doctorDetails && (
            <View>
              <Text style={styles.label}>Doctor Name: {doctorDetails.doctor_name}</Text>
              <Text style={styles.label}>Qualification: {doctorDetails.doctor_dg}</Text>
              <Text style={styles.label}>Registration Number: {doctorDetails.doctor_reg_no}</Text>
            </View>
          )}

          <Text style={styles.label}>Medical Reason:</Text>
          <TextInput
            style={styles.input}
            value={reason}
            onChangeText={setReason}
            placeholder="Enter medical reason"
          />

          <Text style={styles.label}>Certificate Body:</Text>
          <TextInput
            style={styles.input}
            value={certificateBody}
            onChangeText={setCertificateBody}
            placeholder="Enter recommendations"
          />

          {/* From Date Picker */}
          <TouchableOpacity onPress={showFromDatePicker}>
           
            <TextInput
          placeholder="From Date (YYYY-MM-DD)"
          value={fromDate.toLocaleDateString()}
          editable={false} // Disable manual editing
          style={styles.input}
        />


          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isFromDatePickerVisible}
            mode="date"
            onConfirm={handleConfirmFromDate}
            onCancel={hideFromDatePicker}
            date={fromDate}
          />

          {/* To Date Picker */}
          <TouchableOpacity onPress={showToDatePicker}>
          

            <TextInput
          placeholder="To Date (YYYY-MM-DD)"
          value={toDate.toLocaleDateString()}
          editable={false} // Disable manual editing
          style={styles.input}
        />

          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isToDatePickerVisible}
            mode="date"
            onConfirm={handleConfirmToDate}
            onCancel={hideToDatePicker}
            date={toDate}
          />

          <TouchableOpacity style={styles.button} onPress={handleGenerateCertificate}>
            <Text style={styles.buttonText}>Generate Certificate</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#005EB8',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default IssueMedicalCertificate;
