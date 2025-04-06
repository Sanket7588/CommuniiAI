from flask import Flask, request, jsonify
import PyPDF2
import google.generativeai as genai
import re
import os
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from flask_cors import CORS

model = genai.GenerativeModel('gemini-1.5-flash')
# Path to .env file in root directory
dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env'))
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load .env from root dir
dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env'))
load_dotenv(dotenv_path)

# Get API key
api_key = os.getenv("API_KEY")

# Set up the API key
genai.configure(api_key=api_key)

# Just for testing: list available models
print(genai.list_models())

# Setup Flask
app = Flask(__name__)
CORS(app)  # 👈 This enables CORS
app.config['UPLOAD_FOLDER'] = 'uploads'

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def extract_text_from_pdf(pdf_path):
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
    except Exception as e:
        return f"ERROR: {e}"

def generate_questions_from_resume(resume_text):
    prompt = f"""
You are an AI interview assistant.

Based on the following resume text, generate a list of interview questions (both technical and HR) the candidate might face.

Resume:
\"\"\"{resume_text}\"\"\"

Output just the list of questions numbered 1, 2, 3...
    """
    response = model.generate_content(prompt)
    text = response.text.strip()
    questions = re.findall(r'\d+\.\s+(.*)', text)
    return questions if questions else [text]

@app.route('/upload-pdf', methods=['POST'])
def upload_pdf():
    if 'pdf' not in request.files:
        return jsonify({'error': 'No PDF file uploaded'}), 400

    pdf_file = request.files['pdf']
    filename = secure_filename(pdf_file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    pdf_file.save(file_path)

    resume_text = extract_text_from_pdf(file_path)
    if resume_text.startswith("ERROR:"):
        return jsonify({'error': resume_text}), 500

    questions = generate_questions_from_resume(resume_text)
    return jsonify({'questions': questions})

if __name__ == '__main__':
    app.run(debug=True, port=5000)