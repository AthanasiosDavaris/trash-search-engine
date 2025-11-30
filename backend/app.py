from flask import Flask, request, jsonify
from flask_cors import CORS
from elasticsearch import Elasticsearch

# Connection with ElasticSearch
es = Elasticsearch("http://localhost:9200")
INDEX_NAME = "trash_posts"

# Flask initialization

app = Flask(__name__)
# Enable CORS (so the frontend, which runs on a different port, to be able to make requests to the backend)
CORS(app)

# API Endpoints
@app.route("/api/search")
def search():
  # Get the search query from the URL
  query_text = request.args.get("query", "")

  if not query_text:
    return jsonify({"error": "A 'query' parameter is required."}), 400
  
  # Create a basic ElasticSearch query.
  # This searches the 'status_message' and 'link_name' fields
  es_query = {
    "size": 20, # Gets up to 20 results
    "query": {
      "match": {
        "status_message": {
          "query": query_text,
          "boost": 2 # Gives more weight to matches in the main content
        }
      }
    }
  }

  # Executes the search query
  try:
    response = es.search(index=INDEX_NAME, body=es_query)
    # Return the 'hits' object that contains the results
    return jsonify(response['hits'])
  except Exception as e:
    # Return a detailed error message to be easy to identify
    return jsonify({"error": f"An error occured with ElasticSearch: {str(e)}"}), 500

# Main
if __name__ == "__main__":
  app.run(debug=True)