from flask import Flask, request, jsonify
from flask_cors import CORS
from elasticsearch import Elasticsearch

# Connections and initializations
ES_HOST = "http://localhost:9200"
INDEX_NAME = "trash_posts"
es = Elasticsearch(ES_HOST, request_timeout=30)
app = Flask(__name__)
CORS(app)

# API Endpoints
@app.route("/api/search")
def search():
  query_text = request.args.get("query", "")
  if not query_text:
    return jsonify({"error": "A 'query' parameter is required."}), 400
  
  es_query = {
    "size": 20,
    "query": {
      "multi_match": {
        "query": query_text,
        "fields": ["status_message^2","link_name"]
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
  try:
    response = es.search(index=INDEX_NAME, body=es_query)
    return jsonify(response['hits'])
  except Exception as e:
    return jsonify({"error": f"An error occured with ElasticSearch: {str(e)}"}), 500
  

# Delete Endpoints
@app.route("/api/delete/<post_id>", methods=['DELETE'])
def delete_post(post_id):
  try:
    es.delete(index=INDEX_NAME, id=post_id)
    return jsonify({"status": "success", "message": f"Post with ID {post_id} was deleted."})
  except NotFoundError:
    return jsonify({"status": "error", "message": "Post not found."}), 404
  except Exception as e:
    return jsonify({"status": "error", "message": str(e)}), 500

# Similar Endpoints
@app.route("/api/similar/<post_id>")
def find_similar(post_id):
  mlt_query = {
    "size": 10,
    "query": {
      "more_like_this": {
        "fields": ["status_message", "link_name"],
        "like": [
          {
            "_index": INDEX_NAME,
            "_id": post_id
          }
        ],
        "min_term_freq": 1,
        "max_query_terms": 12
      }
    }
  }
  try:
    response = es.search(index=INDEX_NAME, body=mlt_query)
    return jsonify(response['hits'])
  except Exception as e:
    return jsonify({"error": str(e)}), 500

# Main
if __name__ == "__main__":
  app.run(debug=True)