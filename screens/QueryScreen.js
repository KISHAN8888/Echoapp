import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet } from 'react-native';

export default function QueryScreen() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);

  async function handleSendQuery() {
    if (query.trim() === '') return;

    // Add the user's query to the messages list
    const newMessages = [...messages, { id: Date.now(), type: 'query', text: query }];
    setMessages(newMessages);

    // Send the query to the backend and wait for the response!!!!!!!!!!!!!!
    try {
      const response = await fetch('http://192.168.227.201:5000/query', { // not sure about this url+
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        console.error('Error from backend:', response.status);
        return;
      }

      const data = await response.json();

      // add response
      setMessages(currentMessages => [
        ...currentMessages,
        { id: Date.now() + 1, type: 'response', text: data.response },
      ]);
    } catch (error) {
      console.error('Error sending query:', error);
    }

    setQuery(''); 
  }

  const renderItem = ({ item }) => (
    <View style={styles.messageContainer}>
      <Text style={item.type === 'query' ? styles.queryText : styles.responseText}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        style={styles.messagesList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          onChangeText={text => setQuery(text)}
          value={query}
          placeholder="Write your query"
          onSubmitEditing={handleSendQuery} 
        />
        <Button title="Send" onPress={handleSendQuery} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesList: {
    flex: 1,
  },
  messageContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  queryText: {
    textAlign: 'left',
    color: 'blue',
  },
  responseText: {
    textAlign: 'right',
    color: 'green',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
});


