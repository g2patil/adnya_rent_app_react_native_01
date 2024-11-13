import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PDFView from 'react-native-pdf';

const PDFViewer = ({ route }) => {
    const { filePath } = route.params;

    return (
        <View style={styles.container}>
            {filePath ? (
                <PDFView
                    source={{ uri: filePath }}
                    style={styles.pdf}
                />
            ) : (
                <Text>No PDF file path provided</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pdf: {
        flex: 1,
        width: '100%',
    },
});

export default PDFViewer;
