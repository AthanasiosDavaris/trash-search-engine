import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from elasticsearch import Elasticsearch, NotFoundError
from elasticsearch.helpers import bulk, BulkIndexError

# Connections and initializations
ES_HOST = "http://localhost:9200"
INDEX_NAME = "trash_posts"
es = Elasticsearch(ES_HOST, request_timeout=30)
app = Flask(__name__)
CORS(app)

#--------------------API Endpoints---------------------

# Search Endpoints
# Search an endpoint with Boolean Logic, Phrase search and Filters (ex. number of likes)
# 
# Method GET: For simple queries (URL parameter '?query=...')
# Method POST: For complex queries (JSON body {"query": "...", "filters": {...}})
# 
# Return: JSON list of hits

@app.route("/api/search", methods=['GET', 'POST'])
def search():
  query_text = ""
  filters = {}

  if request.method == 'POST' and request.is_json:
    data = request.get_json()
    query_text = data.get('query', "")
    filters = data.get('filters', {})
  else:
    query_text = request.args.get("query", "")
  
  es_query = {
    "size": 20,
    "query": {
      "bool": {
        "must": [],
        "filter": [],
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

  if query_text:
    es_query["query"]["bool"]["must"].append({
      "simple_query_string": {
        "query": query_text,
        "fields": ["status_message^2", "link_name"],
        "default_operator": "AND"
      }
    })
  else:
    es_query["query"]["bool"]["must"].append({"match_all": {}})

  for field, criteria in filters.items():
    if "is" in criteria:
      es_query["query"]["bool"]["filter"].append({
        "term": {
          field: criteria["is"]
        }
      })
    else:
      range_query = {"range": {field: {}}}
      if "min" in criteria:
        range_query["range"][field]["gte"] = criteria["min"]
      if "max" in criteria:
        range_query["range"][field]["lte"] = criteria["max"]
      if range_query["range"][field]:
        es_query["query"]["bool"]["filter"].append(range_query)
  
  try:
    response = es.search(index=INDEX_NAME, body=es_query)
    return jsonify(response['hits'])
  except Exception as e:
    print(f"Elasticsearch error: {e}")
    return jsonify({"error": f"An error occurred with Elasticsearch: {str(e)}"}), 500
  

# Delete Endpoints
# Delete a specific post using its ID

@app.route("/api/delete/<post_id>", methods=['DELETE'])
def delete_post(post_id):
  try:
    es.delete(index=INDEX_NAME, id=post_id)
    return jsonify({"status": "success", "message": f"Post with ID: {post_id} was deleted."})
  except NotFoundError:
    return jsonify({"status": "error", "message": "Post not found"}), 404
  except Exception as e:
    return jsonify({"status": "error", "message": str(e)}), 500

# Search for Similar Endpoints
# Finds posts similar to given ID using 'More Like This'

@app.route("/api/similar/<post_id>")
def find_similar(post_id):
  mlt_query = {
    "size": 10,
    "query": {
      "more_like_this": {
        "fields": ["status_message", "link_name"],
        "like": [{"_index": INDEX_NAME, "_id": post_id}],
        #"min_term_freq": 1,
        "max_query_terms": 15
      }
    }
  }
  try:
    response = es.search(index=INDEX_NAME, body=mlt_query)
    return jsonify(response['hits'])
  except NotFoundError:
    return jsonify({"error": "Post not found to compare against."}), 404
  except Exception as e:
    return jsonify({"error": str(e)}), 500
  
# Import Endpoint
# Accepts a CSV file upload, parses it and bulk indexes it into Elasticsearch

@app.route("/api/import", methods=['POST'])
def import_posts():
  if 'csv_file' not in request.files:
    return jsonify({"error": "No CSV file part in the request."}), 400
  
  file = request.files['csv_file']
  if file.filename == '':
    return jsonify({"error": "No selected file."}), 400
  
  if not file.filename.endswith('.csv'):
    return jsonify({"error": "Invalid file type must be a CSV file."}), 400
  
  try:
    df = pd.read_csv(file)
    df.dropna(how='all', inplace=True)
    df.dropna(subset=['status_published'], inplace=True)
    numeric_cols = ['num_reactions', 'num_comments', 'num_shares', 'num_likes', 'num_loves', 'num_wows', 'num_hahas', 'num_sads', 'num_angrys']

    for col in numeric_cols:
      df[col] = pd.to_numeric(df[col], errors='coerce')
    
    df.dropna(subset=numeric_cols, inplace=True)
    df[numeric_cols] = df[numeric_cols].astype(int)
    df = df.where(pd.notnull(df), None)

    def generate_actions(dataframe):
      for index, row in dataframe.iterrows():
        yield {"_index": INDEX_NAME, "_source": row.to_dict()}

    success, failed = bulk(es, generate_actions(df))
    return jsonify({"status": "success", "message": f"Import complete. Successfully indexed {success} documents", "failed_count": len(failed)})
  except BulkIndexError as e:
    return jsonify({"error": "Bulk indexing failed.", "details": str(e.errors)}), 500
  except Exception as e:
    return jsonify({"error": f"An error has occurred: {str(e)}"}), 500

# Random Endpoint
# Returns a single random post from the index (Used in the 'Im feeling lucky button')

@app.route("/api/random", methods=['GET'])
def get_random_post():
  random_query= {
    "size": 1,
    "query": {
      "function_score": {
        "functions": [{"random_score": {}}],
        "boost_mode": "replace"
      }
    }
  }

  try:
    response = es.search(index=INDEX_NAME, body=random_query)

    if not response['hits']['hits']:
      return jsonify({"error": "No posts found in the index."}), 404
    
    return jsonify(response['hits']['hits'][0])
  except Exception as e:
    print(f"Error random post retrieval failed: {e}")
    return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# Main
if __name__ == "__main__":
  app.run(debug=True)