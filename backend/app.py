from flask import Flask, request, jsonify
from flask_cors import CORS
from elasticsearch import Elasticsearch

# Connection with ElasticSearch
ES_HOST = "http://localhost:9200"
INDEX_NAME = "trash_posts"

# ElasticSearch initialization
es = Elasticsearch(ES_HOST, request_timeout=30)

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
    "size": 20,
    "query": {
      "multi_match": {
        "query": query_text,
        "fields": [
          "status_message^2",
          "link_name"
        ]
      }
    },
    "highlight": {
      "fields": {
        "status_message": {},
        "link_name": {}
      },
      "pre_tags": ["<strong>"],
      "post_tags": ["</strong>"]
    }
  }


  # Executes the search query
  try:
    response = es.search(index=INDEX_NAME, body=es_query)
    # Return the 'hits' object that contains the results
    return jsonify(response['hits'])
  except Exception as e:
    # Return a detailed error message to be easy to identify
    print(f"An error occurred with ElasticSearch: {e}")
    return jsonify({"error": f"An error occured with ElasticSearch: {str(e)}"}), 500

# Main
if __name__ == "__main__":
  app.run(debug=True)