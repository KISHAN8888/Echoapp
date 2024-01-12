import requests
import google.generativeai as palm
import speech_recognition as sr
import os
import pymongo


# configure API keys and stuff
palm.configure(api_key='AIzaSyAgLq3ekvXz5Z5S-gklC3B8ZmOViAAXB9I')

client = pymongo.MongoClient("mongodb+srv://userx:usery@emoai2.yxn6itg.mongodb.net/")
hf_token = "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"
embedding_url = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"

db = client["tab"]
collection = db["summaries"]

def recognize_speech(filename):
    r = sr.Recognizer()
    with sr.AudioFile(filename) as source:
        audio = r.listen(source)
        text = r.recognize_google(audio)
    return text

def generate_transcript(audio_path):
    return recognize_speech(audio_path)

def generate_summary(full_transcript):
    summary1 = palm.chat(context=" Generate a summary of this conversation without loosing the context and keywords so that in future i can query with this summary and don't make up things by your own. use this message and generate a short summary as this is a conversation. :", messages=full_transcript)
    message_content = next((msg['content'] for msg in summary1.messages if msg['author'] == '1'), None)
    return message_content

def generate_embedding(text: str) -> list:
    response = requests.post(
        embedding_url,
        headers={"Authorization": f"Bearer {hf_token}"},
        json={"inputs": text})

    if response.status_code != 200:
        raise ValueError(f"Request failed with status code {response.status_code}: {response.text}")

    return response.json()

def insert_in_db( embedding, summary):
    document = {"transcript_id": 1, "summary_embedding": embedding, "summary": summary}
    collection.insert_one(document)

def search_database( query_text ):

    query_embedding = generate_embedding(query_text)


    # Search mongo for the most relevant summary
    results = collection.aggregate([
        {"$vectorSearch": {
            "queryVector": query_embedding,
            "path": "summary_embedding",
            "numCandidates": 384,
            "limit": 1,
            "index": "tryingtab",
        }}
    ])

    for document in results:
        result = (f'summary : {document["summary"]}\n')

    # taking query response from llm
    query_response = palm.chat(context = "Strictly answer based on this. Don't make up things by your own use this as a knowledge base and be real with this: "+result , messages= query_text )

    # printing the content of response
    author_1_content = next((msg['content'] for msg in query_response.messages if msg['author'] == '1'), None)

    return author_1_content

