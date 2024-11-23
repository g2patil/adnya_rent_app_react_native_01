import React, { useEffect, useState,useContext } from 'react';
import {navigation, TouchableOpacity, View, Text, StyleSheet, Alert, Button, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import config from './my_con';
import { watermarkText, watermarkImage,footerImage } from './watermark'; // Adjust path to watermark.js
import PDFView from 'react-native-pdf';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
//import user_id from 'UserContext';
import { UserContext } from './UserContext';
//import OpenFile from 'react-native-open-file';
import RNFS from 'react-native-fs';
import { DocumentDirectoryPath } from 'react-native-fs';

const Quiz = () => {
   // const { user } = useContext(UserContext);
   // const user_id = user?.user_id;
    const { user_id } = useContext(UserContext);
    const [topics, setTopics] = useState([]);
    const [loadingTopics, setLoadingTopics] = useState(true);
    const [errorTopics, setErrorTopics] = useState(null);
    const [selectedTopicId, setSelectedTopicId] = useState(null);
    const [selectedTopicName, setSelectedTopicName] = useState('');
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
                //`${config.BASE_URL}/adnya/logout`
                const response = await fetch(`${config.BASE_URL}/adnya/exam/get_m_topic`);
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

    const handleTopicSelect1 = (topicId) => {
        const topicName = topics.find((topic) => topic.id === topicId)?.name || 'Unknown Topic';
        setSelectedTopicId(topicId);
        setSelectedTopicName(topicName);
    };

    const handleTopicSelect = (topicId) => {
        const topic = topics.find((t) => t.mTopicId === topicId);
        setSelectedTopicId(topicId);
        setSelectedTopicName(topic?.mTopicName || 'Unknown Topic');
    };
    
    const submitQuizAttempt = async (score) => {
        const payload = {
            userId:  user_id, // Replace with actual user ID
            topicId: selectedTopicId,
            topicName: selectedTopicName,
            score: score,
            totalQuestions: questions.length,
            details: questions.map((question, index) => ({
                questionId: question.questionId,
                userAnswer: selectedAnswers[index] || null,
                correctAnswer:question.correctAnswer,
                
                isCorrect: selectedAnswers[index] === question.correctAnswer,
            })),
            
        };
       // console.log("index "+ index);
        try {
            const response = await fetch(`${config.BASE_URL}/adnya/quiz/saveAttempt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
    
            if (!response.ok) throw new Error('Failed to save quiz attempt');
    
            const result = await response.json();
            console.log('Quiz attempt saved:', result);
            Alert.alert('Success', 'Quiz attempt saved successfully!');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', error.message);
        }
    };
    

    const handleStartTest = async () => {
        if (!selectedTopicId) {
            Alert.alert('Select a Topic', 'Please select a main topic before starting the test.');
            return;
        }
        console.log(`Selected Topic ID: ${selectedTopicId}, Name: ${selectedTopicName}`);

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
    
        console.log("currentSelectedAnswer =    "+currentSelectedAnswer+"  currentQuestion.correctAnswer =   "+ currentQuestion.correctAnswer);
        const Correct_ans = String.fromCharCode(65 + currentQuestionIndex);
        console.log("" +currentQuestionIndex +"      "+Correct_ans);

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
    
    
    const handleSubmit = () => {
         // Calculate the final score based on the selected answers
    const currentSelectedAnswer = selectedAnswers[currentQuestionIndex];
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = currentSelectedAnswer === currentQuestion?.correctAnswer;
    console.log("aaaa ==="+currentSelectedAnswer);

    console.log("bbbb ==="+currentQuestion?.correctAnswer);
    // Calculate the final score manually
    const finalScore = score + (isCorrect ? 1 : 0);

       // const finalScore = score + (selectedAnswers[currentQuestionIndex] === currentQuestion.correctAnswer ? 1 : 0);
        
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
        submitQuizAttempt(finalScore);
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

/******************** */
const navigation = useNavigation();
const generatePDF = async (s) => {
    try {
        const maxLinesPerPage = 54; // Maximum lines per page
        let currentLineCount = 0; // Track the current line count
        let contentChunks = []; // Store content for each page
        let currentChunk = []; // Current content chunk for a page

        // Helper function to add content and manage line count
        const addContent = (html) => {
            const lineCount = Math.ceil(html.length / 100); // Estimate lines based on length
            currentLineCount += lineCount;
            if (currentLineCount >= maxLinesPerPage) {
                // Add page break if the line count exceeds the max
                contentChunks.push(`<div class="page">${currentChunk.join('')}</div>`);
                currentChunk = [];
                currentLineCount = lineCount;
            }
            currentChunk.push(html);
        };

        // Generate the HTML content
        const watermarkHtml = `
            <!-- Watermark Image -->
            <img src="${watermarkImage}" alt="Watermark" style="
                position: fixed;
                top: 50%;
                left: 70%;
                transform: translate(-70%, -70%);
                width: 600px;
                opacity: 0.1;
                z-index: -1;
                pointer-events: none;
            "/>
            <!-- Watermark Text -->
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 60px; color: rgba(0, 0, 0, 0.1); z-index: -1; font-weight: bold; pointer-events: none;">
                ${watermarkText}
            </div>
        `;

        // Add header content
        addContent(`
            <table width="100%" border="0">
                <tr><td colspan="2"><h1 align="center">Quiz Results</h1></td></tr>
                <tr><td colspan="2"><p align="center"><strong>Topic Name:</strong> ${selectedTopicId} / ${selectedTopicName}</p></td></tr>
                <tr><td align="left"><strong>Score:</strong> ${s} out of ${questions.length}</td>
                <td align="right"><strong>Percentage:</strong> ${(s / questions.length * 100).toFixed(2)}%</td></tr>
                <tr><td colspan="2" align="center"><h3>Questions and Answers</h3></td></tr>
            </table>
        `);

        // Add questions and answers
        questions.forEach((question, index) => {
            const questionHtml = `
                <div class="question-container">
                    <div class="question">
                        <table>
                            <tr><td><strong>Question ${index + 1}:</strong> ${question.que}</td></tr>
                            <tr><td>Answer A: ${question.ansA}</td></tr>
                            <tr><td>Answer B: ${question.ansB}</td></tr>
                            <tr><td>Answer C: ${question.ansC}</td></tr>
                            <tr><td>Answer D: ${question.ansD}</td></tr>
                            <tr><td><p class="${selectedAnswers[index] === question.correctAnswer ? 'correct-answer' : 'incorrect-answer'}">
                                <strong>Your Answer:</strong> ${selectedAnswers[index] ? selectedAnswers[index] : 'Not Attempted'}
                            </p></td></tr>
                            <tr><td><p><strong>Correct Answer:</strong> ${question.correctAnswer}</p></td></tr>
                        </table>
                    </div>
                </div>
                <hr/>
            `;
            addContent(questionHtml);
        });

        // Add the last chunk
        if (currentChunk.length > 0) {
            contentChunks.push(`<div class="page">${currentChunk.join('')}</div>`);
        }

        // Combine all chunks with watermark and page breaks
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 10px;
                            color: #333;
                            margin: 10;
                            page-size: A4;
                        }
                        .question {
                            margin: 10px 0;
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
                            margin: 10px 0;
                        }
                        .page {
                            page-break-after: always;
                        }
                        .footer-wrapper {
                            position: fixed;
                            bottom: 10px;
                            width: 100%;
                            text-align: center;
                        }
                        @page {
                            size: A4;
                            margin: 5mm 5mm 0mm;
                        }
                    </style>
                </head>
                <body>
                    ${watermarkHtml}
                    ${contentChunks.join('')}
                   <!-- Footer -->
<div class="footer-wrapper">
    <table border="0" width="80%">
        <tr>
            <td align="center" colspan="2"></td>
        </tr>
        <tr>
            <td align="center" colspan="2"></td>
        </tr>
        <tr>
            <td colspan="2" align="center">
                <img src="${footerImage}" alt="Footer Image" style="
                    width: 700px;
                    opacity: 0.6;
                    position: absolute;
                    bottom: 0;
                    left: 45%;
                    transform: translateX(-50%);
                "/>
            </td>
        </tr>
    </table>
</div>
                </body>
            </div>
        `;

        // PDF options
        const options = {
            html: htmlContent,
            fileName: 'document_with_image_watermark_and_page_breaks',
            directory: 'Documents',
            pageSize: 'A4',
        };

        // Generate PDF
        const file = await RNHTMLtoPDF.convert(options);

        // Show success alert
        Alert.alert('PDF Created', `PDF saved to: ${file.filePath}`);
        const filePath = file.filePath;
        navigation.navigate('PDFViewer', { filePath });
    } catch (error) {
        console.error('Error creating PDF:', error);
        Alert.alert('Error', 'Could not create PDF. Please try again.');
    }
};


const generatePDF1 = async (s) => {
    try {
        // Define HTML content with watermark image and footer
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; color: #333; position: relative;">
                <!-- Watermark Image -->
                <img src="${watermarkImage}" alt="Watermark" style=" 
                    position: fixed;
                    top: 50%;
                    left: 70%;
                    transform: translate(-70%, -70%);
                    width: 600px;
                    opacity: 0.1;
                    z-index: -1;
                    pointer-events: none;
                "/>

                <!-- Watermark Text -->
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 60px; color: rgba(0, 0, 0, 0.1); z-index: -1; font-weight: bold; pointer-events: none;">
                    ${watermarkText}
                </div>

                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 10px;
                            color: #333;
                            margin: 10;
                            page-size: A4;
                        }
                        h1, h2 {
                            color: #3d85c6;
                        }
                        .content {
                                                       flex: 1;
                            padding-bottom: 50px; /* Space for the footer */
                        }



                        .question {
                            margin: 10px 0;
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
                            margin: 10px 0;
                        }
                        
                         .question-container {
        page-break-after: always;
    }
                        /* Footer style */
                        
                        .footer {
                            position: sticky;
                            bottom: 0;
                            background-color: #f1f1f1;
                            bottom: 10px;
                            left: 0;
                            width: 100%;
                            text-align: center;
                            font-size: 12px;
                            color: #555;
                            z-index: -1; /* Ensure it stays on top */
                            page-break-after: always; /* Start new page before footer */
                        }

                        /* Page size for A4 */
                        @page {
                            size: A4;
                            margin: 5mm 5mm 0mm;
                        }

                        /* Ensure the footer is repeated on each page */
                        .content-wrapper {
                            padding-bottom: 10px; /* Adds space for footer */
                        }

                        .footer-wrapper {
                            position: fixed;
                            bottom: 20px;
                            width: 100%;
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <div class="content-wrapper">
                        <div class="content">
                            <table width="100%" border=0>
                                <tr><td colspan="2"> <h1 align="center">Quiz Results</h1></td></tr>
                                <tr><td colspan="2"><p align="center"><strong>Topic Name:</strong> ${selectedTopicId} / ${selectedTopicName}</p></td></tr>
                                <tr><td align="left"><strong>Score:</strong> ${s} out of ${questions.length}</td>
                                <td align="right"><strong>Percentage:</strong> ${(s / questions.length * 100).toFixed(2)}%</td></tr>
                                <tr><td colspan="2" align="center"><h3>Questions and Answers</h3></td></tr>
                                <tr><td></td><td></td></tr>
                            </table>
        
                            ${questions.map((question, index) => `
                                 <div class="question-container">
                                <div class="question">
                                   <table>
                                    <tr><td><strong>Question ${index + 1}:</strong> ${question.que}</td></tr>
                                    <tr><td>Answer A: ${question.ansA}</td></tr>
                                    <tr><td>Answer B: ${question.ansB}</td></tr>
                                    <tr><td>Answer C: ${question.ansC}</td></tr>
                                    <tr><td>Answer D: ${question.ansD}</td></tr>
                                    <tr><td><p class="${selectedAnswers[index] === question.correctAnswer ? 'correct-answer' : 'incorrect-answer'}">
                                        <strong>Your Answer:</strong> ${selectedAnswers[index] ? selectedAnswers[index] : 'Not Attempted'}
                                    </p></td></tr>
                                    <tr><td> <p><strong>Correct Answer:</strong> ${question.correctAnswer}</p></td></tr>
                                    </table>
                                </div>
                                </div>
                                <hr/>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="footer-wrapper">
                    <table border="1" width="90%">
                    <tr>
                    <td align="left">
                        <font color="Blue">Mobile: +919960059223 </font></p>
                    </td>
                    <td align="right">
                        <font color="Blue"> Email: patilg2@yahoo.co.inssss</font>
                    </td>
                    </tr>
                    </table>
                    </div>
                </body>
            </div>
        `;

        // PDF options
        const options = {
            html: htmlContent,
            fileName: 'document_with_image_watermark',
            directory: 'Documents',
            pageSize: 'A4',
        };

        // Generate PDF
        const file = await RNHTMLtoPDF.convert(options);

        // Show success alert
        Alert.alert('PDF Created', `PDF saved to: ${file.filePath}`);
       // const navigation = useNavigation();
        const filePath = file.filePath;
        navigation.navigate('PDFViewer', { filePath });
    } catch (error) {
        console.error('Error creating PDF:', error);
        Alert.alert('Error', 'Could not create PDF. Please try again.');
    }
};




/*********************** */

/******************** */
 
    
   

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
           //   onValueChange={(itemValue) => setSelectedTopicId(itemValue)}
            onValueChange={(itemValue) => handleTopicSelect(itemValue)}
            style={styles.picker}
        >
            <Picker.Item label="Select a topic" value={null} />
            {topics.map((topic) => (
                <Picker.Item key={topic.mTopicId} label={topic.mTopicName} value={topic.mTopicId} />
            ))}
        </Picker>
    );

    const renderQuestionCountPicker = () => {
        const questionCounts = Array.from({ length: 6 }, (_, index) => index * 5 + 5).concat();
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
