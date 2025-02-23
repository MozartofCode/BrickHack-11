# AI-Powered Conversational Assistant – BrickHack 11 Hackathon Project  

**An interactive, AI-driven mock interview assistant that leverages GenAI for seamless conversations, integrating speech recognition, text-to-speech, and agentic AI workflows.**  

## 📌 Overview  
This project was developed for **BrickHack 11 (Feb 22-23, 2025) at Rochester Institute of Technology (RIT)** and submitted for the **Best Use of GenAI** and **Best Use of AI** categories.  

The assistant combines **speech-to-text, text-to-speech, and AI-powered conversational agents** to provide a natural, responsive user experience. It runs with a lightweight **local database structure**, eliminating reliance on third-party databases for simplicity and faster access.  

## 🔥 Key Features  
✅ **Conversational AI** – Uses **OpenAI API** and **CrewAI** for multi-agent interactions.  
✅ **Voice Interaction** – Supports **speech-to-text** and **text-to-speech** using Google’s browser-based API.  
✅ **Local Database Storage** – Stores and retrieves user data **without third-party databases**.  
✅ **Modern Web Interface** – Built with **Next.js** (with UI components styled via **Create.xyz**).  
✅ **Flask Backend** – Manages API requests and communication between AI models.  

## 🏗️ Tech Stack  
- **Frontend:** Next.js (React Framework)  
- **Backend:** Flask (Python)  
- **AI Framework:** CrewAI (Agentic AI Framework)  
- **Natural Language Processing:** OpenAI API  
- **Voice Processing:** Google Speech-to-Text & Text-to-Speech  
- **Database:** Local file-based storage system  

## 🛠️ Installation & Setup  
### **Clone the repository:**  
```sh
git clone https://github.com/MozartofCode/BrickHack-11.git
cd BrickHack-11
```

### **Backend Setup (Flask + AI Agents)**  
1. Navigate to the backend folder:  
   ```sh
   cd backend
   ```
2. Create a virtual environment (optional but recommended):  
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows, use 'venv\Scripts\activate'
   ```
3. Install dependencies:  
   ```sh
   pip install -r requirements.txt
   ```
4. Start the Flask backend server:  
   ```sh
   flask run
   ```

### **Frontend Setup (Next.js)**  
1. Navigate to the frontend folder:  
   ```sh
   cd frontend
   ```
2. Install dependencies:  
   ```sh
   npm install
   ```
3. Start the frontend server (default: `localhost:3000`):  
   ```sh
   npm run dev
   ```

## 🎯 How It Works  
1️⃣ **User speaks into the microphone**, and **speech-to-text** converts it into text.  
2️⃣ The AI assistant **processes the query** using **OpenAI API** and **CrewAI agents**.  
3️⃣ The assistant **retrieves or stores relevant information** using the local database system.  
4️⃣ The AI **generates a response** and **converts it back into speech** for natural interaction.  

## 🚧 Future Enhancements  
🔹 **Multi-Agent Conversations** – Enable AI agents to collaborate on complex queries.  
🔹 **Memory & Personalization** – Store and recall user interactions for more personalized responses.  
🔹 **Real-Time Speech Translation** – Support multi-language communication.  
🔹 **Cloud-Based Database Option** – Offer an alternative for users who prefer cloud storage.  

## 🏆 Hackathon Submission  
This project was created by **Bertan Berker & Josh Seyse** for **BrickHack 11** at RIT, competing in:  
🏅 **Best Use of GenAI**  
🏅 **Best Use of AI**  

## 📬 Contact  
**Authors:**  
- **Bertan Berker** – 📧 bb6363@rit.edu | 💻 GitHub: [MozartofCode](https://github.com/MozartofCode)  
- **Josh Seyse**  
