# Text Analysis AI

A modern web application for AI-powered text analysis with persistent history storage.

## Features

- **AI Text Analysis**: Summarization, key notes extraction, detailed explanations, and deep analysis
- **Interactive UI**: Beautiful particle background with responsive design
- **Work History**: Persistent storage of all analysis results in Supabase
- **Question & Answer**: Ask questions about analyzed content
- **Export Functionality**: Download work history as JSON

## Files

- `index.html` - Main application interface
- `script.js` - JavaScript logic for AI processing and database interactions
- `style.css` - Styling and responsive design
- `.env` - API keys and configuration
- `setup-simple.sql` - Database setup script for Supabase

## Setup

1. **Database Setup**: 
   - Run the SQL commands in `setup-simple.sql` in your Supabase dashboard
   - Update API keys in `script.js` if needed

2. **Run the Application**:
   ```bash
   python3 -m http.server 3000
   ```

3. **Access**: Open `http://localhost:3000/index.html`

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **AI Processing**: OpenRouter API with Mistral 7B
- **Database**: Supabase (PostgreSQL)
- **3D Graphics**: Three.js for particle background

## API Configuration

- **Text Analysis**: OpenRouter API with Mistral 7B model
- **Database**: Supabase REST API for work history storage
- **Fallback**: Local storage for offline functionality
