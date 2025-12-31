# Backend API Documentation

## Base URL
- **Development:** `http://localhost:3001/api`
- **Production:** `https://your-domain.com/api`

---

## 📋 API Endpoints

### 1. Health Check
Check if the API server is running.

**Endpoint:** `GET /api/health`

**Request:**
```http
GET http://localhost:3001/api/health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2025-12-25T10:00:00.000Z"
}
```

**cURL Example:**
```bash
curl http://localhost:3001/api/health
```

---

### 2. Send Message
Send a user message and get AI response.

**Endpoint:** `POST /api/chat/message`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "What's your return policy?",
  "sessionId": "optional-uuid-string"
}
```

**Field Descriptions:**
- `message` (string, required): User's message (1-2000 characters)
- `sessionId` (string, optional): UUID of existing conversation. Omit for new conversation.

**Response (200 OK):**
```json
{
  "reply": "Our return policy allows returns within 30 days of purchase. Items must be unused and in original packaging. Refunds are processed within 5-7 business days. Return shipping is free for defective items, otherwise there's a $7.99 fee.",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (400 Bad Request) - Validation Error:**
```json
{
  "error": "Message cannot be empty",
  "code": "VALIDATION_ERROR"
}
```

**Response (400 Bad Request) - Message Too Long:**
```json
{
  "error": "Message too long (max 2000 characters)",
  "code": "VALIDATION_ERROR"
}
```

**Response (500 Internal Server Error):**
```json
{
  "error": "Failed to process message",
  "code": "INTERNAL_ERROR"
}
```

**cURL Example - New Conversation:**
```bash
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are your shipping options?"
  }'
```

**cURL Example - Existing Conversation:**
```bash
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Do you ship to Canada?",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

---

### 3. Get Conversation History
Retrieve all messages from a conversation.

**Endpoint:** `GET /api/chat/:sessionId/history`

**URL Parameters:**
- `sessionId` (string, required): UUID of the conversation

**Request:**
```http
GET http://localhost:3001/api/chat/550e8400-e29b-41d4-a716-446655440000/history
```

**Response (200 OK):**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "messages": [
    {
      "id": "msg-uuid-1",
      "role": "user",
      "content": "What's your return policy?",
      "createdAt": "2025-12-25T10:00:00.000Z"
    },
    {
      "id": "msg-uuid-2",
      "role": "assistant",
      "content": "Our return policy allows returns within 30 days...",
      "createdAt": "2025-12-25T10:00:02.000Z"
    },
    {
      "id": "msg-uuid-3",
      "role": "user",
      "content": "Do you ship to Canada?",
      "createdAt": "2025-12-25T10:01:00.000Z"
    },
    {
      "id": "msg-uuid-4",
      "role": "assistant",
      "content": "Yes, we ship to both USA and Canada!",
      "createdAt": "2025-12-25T10:01:02.000Z"
    }
  ]
}
```

**Response (404 Not Found):**
```json
{
  "sessionId": "invalid-uuid",
  "messages": []
}
```

**Response (500 Internal Server Error):**
```json
{
  "error": "Failed to fetch conversation history",
  "code": "INTERNAL_ERROR"
}
```

**cURL Example:**
```bash
curl http://localhost:3001/api/chat/550e8400-e29b-41d4-a716-446655440000/history
```

---

## 🧪 Testing Examples

### JavaScript (Axios)
```javascript
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// 1. Send Message
async function sendMessage(message, sessionId) {
  const response = await axios.post(`${API_URL}/chat/message`, {
    message,
    sessionId,
  });
  return response.data;
}

// 2. Get History
async function getHistory(sessionId) {
  const response = await axios.get(`${API_URL}/chat/${sessionId}/history`);
  return response.data;
}

// Usage
const result = await sendMessage("What's your return policy?");
console.log('AI Reply:', result.reply);
console.log('Session ID:', result.sessionId);

const history = await getHistory(result.sessionId);
console.log('Messages:', history.messages);
```

### Python (Requests)
```python
import requests

API_URL = 'http://localhost:3001/api'

# 1. Send Message
def send_message(message, session_id=None):
    payload = {'message': message}
    if session_id:
        payload['sessionId'] = session_id
    
    response = requests.post(f'{API_URL}/chat/message', json=payload)
    return response.json()

# 2. Get History
def get_history(session_id):
    response = requests.get(f'{API_URL}/chat/{session_id}/history')
    return response.json()

# Usage
result = send_message("What's your return policy?")
print('AI Reply:', result['reply'])
print('Session ID:', result['sessionId'])

history = get_history(result['sessionId'])
print('Messages:', history['messages'])
```

### Postman Collection
```json
{
  "info": {
    "name": "ShopEase Chat API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3001/api/health",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "health"]
        }
      }
    },
    {
      "name": "Send Message - New Conversation",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"message\": \"What's your return policy?\"\n}"
        },
        "url": {
          "raw": "http://localhost:3001/api/chat/message",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "chat", "message"]
        }
      }
    },
    {
      "name": "Send Message - Existing Conversation",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"message\": \"Do you ship to Canada?\",\n  \"sessionId\": \"550e8400-e29b-41d4-a716-446655440000\"\n}"
        },
        "url": {
          "raw": "http://localhost:3001/api/chat/message",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "chat", "message"]
        }
      }
    },
    {
      "name": "Get Conversation History",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3001/api/chat/550e8400-e29b-41d4-a716-446655440000/history",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "chat", "550e8400-e29b-41d4-a716-446655440000", "history"]
        }
      }
    }
  ]
}
```

---

## 🔒 Validation Rules

### Message Validation
- **Minimum length:** 1 character (after trimming)
- **Maximum length:** 2000 characters
- **Auto-trimming:** Leading/trailing whitespace removed
- **Empty check:** Empty or whitespace-only messages rejected

### Session ID Validation
- **Format:** Valid UUID v4 format
- **Optional:** Can be omitted for new conversations
- **Invalid format:** Returns validation error

---

## 🎯 Sample Test Questions

Try these questions to test the AI agent:

### Shipping Questions
```json
{"message": "What are your shipping options?"}
{"message": "Do you offer free shipping?"}
{"message": "How long does shipping take?"}
{"message": "Do you ship internationally?"}
```

### Return Questions
```json
{"message": "What's your return policy?"}
{"message": "How do I return an item?"}
{"message": "Do I need to pay for return shipping?"}
{"message": "How long do refunds take?"}
```

### Payment Questions
```json
{"message": "What payment methods do you accept?"}
{"message": "Can I use PayPal?"}
{"message": "Do you accept credit cards?"}
```

### Store Information
```json
{"message": "What are your business hours?"}
{"message": "How can I contact support?"}
{"message": "What products do you sell?"}
```

---

## 🐛 Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Invalid input (empty message, wrong format, etc.) | 400 |
| `INTERNAL_ERROR` | Server error (database, LLM failure, etc.) | 500 |

---

## 📊 Response Times

- **Health Check:** ~5ms
- **Send Message:** 1-3 seconds (depends on Gemini API)
- **Get History:** ~50-200ms (cached: ~10ms)

---

## 🔄 Flow Diagram

```
User → Frontend → POST /api/chat/message → Backend
                                               ↓
                                        Validate Input
                                               ↓
                                    Get/Create Conversation
                                               ↓
                                        Save User Message
                                               ↓
                                      Get Conversation History
                                               ↓
                                      Call Gemini API (LLM)
                                               ↓
                                      Save AI Response
                                               ↓
                                    Return Reply + SessionID
                                               ↓
Frontend ← Response ← Backend
```

---

## ✅ All Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/chat/message` | Send message & get AI reply |
| GET | `/api/chat/:sessionId/history` | Get conversation history |

---

## 🚀 Quick Test Commands

```bash
# 1. Test Health Check
curl http://localhost:3001/api/health

# 2. Send First Message
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, what are your shipping options?"}'

# 3. Continue Conversation (use sessionId from previous response)
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Do you ship to Canada?", "sessionId": "YOUR-SESSION-ID"}'

# 4. Get History
curl http://localhost:3001/api/chat/YOUR-SESSION-ID/history
```

Your backend is fully functional with 3 main endpoints! 🎉
