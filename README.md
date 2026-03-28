# Mention Network Auto Bot with Alibaba Cloud Qwen API

## 🚀 Changes Made

This bot has been modified to use **Alibaba Cloud Qwen API** instead of Google Gemini API.

### Key Changes:

1. **Removed**: `@google/genai` dependency
2. **Added**: Alibaba Cloud DashScope API integration
3. **Updated**: `chatWithGemini` → `chatWithQwen` function
4. **Changed**: Account structure now uses `alibabaCloudApiKey` instead of `geminiApiKey`

## 📋 Prerequisites

- Node.js 16+ installed
- Alibaba Cloud account with API access
- Mention Network account with bearer token

## 🔧 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure account.json

Create or update your [`account.json`](account.json) file with the following structure:

```json
[
  {
    "bearer": "YOUR_MENTION_NETWORK_BEARER_TOKEN",
    "alibabaCloudApiKey": "sk-YOUR_ALIBABA_CLOUD_API_KEY"
  }
]
```

**Note**: You can add multiple accounts to the array.

### 3. (Optional) Configure proxy.txt

If you want to use proxies, create a [`proxy.txt`](proxy.txt) file with one proxy per line:

```
http://username:password@proxy-ip:port
http://username:password@proxy-ip2:port2
```

## 🚀 Usage

### Start the bot:

```bash
npm start
```

### Start without typing effect:

```bash
npm run dev
```

### Command line options:

- `--no-type`: Disable typing effect for faster responses

## 📊 Bot Features

- ✅ Automatic chat generation using Qwen 3.5 Plus model
- ✅ Interaction submission to Mention Network
- ✅ Proxy support
- ✅ Multiple account support
- ✅ Automatic 24-hour cycle
- ✅ Progress tracking and statistics
- ✅ Retry mechanism (up to 5 attempts)

## 🔑 API Configuration

### Alibaba Cloud API

The bot uses the **Qwen Plus** model by default. The API endpoint is:
```
https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
```

### Available Qwen Models

You can modify the [`chatWithQwen`](index.js:132) function to use different models:
- `qwen-turbo` - Fast, cost-effective
- `qwen-plus` - Balanced performance (default)
- `qwen-max` - Most capable
- `qwen-long` - Long context window

To change the model, edit line 157 in [`index.js`](index.js:157):

```javascript
model: 'qwen-plus',  // Change to desired model
```

## 📝 Account JSON Structure

### Old Structure (Gemini):
```json
{
  "bearer": "token",
  "geminiApiKey": "AIza..."
}
```

### New Structure (Alibaba Cloud):
```json
{
  "bearer": "token",
  "alibabaCloudApiKey": "sk-..."
}
```

## 🐛 Troubleshooting

### Common Issues:

1. **"API key not valid" error**
   - Check that your Alibaba Cloud API key is correct
   - Ensure the key starts with `sk-`
   - Verify your API key has proper permissions

2. **"Invalid response" error**
   - Check your internet connection
   - Verify proxy settings if using proxies
   - Ensure Alibaba Cloud API is accessible from your location

3. **"No recommended questions found" error**
   - Check your Mention Network bearer token
   - Ensure your account is active

## 🔄 Migration from Gemini to Alibaba Cloud

If you have an existing setup with Gemini:

1. **Update [`account.json`](account.json)**:
   - Replace `geminiApiKey` with `alibabaCloudApiKey`
   - Use your Alibaba Cloud API key

2. **Update dependencies**:
   ```bash
   npm install
   ```

3. **Run the bot**:
   ```bash
   npm start
   ```

## 📊 Bot Output Example

```
═════[ Account 1/1 | @ 26/3/2026, 12:10:26 ]═════
 ┊ Used Proxy: http://user:pass@proxy-ip:port
✔  ┊ ✓ User Info Fetched Successfully
 ┊ ┌── User Information ──
 ┊ │ Username: sbnbzr
 ┊ │ User ID: 6894
 ┊ └──
✔  ┊ ✓ Recommended Questions Fetched Successfully
 ┊ ┌── Proses Chat ──
 ┊ ├─ Chat [██████████████████████████████ 2/2] ──
 ┊ │ Message: How can personalized video content enhance customer engagement?
 ┊ ┌── Response Chat API ──
 ┊ │ [Qwen response here...]
 ┊ └──
 ┊ ✓ Chat Sent
 ┊ └──
```

## 📞 Support

For issues or questions:
- Telegram Channel: @NTExhaust
- Check Alibaba Cloud Model Studio documentation: https://modelstudio.console.alibabacloud.com/

## 📄 License

MIT License

---

**Note**: This bot is for educational purposes only. Use responsibly and in accordance with Alibaba Cloud and Mention Network terms of service.
