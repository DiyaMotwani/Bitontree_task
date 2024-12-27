from flask import Flask, jsonify, request, Blueprint

from flask_cors import CORS
from bs4.element import Comment
import requests
from bs4 import BeautifulSoup
import re
from dotenv import load_dotenv
load_dotenv()

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


@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({"error": "Request payload too large"}), 413
pc = Pinecone(
        api_key=pinecone_api_key
    )

embedding_processor = Blueprint('embedding_processor', __name__)

index = pc.Index(host=pinecone_host)
def is_visible_text(element):
    
    if element.parent.name in ['style', 'script', 'head', 'title', 'meta', '[document]']:
        return False
    if isinstance(element, Comment):
        return False
    return True


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
        if not re.match(r'^https?://', url):
            return jsonify({"error": "Invalid URL format"})
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        texts = soup.find_all(string=True)
        visible_texts = filter(is_visible_text, texts)

        
        raw_content = ' '.join(text.strip() for text in visible_texts)


        cleaned_content = clean_content(raw_content)

        return jsonify({"content": cleaned_content}), 200

    except requests.exceptions.MissingSchema:
        return jsonify({"error": "Invalid URL. Make sure the URL starts with http:// or https://"}), 400
    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Failed to connect to the URL. Please check the URL or your internet connection."}), 500
    except requests.exceptions.HTTPError as e:
        return jsonify({"error": f"HTTP error occurred: {e.response.status_code}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/process', methods=['POST'])
def process_gemini():
    content = request.json.get('content')
    if not content:
        return jsonify({"error": "Content is required"}), 400

    
    def split_text(content, max_tokens=2048, token_estimation_ratio=4):
        max_characters = max_tokens * token_estimation_ratio
        chunks = []
        while len(content) > max_characters:
            split_index = content[:max_characters].rfind('.') + 1
            if split_index == 0:
                split_index = max_characters
            chunks.append(content[:split_index])
            content = content[split_index:]
        chunks.append(content)
        return chunks

    try:
        text_chunks = split_text(content)
        all_embeddings = []

        for chunk in text_chunks:
            result = genai.embed_content(
                model="models/text-embedding-004",
                content=chunk
            )
            embeddings = result['embedding']
            all_embeddings.append(embeddings)

            index.upsert([(str(hash(chunk)), embeddings, {"text": chunk})])

        return jsonify({"status": "success", "chunks_processed": len(all_embeddings)}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

