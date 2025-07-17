# 🔑 API Key Setup Instructions

## 🚨 Important: API Key Configuration Required

Your text analysis application requires a valid OpenRouter API key to function. Follow these steps to set it up:

### 1. Get Your OpenRouter API Key

1. **Visit**: https://openrouter.ai/
2. **Sign Up/Login**: Create an account or log in
3. **Navigate to API Keys**: Go to your dashboard → API Keys
4. **Create New Key**: Click "Create API Key"
5. **Copy the Key**: Save it securely (starts with `sk-or-v1-`)

### 2. Update Your Application

Open `script.js` and replace this line:
```javascript
const API_KEY = 'sk-or-v1-YOUR_API_KEY_HERE';
```

With your actual API key:
```javascript
const API_KEY = 'sk-or-v1-your-actual-api-key-here';
```

### 3. Alternative: Environment Variables

For better security, you can use environment variables:

1. **Create `.env` file**:
```
OPENROUTER_API_KEY=sk-or-v1-your-actual-api-key-here
```

2. **Update script.js**:
```javascript
const API_KEY = process.env.OPENROUTER_API_KEY || 'sk-or-v1-YOUR_API_KEY_HERE';
```

### 4. Test Your Setup

1. **Start the server**: `python -m http.server 8000`
2. **Open the app**: http://localhost:8000
3. **Test text analysis**: Enter some text and click "Summarize"
4. **Verify**: Should work without 401 authentication errors

### 5. Troubleshooting

**If you get 401 errors:**
- ✅ Check API key is correct and complete
- ✅ Ensure no extra spaces or characters
- ✅ Verify account has sufficient credits
- ✅ Try regenerating the API key

**If you get other errors:**
- ✅ Check network connection
- ✅ Verify OpenRouter service status
- ✅ Try a different model (e.g., `gpt-3.5-turbo`)

### 6. Free Models Available

OpenRouter offers several free models:
- `mistralai/mistral-7b-instruct:free`
- `microsoft/phi-3-mini-128k-instruct:free`
- `google/gemma-2-9b-it:free`

### 7. Cost Information

- **Free tier**: Limited daily requests
- **Paid tier**: Pay per token used
- **Rates**: Vary by model, very affordable

---

## 🔒 Security Note

- Never commit API keys to public repositories
- Use environment variables for production
- Rotate keys regularly
- Monitor usage on OpenRouter dashboard

**Once you've set up your API key, your text analysis application will be fully functional!** 🚀
