import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import config from './my_con';

const Quiz = () => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState('');

    const mainTopicId = 1; // Replace with your dynamic value
    const questionCount = 10; // Number of questions
  
    useEffect(() => {
        const loadQuestions = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${config.BASE_URL}/adnya/exam/test?mainTopicId=${mainTopicId}&questionCount=${questionCount}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch questions');
                }

                const fetchedQuestions = await response.json();
                setQuestions(fetchedQuestions);
            } catch (err) {
                setError(err.message);
                Alert.alert('Error', err.message);
            } finally {
                setLoading(false);
            }
        };

        loadQuestions();
    }, []);

    const handleAnswerSelect = (answer) => {
        setSelectedAnswer(answer);
    };

    const handleNextQuestion = () => {
        const currentQuestion = questions[currentQuestionIndex];

        // Only increment score if the selected answer is correct
        if (selectedAnswer === currentQuestion.correctAnswer) {
            setScore(prevScore => prevScore + 1);
        }

        // Move to the next question or finish the quiz
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        } else {
            // Show the final score after all questions have been answered
            Alert.alert('Quiz Completed', `Your score is: ${score + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0)} out of ${questions.length}`);
            // Reset the quiz state for the next attempt
            resetQuiz();
        }

        // Reset selected answer for the next question
        setSelectedAnswer('');
    };

    const resetQuiz = () => {
        setCurrentQuestionIndex(0);
        setScore(0);
    };

    const handleSubmitTest = () => {
        Alert.alert('Quiz Completed', `Your final score is: ${score} out of ${questions.length}`);
        // Here you can reset or navigate to another screen
        resetQuiz();
    };

    if (loading) {
        return <Text style={styles.loadingText}>Loading...</Text>;
    }

    if (error) {
        return <Text style={styles.errorText}>Error: {error}</Text>;
    }

    if (!questions.length) {
        return <Text style={styles.errorText}>No questions available.</Text>;
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <View style={styles.container}>
            <Text style={styles.questionText}>{`Question ${currentQuestionIndex + 1}: ${currentQuestion.que}`}</Text>
            
            <View style={styles.optionsContainer}>
                {['ansA', 'ansB', 'ansC', 'ansD'].map((ansKey) => (
                    <TouchableOpacity
                        key={ansKey}
                        style={[styles.optionButton, selectedAnswer === currentQuestion[ansKey] && styles.selectedOption]}
                        onPress={() => handleAnswerSelect(currentQuestion[ansKey])}
                    >
                        <Text style={styles.optionText}>{`${String.fromCharCode(65 + ['ansA', 'ansB', 'ansC', 'ansD'].indexOf(ansKey))}: ${currentQuestion[ansKey]}`}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.buttonContainer}>
                {currentQuestionIndex < questions.length - 1 ? (
                    <Button title="Next Question" onPress={handleNextQuestion} disabled={!selectedAnswer} />
                ) : (
                    <Button title="Submit Test" onPress={handleSubmitTest} />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    questionText: {
        fontSize: 20,
        marginBottom: 20,
        fontWeight: 'bold',
    },
    optionsContainer: {
        marginBottom: 20,
    },
    optionButton: {
        padding: 15,
        backgroundColor: '#ffffff',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        marginVertical: 5,
    },
    selectedOption: {
        backgroundColor: '#e0e0e0',
    },
    optionText: {
        fontSize: 16,
    },
    buttonContainer: {
        marginTop: 20,
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
});

export default Quiz;
