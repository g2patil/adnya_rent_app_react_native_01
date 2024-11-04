import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Alert, Button, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import config from './my_con';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
//import OpenFile from 'react-native-open-file';
import RNFS from 'react-native-fs';
import { DocumentDirectoryPath } from 'react-native-fs';

const Quiz = () => {
    const [topics, setTopics] = useState([]);
    const [loadingTopics, setLoadingTopics] = useState(true);
    const [errorTopics, setErrorTopics] = useState(null);
    const [selectedTopicId, setSelectedTopicId] = useState(null);
    const [questionCount, setQuestionCount] = useState(5);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [attemptedQuestions, setAttemptedQuestions] = useState([]);
    const [finalScore, setfinalScore] = useState(0);
    useEffect(() => {
        const loadTopics = async () => {
            setLoadingTopics(true);
            setErrorTopics(null);
            try {
                const response = await fetch(`http://192.168.1.114:8082/adnya/exam/get_m_topic`);
                if (!response.ok) throw new Error('Failed to fetch topics');
                const json = await response.json();
                setTopics(Array.isArray(json) ? json : []);
            } catch (err) {
                setErrorTopics(err.message);
                Alert.alert('Error', err.message);
            } finally {
                setLoadingTopics(false);
            }
        };
        loadTopics();
    }, []);

    const handleStartTest = async () => {
        if (!selectedTopicId) {
            Alert.alert('Select a Topic', 'Please select a main topic before starting the test.');
            return;
        }
        Alert.alert(
            'Confirm Test Start',
            'Are you sure you want to start the test?',
            [
                { text: 'No', style: 'cancel' },
                { text: 'Yes', onPress: loadQuestions },
            ]
        );
    };

    const loadQuestions = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${config.BASE_URL}/adnya/exam/test?mainTopicId=${selectedTopicId}&questionCount=${questionCount}`);
            if (!response.ok) throw new Error('Failed to fetch questions');
            const fetchedQuestions = await response.json();
            setQuestions(fetchedQuestions);
            setCurrentQuestionIndex(0);
            setScore(0);
            setSelectedAnswers({});
            setAttemptedQuestions([]);
        } catch (err) {
            setError(err.message);
            Alert.alert('Error', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (answer, letter) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [currentQuestionIndex]: letter,
        }));
    };

    const handleNextQuestion = () => {
        const currentQuestion = questions[currentQuestionIndex];
        const currentSelectedAnswer = selectedAnswers[currentQuestionIndex];
        const isCorrect = currentSelectedAnswer === currentQuestion.correctAnswer;
    
        // Update score only if an answer has been selected
        if (currentSelectedAnswer !== undefined) {
            // Check if the question has been attempted before
            const previousAttempt = attemptedQuestions.find(
                (attempt) => attempt.index === currentQuestionIndex
            );
    
            if (previousAttempt) {
                // If previously attempted, check if the answer has changed
                if (previousAttempt.answer !== currentSelectedAnswer) {
                    // If the answer was correct before and is now incorrect, decrement score
                    if (previousAttempt.isCorrect && !isCorrect) {
                        setScore((prevScore) => prevScore - 1);
                    }
                    // If the answer was incorrect before and is now correct, increment score
                    else if (!previousAttempt.isCorrect && isCorrect) {
                        setScore((prevScore) => prevScore + 1);
                    }
    
                    // Update the attempted question with the new answer and correctness
                    previousAttempt.answer = currentSelectedAnswer;
                    previousAttempt.isCorrect = isCorrect;
                    
                }
            } else {
                // If this is the first attempt for this question
                if (isCorrect) {
                    setScore((prevScore) => prevScore + 1); // Increase score if the answer is correct
                }
    
                // Record the question as attempted with the selected answer and its correctness
                setAttemptedQuestions((prev) => [
                    ...prev,
                    { index: currentQuestionIndex, answer: currentSelectedAnswer, isCorrect },
                ]);
            }
    
            // Only add question to attemptedQuestions if it’s the first attempt
            if (!attemptedQuestions.some((attempt) => attempt.index === currentQuestionIndex)) {
              //  setAttemptedQuestions(prev => [...prev, { index: currentQuestionIndex, answer: currentSelectedAnswer, isCorrect }]);
                setAttemptedQuestions(prev => [...prev, currentQuestionIndex]);
            }
        }
    
        console.log("Current score: " + score); // For debugging
    
        // Move to the next question or show results if it's the last question
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        } else {
            // Last question; prepare to show the results
            Alert.alert('Quiz Completed', `Your final score is: ${score} out of ${questions.length}`);
            generatePDF();
            resetQuiz();
        }
    };
    
    
/*
    const handleNextQuestion = () => {
        const currentQuestion = questions[currentQuestionIndex];
    
        // Check if the answer is correct for the current question
        const currentSelectedAnswer = selectedAnswers[currentQuestionIndex];
        const isCorrect = currentSelectedAnswer === currentQuestion.correctAnswer;
    
        // Update score only if the answer has been selected
        if (currentSelectedAnswer !== undefined) {
            // Check if the question has been attempted
            if (attemptedQuestions.includes(currentQuestionIndex)) {
                // If user previously answered the question, adjust score based on the current answer
                const previousAnswer = selectedAnswers[currentQuestionIndex];
                const previousIsCorrect = previousAnswer === currentQuestion.correctAnswer;
    
                // If the answer has changed, adjust the score
                if (previousAnswer !== currentSelectedAnswer) {
                    if (previousIsCorrect) {
                        setScore(prevScore => prevScore - 1); // Subtract point for previous correct answer
                    }
                    if (isCorrect) {
                        setScore(prevScore => prevScore + 1); // Add point for the new correct answer
                    }
                }
            } else {
                // New attempt for this question, update score if the answer is correct
                if (isCorrect) {
                    setScore(prevScore => prevScore + 1);
                } //else  setScore(prevScore => prevScore - 1);
            }
    
            // Mark the question as attempted
            if (!attemptedQuestions.includes(currentQuestionIndex)) {
                setAttemptedQuestions(prev => [...prev, currentQuestionIndex]);
            }
        }
    
        console.log("Current score: " + score); // For debugging
    
        // Move to the next question or show results if it's the last question
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        } else {
            // Last question; prepare to show the results
            Alert.alert('Quiz Completed', `Your final score is: ${score} out of ${questions.length}`);
            generatePDF();
            resetQuiz();
        }
    };
    
 */
    const handleSubmit = () => {
        const finalScore = score + (selectedAnswers[currentQuestionIndex] === currentQuestion.correctAnswer ? 1 : 0);
        
        console.log("**** = " + finalScore);
        console.log("score**** (before update) = " + score);
        
        // Update the score state and process with the updated score immediately
        setScore((prevScore) => {
            const newScore = finalScore; // Calculate new score here
            console.log("new score**** (after update) = " + newScore); // This will log the new score
            return newScore; // Return the new score to set it
        });
        console.log("score**** (after update) = " + score);
        // Show the final score alert with the finalScore
        Alert.alert('Quiz Completed', `Your final score is: ${finalScore} out of ${questions.length}`);
        
        // Generate PDF after showing the score
        generatePDF(finalScore); 
        resetQuiz(); // Reset the quiz for the next attempt
    };




    const getBase64 = async (filePath) => {
        try {
          const base64 = await RNFS.readFile(filePath, 'base64');
          return `data:image/png;base64,${base64}`;
        } catch (error) {
          console.error('Error converting image to Base64:', error);
          return null; // Return null or handle error as needed
        }
      };


    const generatePDF = async (s) => {
     //   const watermarkURL = await getBase64Image(require('./assets/Adnya_tech_logo.png'));
    //    const logoURL = await getBase64Image(require('./assets/Adnya_tech_logo.png'));
    const logoURL = `${DocumentDirectoryPath}/Adnya_tech_logo.png`; // Replace with the actual path or URL to Adnya Tech logo
       console.log("  jjjjj  "+logoURL);
    const htmlContent = `
            <html>
            <head>
                <style>
                    body { 
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        position: relative;
                        color: #333;
                    }
                    h1, h2 {
                        color: #3d85c6;
                    }
                
                    .content {
                        position: relative;
                        z-index: 1;
                    }
                    .question {
                        margin: 20px 0;
                    }
                    .correct-answer {
                        color: green;
                    }
                    .incorrect-answer {
                        color: red;
                    }
                    hr {
                        border: 0;
                        border-top: 1px solid #ccc;
                        margin: 20px 0;
                    }
                </style>
            </head>
            <body>
                <div class="watermark"></div>
                <div class="content">
                    <table width="100%" border=0>
                    <tr><td colspan="2"> <h1 align="center">Quiz Results</h1></td></tr>
                    <tr><td colspan="2"><p align="center"><strong>Test Number:</strong> ${selectedTopicId}</p></td></tr>
                    <tr><td align="left"><strong>Score:</strong> ${s} out of ${questions.length}</td>
                    <td align="right"><strong>Percentage:</strong> ${(s / questions.length * 100).toFixed(2)}%</td></tr>
                    <tr><td colspan="2" align="center"><h3>Questions and Answers</h3></td></tr>
                    <tr><td></td><td></td></tr>
                    </table>
                    
                    ${questions.map((question, index) => `
                        <div class="question">
                            <p><strong>Question ${index + 1}:</strong> ${question.que}</p>
                            <p>Answer A: ${question.ansA}</p>
                            <p>Answer B: ${question.ansB}</p>
                            <p>Answer C: ${question.ansC}</p>
                            <p>Answer D: ${question.ansD}</p>
                            <p class="${selectedAnswers[index] === question.correctAnswer ? 'correct-answer' : 'incorrect-answer'}">
                                <strong>Your Answer:</strong> ${selectedAnswers[index] ? selectedAnswers[index] : 'Not Attempted'}
                            </p>
                            <p><strong>Correct Answer:</strong> ${question.correctAnswer}</p>
                        </div>
                        <hr/>
                    `).join('')}
                </div>
            </body>
            </html>
        `;
    
        try {
            const options = {
                html: htmlContent,
                fileName: `Adnya_test_result_${selectedTopicId}`,
                directory: 'Documents',
            };
    
            const pdfFile = await RNHTMLtoPDF.convert(options);
          //  Alert.alert('PDF Generated', `PDF saved to ${pdfFile.filePath}`);
            console.log(`PDF File: ${pdfFile.filePath}`);
          /*  await Share.open({
                title: 'Open PDF',
                url: `file://${pdfFile.filePath}`, // Specify `file://` prefix
                type: 'application/pdf',
            });*/
          /*  OpenFile.open(pdfFile.filePath)
                .then(() => console.log('PDF opened successfully'))
                .catch((error) => console.error('Error opening PDF:', error));*/
        } catch (error) {
            Alert.alert('Error', 'Failed to generate PDF');
            console.error(error);
        }
    };
    
   

    const resetQuiz = () => {
        setCurrentQuestionIndex(0);
        setScore(0);
        setQuestions([]);
        setSelectedTopicId(null);
        setQuestionCount(5);
        setAttemptedQuestions([]);
    };

    const renderTopicPicker = () => (
        <Picker
            selectedValue={selectedTopicId}
            onValueChange={(itemValue) => setSelectedTopicId(itemValue)}
            style={styles.picker}
        >
            <Picker.Item label="Select a topic" value={null} />
            {topics.map((topic) => (
                <Picker.Item key={topic.mTopicId} label={topic.mTopicName} value={topic.mTopicId} />
            ))}
        </Picker>
    );

    const renderQuestionCountPicker = () => {
        const questionCounts = Array.from({ length: 12 }, (_, index) => index * 5 + 5).concat(120);
        return (
            <Picker
                selectedValue={questionCount}
                onValueChange={(itemValue) => setQuestionCount(itemValue)}
                style={styles.picker}
            >
                {questionCounts.map((count) => (
                    <Picker.Item key={count} label={count.toString()} value={count} />
                ))}
            </Picker>
        );
    };

    if (loadingTopics) return <Text style={styles.loadingText}>Loading topics...</Text>;
    if (errorTopics) return <Text style={styles.errorText}>Error: {errorTopics}</Text>;
    if (!questions.length && !loading) return (
        <ScrollView style={styles.container}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Select a Topic</Text>
                {renderTopicPicker()}
                <Text style={styles.questionCountLabel}>Number of Questions:</Text>
                {renderQuestionCountPicker()}
                <Button title="Start Test" onPress={handleStartTest} />
            </View>
        </ScrollView>
    );

    if (loading) return <Text style={styles.loadingText}>Loading questions...</Text>;
    if (error) return <Text style={styles.errorText}>Error: {error}</Text>;

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <View style={styles.container}>
            <Text style={styles.questionText}>{`Question ${currentQuestionIndex + 1}: ${currentQuestion.que}`}</Text>
            <View style={styles.optionsContainer}>
                {['ansA', 'ansB', 'ansC', 'ansD'].map((ansKey, index) => {
                    const letter = String.fromCharCode(65 + index);
                    const isSelected = selectedAnswers[currentQuestionIndex] === letter;
                    return (
                        <TouchableOpacity
                            key={ansKey}
                            style={[
                                styles.optionButton,
                                isSelected && styles.selectedOptionButton,
                            ]}
                            onPress={() => handleAnswerSelect(currentQuestion[ansKey], letter)}
                        >
                            <Text style={styles.optionText}>{`${letter}: ${currentQuestion[ansKey]}`}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
            <View style={styles.buttonContainer}>
                {currentQuestionIndex < questions.length - 1 ? (
                    <Button title="Next Question" onPress={handleNextQuestion} />
                ) : (
                    <Button title="Submit Test" onPress={handleSubmit} />
                )}
            </View>
            <ScrollView>
                <View style={styles.questionButtonsContainer}>
                    {questions.map((_, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.questionButton,
                                attemptedQuestions.includes(index) 
                                    ? styles.attemptedQuestionButton
                                    : styles.unattemptedQuestionButton,
                                currentQuestionIndex === index && styles.selectedQuestionButton,
                                !selectedAnswers[index] && styles.unselectedQuestionButton,
                            ]}
                            onPress={() => setCurrentQuestionIndex(index)}
                        >
                            <Text style={styles.questionButtonText}>{index + 1}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    innerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    loadingText: {
        fontSize: 18,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 18,
        textAlign: 'center',
        color: 'red',
    },
    picker: {
        height: 50,
        width: '100%',
        marginVertical: 10,
    },
    questionCountLabel: {
        fontSize: 18,
        marginVertical: 10,
    },
    questionText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 20,
    },
    optionsContainer: {
        marginBottom: 20,
    },
    optionButton: {
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    selectedOptionButton: {
        backgroundColor: '#87cf82',
    },
    buttonContainer: {
        marginVertical: 20,
    },
    questionButtonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    questionButton: {
        width: 40,
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        margin: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    attemptedQuestionButton: {
        backgroundColor: '#87cf82',
    },
    unattemptedQuestionButton: {
        backgroundColor: '#fff',
    },
    selectedQuestionButton: {
        borderColor: 'blue',
        borderWidth: 2,
    },
    unselectedQuestionButton: {
        backgroundColor: '#f5f5f5',
    },
    questionButtonText: {
        fontSize: 16,
    },
});

export default Quiz;
