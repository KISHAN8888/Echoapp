import React, { useState } from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { StyleSheet } from 'react-native';

export default function RecordScreen() {
  const [recording, setRecording] = useState(null);

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );

      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    sendAudio(uri); // Call the function to send the audio file
  }

  async function sendAudio(audioUri) {
    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/x-wav', // Change this to the correct MIME type of your audio file
      name: 'recording.wav', // The file name
    });

    try {
      const response = await fetch('http://192.168.227.201:5000/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        console.error('Error uploading audio:', response.status);
        return;
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error uploading audio:', error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {recording ? 'Recording...' : 'Press Start to Record'}
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={recording ? stopRecording : startRecording}
      >
        <Text style={styles.buttonText}>{recording ? 'STOP' : 'START'}</Text>
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
    marginBottom: 10,
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
