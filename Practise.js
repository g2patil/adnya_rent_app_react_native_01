import React, { useEffect, useState } from 'react';
import {TouchableOpacity,   View, Text, StyleSheet, ActivityIndicator, Alert, Button, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import config from './my_con';
const Practise = () => {
  const [topics, setTopics] = useState([]);
  const [subTopics, setSubTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [fetchingQuestions, setFetchingQuestions] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      //`${config.BASE_URL}/adnya
      const response = await fetch(`${config.BASE_URL}/adnya/exam/get_m_topic`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const json = await response.json();
      if (Array.isArray(json)) {
        setTopics(json);
      } else {
        setError('Unexpected response structure');
      }
    } catch (error) {
      setError('Error fetching topics: ' + error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubTopics = async (topicId) => {
    if (topicId === 'default') {
      setSelectedSubTopic(null);
      setSubTopics([]);
      return;
    }
    try {
      const response = await fetch(`${config.BASE_URL}/adnya/exam/get_s_topic/${topicId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const json = await response.json();
      if (Array.isArray(json)) {
        setSubTopics(json);
      } else {
        setError('Unexpected response structure for subtopics');
      }
    } catch (error) {
      setError('Error fetching subtopics: ' + error.message);
      Alert.alert('Error', error.message);
    }
  };

  const fetchQuestions = async () => {
    if (!selectedTopic || !selectedSubTopic) {
      Alert.alert('Error', 'Please select both a topic and a subtopic');
      return;
    }
    else{
    setFetchingQuestions(true);
    
    setError(null);

    try {
      const response = await fetch(`${config.BASE_URL}/adnya/exam/practise?mTopicId=${selectedTopic}&sTopicId=${selectedSubTopic}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      setError('Error fetching questions: ' + error.message);
      Alert.alert('Error', error.message);
    } finally {
      setFetchingQuestions(false);
    }
  }
  };

  const handleTopicChange = (itemValue) => {
    if(itemValue !== 'default') {
      setSelectedTopic(itemValue);
      setSelectedSubTopic(null);
      setQuestions([]); //
      fetchSubTopics(itemValue);
    } else { 
      setSelectedSubTopic(null);
      setSelectedTopic(itemValue);
      setQuestions([]); //
      fetchSubTopics(0);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Topic</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <Picker
            selectedValue={selectedTopic}
            onValueChange={handleTopicChange}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="Select Main Topic" value="default" />
            {topics.length > 0 ? (
              topics.map((topic) => (
                <Picker.Item   style={styles.picker}
                  key={topic.mTopicId} 
                  label={topic.mTopicName} 
                  value={topic.mTopicId} 
                />
              ))
            ) : (
              <Picker.Item label="No topics available" value={null} />
            )}
          </Picker>
          
          {selectedTopic && (
            <>
              <Picker
                selectedValue={selectedSubTopic}
               // onValueChange={(itemValue) => setSelectedSubTopic(itemValue)}
               onValueChange={(itemValue) => {
                if (itemValue === 'default') {
                  setSelectedSubTopic(null); // Reset selectedSubTopic to null
                  setQuestions([]); // Reset questions to null (or empty array)
                } else {
                  setSelectedSubTopic(itemValue);
                  // Fetch questions only if a valid subtopic is selected
                 // fetchQuestions(); 
                  setQuestions([]);
                }
              }}
              
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Select Sub Topic" value="default" />
                {subTopics.length > 0 ? (
                  subTopics.map((subTopic) => (
                    <Picker.Item  style={styles.picker}
                      key={subTopic.sTopicId} 
                      label={subTopic.stopicName} 
                      value={subTopic.sTopicId} 
                    />
                  ))
                ) : (
                  <Picker.Item label="No subtopics available" value={null} />
                )}
              </Picker>
             
            </>
          )}
          
         
          
          {selectedSubTopic && (
                 <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.button} onPress={fetchQuestions}>
    <Text style={styles.text}>Show Questions</Text>
  </TouchableOpacity>
                
               </View>
          )}

          {fetchingQuestions && <ActivityIndicator size="large" color="#007AFF" />}

          {questions.length > 0 && (
    <FlatList 
    data={questions}
    keyExtractor={(item) => item.questionId.toString()}
    renderItem={({ item, index }) => (
      <View 
      style={{
        padding: 15,
        backgroundColor: '#E0FFFF', // Light background color for the box
        borderRadius: 10,            // Rounded corners
        borderWidth: 1,              // Optional border
        borderColor: '#ccc',         // Border color
        marginBottom: 10,            // Spacing between questions
        shadowColor: '#000',         // Shadow color for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,                // Shadow for Android
      }}
      
      >
        <Text style={{ fontWeight: 'bold' }}> {index + 1}.{item.que.toString()}</Text> 
        <View >
          <Text>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A: {item.ansA.toString()}</Text> 
          <Text>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;B: {item.ansB.toString()}</Text>
          <Text>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;C: {item.ansC.toString()}</Text>
          <Text>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;D: {item.ansD.toString()}</Text>
        </View>
        <View>
          <Text  style={{ fontWeight: 'bold', color: 'green' }}
          >Answer : - {item.correctAnswer.toString()}</Text> 
        </View>
        <View>
          <Text style={{ fontWeight: 'bold' }}>Explaination : -</Text><Text> {item.expln.toString()}</Text> 
          </View>
       
        </View>
      )}
    />
)}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#EAEAEA',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2C3E50',
  },
  picker: {
    height: 40,
    width: '100%',
    fontWeight: 'bold',
    borderColor: '#2C3E50',
    borderWidth: 2,
    borderRadius: 10,
    color: '#0063B2FF',
    backgroundColor: '#E0FFFF',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 1,
  },
  selectedText: {
    marginTop: 10,
    fontSize: 16,
    color: '#34495E',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 16,
    marginTop: 10,
  },
  buttonContainer: {
    marginTop: 5,
    marginBottom: 10,
    width: '70%', // Full width
    borderRadius: 5, // Optional: rounded corners
    overflow: 'hidden', // Ensures border radius works
    backgroundColor: '#E0FFFF', // Button background color
  },
  button: {
    backgroundColor: '#E0FFFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  text: {
    color: 'blue',
    fontSize: 14,
    // You can use textTransform to control casing
    textTransform: 'none', // Change to 'uppercase' or 'capitalize' as needed
  },

});

export default Practise;
