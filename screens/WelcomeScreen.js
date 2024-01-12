import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Echo! Here</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Query')}
      >
        <Text style={styles.buttonText}>QUERY</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Record')}
      >
        <Text style={styles.buttonText}>RECORD</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF', // Default iOS button color
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    width: '80%', // Set width to 80% of the screen width
    alignItems: 'center', // Center text horizontally
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});