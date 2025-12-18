# The TrASH (Trump Automated Search Hub) Search Engine

This project is a full-stack web application designed to index, search, and manage a collection of Donald J. Trump's Facebook posts. It features a Python/Flask backend, an ElasticSearch database, and a static HTML/CSS/JavaScript frontend.

**Authors:**

- Athanasios Davaris, Dit Uop
- Ioannis Spanoudakis, Dit Uop

## Disclaimer

This project was developed as a university assignment for an Information Retrieval and Mining course. The theme and dataset were chosen for educational and technical demonstration purposes only.

This application does not aim to harm, taunt, or harass any individual. It is a neutral technical exercise and does not intend to promote or push any political agenda. All content indexed by this search engine is publicly available data.

## Features

- **Full-Text Search:** Perform powerful searches on post content and titles. Supports Boolean operators (`+` for AND, `|` for OR), phrase searches (`"..."`), and more.
- **Advanced Filtering:** A dynamic UI to filter results by the number of likes, comments, shares, or by post type and publication date.
- **Find Similar:** Select any post to find the top 10 most textually similar posts in the database.
- **Data Management:**
  - **Delete:** Remove any post directly from the search results.
  - **Import:** Upload a new CSV file of posts to add them to the search index.
- **Random Post:** A "Feeling Lucky" button to open a random post from the database.
- **Modern UI:** A clean, responsive user interface with light/dark modes and non-blocking notifications.

## Prerequisites

Before you begin, ensure you have the following software installed on your system:

1.  **Python:** Version 3.8 or higher.
2.  **Docker Desktop:** The latest version. This is required to run the ElasticSearch database.

## Setup and Installation Guide

Follow these steps in order to get the application running locally.

### 1. Clone the Repository

Open your terminal and clone this project to your local machine:

```bash
git clone https://github.com/AthanasiosDavaris/trash-search-engine.git
cd trash-search-engine
```

### 2. Set Up the Python Environment

Create and activate a Python virtual environment. This keeps the project's dependencies isolated.

```bash
# Create the virtual environment
python -m venv venv

# Activate the environment (command depends on your OS)
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

Once the environment is active, install all the required Python libraries:

```bash
pip install -r requirements.txt
```

### 3. Start the Database (ElasticSearch)

The database runs inside a Docker container.

**First, ensure Docker Desktop is running on your machine.**

Then, run the following command in your terminal to download and start the ElasticSearch container. This only needs to be done once.

```bash
docker run -d -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -e "xpack.security.enabled=false" --name trash-es elasticsearch:8.11.1
```

_If you have run this before, you can simply start the existing container with `docker start trash-es`._

**Wait about 60 seconds** for the database to initialize. You can verify it's working by opening http://localhost:9200 in your web browser. You should see a JSON response with the tagline "You Know, for Search".

### 4. Index the Data

Now, run the script to load the `trump_posts.csv` data into the ElasticSearch database.

Make sure your virtual environment `(venv)` is still active, and run this command from the project's root directory:

```bash
python backend/index_data.py
```

You should see a series of success messages, ending with `Successfully indexed ... documents.`

### 5. Run the Backend Server

Finally, start the Flask web server.

In the same terminal (with `venv` active), run the following commands:

```bash
# On Windows:
set FLASK_APP=backend/app.py
flask run

# On macOS/Linux:
export FLASK_APP=backend/app.py
flask run
```

The server will now be running and listening on http://localhost:5000.

## How to Use the Application

1. **Open the Frontend**: Navigate to the `frontend/` directory in your file explorer.
2. **Open** `index.html` in your preferred web browser (e.g., Chrome, Firefox).
3. You can now use the application!
