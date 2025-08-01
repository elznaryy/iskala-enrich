# 🔑 API Key Setup Instructions

## Where to Add Your BetterContact API Key

### Step 1: Create Environment File
1. In your project root directory (where package.json is located), create a file named `.env.local`
2. If the file already exists, open it

### Step 2: Add Your API Key
Add this line to your `.env.local` file:

```
BETTERCONTACT_API_KEY=your_actual_api_key_here
```

**Replace** `your_actual_api_key_here` with your real BetterContact API key.

### Step 3: Example .env.local File
Your `.env.local` file should look like this:

```
BETTERCONTACT_API_KEY=bc_live_1234567890abcdef
NEXT_PUBLIC_APP_NAME=iSkala Enrich
```

### Step 4: Restart the Development Server
After adding your API key:

1. Stop the development server (Ctrl+C)
2. Start it again with: `npm run dev`

## ✅ How to Test if it Works

1. Go to http://localhost:3000
2. Click "Individual Lookup"
3. Fill out the form and submit
4. If you see "Enrichment started!" - your API key is working!
5. If you see an error about API key - check your `.env.local` file

## 🔒 Security Notes

- **.env.local** is automatically ignored by Git (won't be uploaded to repositories)
- Never share your API key publicly
- Each API key is unique to your BetterContact account

## 🚫 Common Issues

### "No API Key" Error
- Make sure the file is named exactly `.env.local` (with the dot at the beginning)
- Make sure there are no extra spaces around the = sign
- Restart your development server after adding the key

### "Invalid API Key" Error  
- Double-check your API key from your BetterContact dashboard
- Make sure you copied the entire key without extra characters

## 📍 Where to Get Your API Key

1. Login to your BetterContact account
2. Go to Settings or API section
3. Generate or copy your API key
4. Paste it in the `.env.local` file

---

**Current Status:** Your `.env.local` file has been created with a placeholder. Replace `your_api_key_here` with your actual BetterContact API key. 