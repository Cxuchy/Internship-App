<p align="center">
  <img src="https://raw.githubusercontent.com/Cxuchy/Internship-App/refs/heads/master/Client/src/assets/img/favicon.png" alt="Logo" width="100">
</p>

# Welcome To Fetchtern - https://fetchtern.netlify.app/
# 📌 Overview

This project is a job search platform built with the MEAN stack (MongoDB, Express, Angular, Node.js).
It allows users to search, save, and evaluate job opportunities from popular websites (LinkedIn , Indeed , TanitJobs , KeeJobs...). 

The system integrates AI-powered resume analysis to provide a personalized match score between a candidate’s CV and available job offers.

# 🚀 Features

- 🔎 Job Offer Extraction – Scrapes job postings from platforms such as LinkedIn and Indeed.

- 📂 CV Upload & Parsing – Users can upload their resumes, which are processed and analyzed.

- 🤖 AI Matching Engine – Compares CV data with job descriptions and generates a match score with detailed feedback (strengths & weaknesses).

- 💾 Save & Manage Offers – Users can save interesting job offers and track their evaluation results.

- 👤 User Accounts – Secure authentication and profile management.

- 📊 Dashboard – Displays saved offers, scores, and insights for better decision-making.

- ⏰ Bot Task Scheduler – Automates background tasks:

    -Scheduled scraping of new job postings.
    
    -Notifications to users when new matches are found.

# 🛠️ Tech Stack

- Frontend: Angular

- Backend: Node.js + Express

- Database: MongoDB

- AI/LLM Layer: Resume parsing and job–CV matching (Ollama gemma3)

- Deployment: Azure + Docker + Docker Swarm + Nginx + Cert + Netlify 


# 📂 Project Structure

```bash
  /Client      -> Angular application (UI)
  /Server       -> Node.js + Express REST API
```


# 👤 Author

- [@Yassine Bouaita AKA Cxuchy ](https://www.linkedin.com/in/yassine-bouaita-a7230323a/)



