from flask import Flask, request, jsonify
import pymongo

from utils import generate_summary, generate_embedding, insert_in_db, search_database, generate_transcript
import os
from werkzeug.utils import secure_filename







app = Flask(__name__)


# mongodb client setup, adding hf_token url and stuff

client = pymongo.MongoClient("mongodb+srv://userx:usery@emoai2.yxn6itg.mongodb.net/")
hf_token = "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"
embedding_url = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"

db = client["tab"]
collection = db["summaries"]

# fun for uploading the audio

@app.route('/upload', methods=['POST'])
def upload_audio():
    
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio']
    filename = secure_filename(audio_file.filename)
    audio_path = os.path.join('/pathtosaveaudio', filename)
    audio_file.save(audio_path)

    # process the audio file to generate a transcript
    full_transcript = generate_transcript(audio_path)

    # generate a summary from the transcript
    summary = generate_summary(full_transcript)

    # generate an embedding from the summary
    embedding = generate_embedding(summary)

    # insert the summary and embedding into mongodbbbb
    insert_in_db( embedding, summary)

    return jsonify({'message': 'Audio processed successfully'}), 200



# fun for handling the query

@app.route('/query', methods=['POST'])
def query():
    

    query_text = request.json.get('query', '')

    # generate embedding for the query
    query_embedding = generate_embedding(query_text)

    print(query_embedding)

    # search mongodb for the most relevant summary
    author_1_content = search_database( query_text)

    # return the chat response
    if author_1_content:
        return jsonify({'response': author_1_content}), 200
    else:
        return jsonify({'error': 'No relevant summary found'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=8081)