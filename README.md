# AI PDF Summarizer

A powerful Flask web application that extracts text from PDF files and generates intelligent AI-powered summaries using Google's Gemini API. The app supports multiple summarization styles and allows users to download summaries in various formats (TXT, PDF, DOCX).

---

## Features

✨ **PDF Text Extraction**: Automatically extracts text from PDF files using PyPDF2 and pdfplumber

🤖 **AI-Powered Summarization**: Uses Google Gemini 2.5 Flash model for high-quality summarization

📋 **Multiple Summary Styles**:
- **Brief**: 3-sentence concise summary
- **Standard**: 5-point bullet summary (default)
- **Detailed**: 8-point comprehensive summary
- **Bullet**: Structured hierarchical bullet points
- **Academic**: Formal summary with methodology and conclusions

📥 **Multi-Format Download**: Export summaries as:
- TXT (Plain text)
- PDF (Formatted document)
- DOCX (Microsoft Word document)

💾 **Summary History**: SQLite database stores all processed summaries with metadata

⭐ **Rating System**: Rate summaries for quality feedback

🔄 **Real-Time Progress**: WebSocket-based real-time extraction progress updates

🎨 **Modern UI**: Responsive web interface with light/dark theme toggle

📊 **Statistics Dashboard**: View app-wide statistics and usage metrics

---

## Tech Stack

### Backend
- **Framework**: Flask 3.0.0
- **API Client**: Google Generative AI SDK (google-generativeai 0.8.5)
- **Database**: SQLite with Flask-SQLAlchemy
- **Real-Time Communication**: Flask-SocketIO & Eventlet
- **PDF Processing**: PyPDF2, pdfplumber
- **Document Generation**: ReportLab, python-docx

### Frontend
- HTML5, CSS3, JavaScript
- Bootstrap/Custom CSS for responsive design
- Socket.IO for real-time updates

### Dependencies
- Python 3.8+
- All dependencies listed in `requirements.txt`

---

## Installation

### Prerequisites
- Python 3.8 or higher
- pip package manager
- Google Cloud API key with Generative AI access
- Virtual environment (recommended)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/ai-pdf-summarizer.git
cd ai-pdf-summarizer
```

### Step 2: Create and Activate Virtual Environment

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

Create a `.env` file in the project root directory:

```plaintext
GEMINI_API_KEY=your_google_cloud_api_key_here
GEMINI_MODEL_ID=gemini-2.5-flash
FLASK_SECRET_KEY=your_secret_key_here
MAX_FILE_SIZE_MB=10
MAX_TEXT_LENGTH=8000
```

**Where to get GEMINI_API_KEY:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API key"
3. Copy your API key and paste it in `.env`

### Step 5: Run the Application

```bash
python3 app.py
```

The app will start at `http://localhost:5001`

---

## Usage

### Web Interface

1. **Open the Application**
   - Navigate to `http://localhost:5001` in your web browser

2. **Upload a PDF**
   - Click "Choose File" and select a PDF document
   - Select your preferred summarization style
   - Click "Summarize"

3. **View Results**
   - Wait for text extraction and AI summarization to complete
   - Real-time progress will be displayed
   - Summary appears on screen with metadata (page count, word count)

4. **Download Summary**
   - Choose format: TXT, PDF, or DOCX
   - Click "Download" to save the summary

5. **View History**
   - Click "History" to see all previously processed summaries
   - Rate summaries for quality feedback
   - Delete entries as needed

6. **View Statistics**
   - Dashboard shows total summaries processed, average rating, total pages

---

## API Endpoints

### POST `/summarize`
Summarize a PDF file

**Parameters:**
- `pdf_file` (file): The PDF file to summarize
- `summary_type` (string): Type of summary (brief, standard, detailed, bullet, academic)

**Response:**
```json
{
  "success": true,
  "summary": "Generated summary text...",
  "filename": "document.pdf",
  "page_count": 5,
  "word_count": 2450,
  "summary_type": "standard",
  "history_id": 1
}
```

### GET `/history`
Get all summary history

**Response:**
```json
[
  {
    "id": 1,
    "filename": "document.pdf",
    "summary_text": "...",
    "summary_type": "standard",
    "page_count": 5,
    "word_count": 2450,
    "rating": 5,
    "created_at": "2025-11-03 10:30:00"
  }
]
```

### GET `/history/<id>`
Get specific history item

### POST `/history/<id>/rate`
Rate a summary

**Body:**
```json
{
  "rating": 5
}
```

### DELETE `/history/<id>/delete`
Delete a history entry

### GET `/download/<format>`
Download summary

**Parameters:**
- `format`: txt, pdf, or docx
- `summary`: Summary text (query string)
- `filename`: Original filename (query string)

### GET `/stats`
Get application statistics

**Response:**
```json
{
  "total_summaries": 15,
  "avg_rating": 4.5,
  "total_pages_processed": 125
}
```

---

## Project Structure

```
ai-pdf-summarizer/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (create manually)
├── .gitignore            # Git ignore rules
├── README.md             # This file
│
├── templates/
│   └── index.html        # Main web interface
│
├── static/
│   ├── css/
│   │   └── style.css     # Application styling
│   ├── js/
│   │   └── script.js     # Frontend logic
│   └── uploads/          # Temporary PDF uploads (auto-created)
│
└── instance/
    └── history.db        # SQLite database (auto-created)
```

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Cloud API key for Gemini | Required |
| `GEMINI_MODEL_ID` | Model ID to use | `gemini-2.5-flash` |
| `FLASK_SECRET_KEY` | Flask session secret key | Random if not set |
| `MAX_FILE_SIZE_MB` | Maximum PDF file size in MB | 10 |
| `MAX_TEXT_LENGTH` | Maximum text to send to API | 8000 |

---

## How It Works

1. **PDF Upload**: User uploads a PDF file via web interface
2. **Text Extraction**: PyPDF2/pdfplumber extracts text with real-time progress
3. **Preprocessing**: Text is cleaned and truncated if needed
4. **API Call**: Text is sent to Google Gemini API for summarization
5. **Storage**: Summary and metadata stored in SQLite database
6. **Display**: Summary returned to frontend and displayed to user
7. **Export**: User can download in multiple formats

---

## Error Handling

The application includes comprehensive error handling:

- **Invalid API Key**: Fails gracefully with helpful error message
- **File Upload Errors**: Validates file type and size
- **Text Extraction Failures**: Falls back to alternative PDF reader
- **API Failures**: Catches and reports Gemini API errors
- **Database Errors**: Handles SQLite connection issues

---

## Performance Considerations

- **PDF Size Limit**: Default 10MB (configurable via `MAX_FILE_SIZE_MB`)
- **Text Limit**: Default 8000 characters sent to API (configurable)
- **Caching**: Summary history cached in SQLite for fast retrieval
- **Async Processing**: WebSocket updates provide real-time feedback
- **Rate Limiting**: Google Gemini API rate limits apply based on your quota

---

## Security

- **API Key Protection**: Never commit `.env` file with actual keys
- **CORS Configuration**: Flask-SocketIO configured for secure cross-origin requests
- **File Validation**: Only PDF files accepted
- **SQL Injection Prevention**: SQLAlchemy ORM prevents injection attacks
- **Input Sanitization**: File names sanitized before processing

---

## Troubleshooting

### ModuleNotFoundError: No module named 'flask'

**Solution**: Ensure virtual environment is activated and dependencies installed:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### ValueError: Please set GEMINI_API_KEY

**Solution**: Create `.env` file with valid `GEMINI_API_KEY`:
```bash
echo "GEMINI_API_KEY=your_key_here" > .env
```

### Error: "You exceeded your current quota"

**Solution**: Check Google Cloud billing settings and ensure API is enabled

### PDF extraction fails

**Solution**: Try different PDF format or check file integrity. App falls back to PyPDF2 automatically.

### Port 5001 already in use

**Solution**: Change port in `app.py`:
```python
socketio.run(app, debug=True, host='0.0.0.0', port=5002)
```

---

## Limitations

- **API Quota**: Limited by Google Gemini API quota and billing
- **PDF Size**: Large PDFs (>10MB) may exceed file size limit
- **Text Length**: Very long documents are truncated to 8000 characters
- **Languages**: Best performance with English documents
- **OCR**: Cannot extract text from image-based PDFs

---

## Future Enhancements

- [ ] Support for multiple file formats (DOCX, PPT, etc.)
- [ ] Batch PDF processing
- [ ] User authentication and multi-user support
- [ ] Advanced export with formatting options
- [ ] Comparison tool for multiple summaries
- [ ] Custom prompt support
- [ ] API endpoint rate limiting
- [ ] Summary sharing via links
- [ ] Mobile app version

---

## Contributing

Contributions are welcome! Here's how to contribute:

1. **Fork the repository**
```bash
git clone https://github.com/yourusername/ai-pdf-summarizer.git
```

2. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

3. **Make your changes** and commit
```bash
git add .
git commit -m "Add your feature description"
```

4. **Push to your fork**
```bash
git push origin feature/your-feature-name
```

5. **Create a Pull Request** on GitHub

---

## License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## Author

**Your Name / GitHub Username**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## Acknowledgments

- [Google Generative AI SDK](https://github.com/google-gemini/generative-ai-python)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [PyPDF2 Documentation](https://pypdf2.readthedocs.io/)
- [pdfplumber Documentation](https://github.com/jsvine/pdfplumber)

---

## Support

If you encounter issues or have questions:

1. **Check Troubleshooting section** above
2. **Open an Issue** on GitHub
3. **Check Google Gemini API docs** for API-related questions
4. **Review logs** for detailed error messages

---

## Changelog

### Version 1.0.0 (2025-11-03)
- Initial release
- PDF text extraction
- Google Gemini API integration
- Multiple summary styles
- Multi-format export
- Summary history tracking
- Real-time progress updates
- Statistics dashboard

---

## Disclaimer

This application uses Google's Gemini API, which may incur costs based on your usage. Please review [Google Cloud Pricing](https://cloud.google.com/generative-ai/pricing) before use. The authors are not responsible for any charges incurred.

---

**Happy summarizing!** 🚀
