from flask import Flask, jsonify, request, Blueprint
from flask_cors import CORS

import requests
from bs4 import BeautifulSoup
from openai import OpenAI
import re

import google.generativeai as genai
import os

genai_api_key = os.getenv("GENAI_API_KEY")
pinecone_api_key = os.getenv("PINECONE_API_KEY")
pinecone_host = os.getenv("PINECONE_HOST")

genai.configure(api_key=genai_api_key)

from pinecone import Index, Pinecone
import os

app = Flask(__name__)
CORS(app)

pc = Pinecone(
        api_key=pinecone_api_key
    )

embedding_processor = Blueprint('embedding_processor', __name__)

index = pc.Index(host=pinecone_host)

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Web Content Processing API!"})

@app.route('/qa', methods=['POST'])
def answer_question():
    question = request.json.get('question')
    context = request.json.get('context')

    print("Answering question:")
    if not question or not context:
        return jsonify({"error": "Question and context are required"}), 400

    try:
        prompt = f"Answer the following question based on the context:\nContext: {context}\nQuestion: {question}"

        
        model = genai.GenerativeModel("gemini-1.5-flash")

        response = model.generate_content(prompt)

        
        answer = response.candidates[0].content.parts[0].text.strip()
        print(answer)

        clean_answer = re.sub(r'\*\*(.*?)\*\*', r'\1', answer)  
        print(clean_answer)

        return jsonify({"answer": clean_answer}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def clean_content(content):
    try:
        
        content = re.sub(r'\*\*(.*?)\*\*', r'\1', content)
        
        
        content = re.sub(r'<[^>]*>', '', content)

        return content
    except Exception as e:
        print(f"Error cleaning content: {str(e)}")
        return content  


@app.route("/scrape", methods=["POST"])
def scrape_website():
    print("Scraping initiated.")
    url = request.json.get('url')
    if not url:
        return jsonify({"error": "URL is required"}), 400

    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        raw_content = ' '.join([element.text for element in soup.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])])

        cleaned_content = clean_content(raw_content)

        return jsonify({"content": cleaned_content}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/process', methods=['POST'])
def process_gemini():
    content = request.json.get('content')
    if not content:
        return jsonify({"error": "Content is required"}), 400

    try:
        result = genai.embed_content(
                model="models/text-embedding-004",
                content=content)

        
        embeddings = result['embedding']
        
        index.upsert([(str(hash(content)), embeddings, {"text": content})])
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

