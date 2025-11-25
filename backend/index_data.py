#Index data (yes very self explanatory)
import pandas as pd
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
import os

#Configuration

ES_HOST = "http://localhost:9200"
INDEX_NAME = "trash_posts"
CSV_FILE_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'trump_posts.csv')

#Index mapping

INDEX_MAPPING = {
    "properties": {
        "status_message":   { "type": "text", "analyzer": "english" },
        "link_name":        { "type": "text", "analyzer": "english" },
        "status_type":      { "type": "keyword" },
        "status_link":      { "type": "keyword" },
        "status_published": { "type": "date", "format": "MM-dd-yyyy HH:mm:ss" },
        "num_reactions":    { "type": "integer" },
        "num_comments":     { "type": "integer" },
        "num_shares":       { "type": "integer" },
        "num_likes":        { "type": "integer" },
        "num_loves":        { "type": "integer" },
        "num_wows":         { "type": "integer" },
        "num_hahas":        { "type": "integer" },
        "num_sads":         { "type": "integer" },
        "num_angrys":       { "type": "integer" }
    }
}


#Connect to elasticsearch

try:
    es = Elasticsearch(ES_HOST)
    if not es.ping():
        raise ConnectionError("Could not connect to elasticsearch")
    print("Successfully connected to elasticsearch")
except ConnectionError as e:
    print(e)
    exit()


#Index Creation (if it doesn't exist already)

if es.indices.exists(index=INDEX_NAME):
    print(f"Index '{INDEX_NAME}' already exists. \n Deleting it for fresh start.")
    es.indices.delete(index=INDEX_NAME)

print(f"Creating index '{INDEX_NAME}' with mapping...")

es.indices.create(index=INDEX_NAME, mappings=INDEX_MAPPING)

def generate_actions (df):
    for index, row in df.iterrows():
        doc = {
            "_index": INDEX_NAME,
            "_source": {
                "status_message": row.get("status_message"),
                "link_name": row.get("link_name"),
                "status_type": row.get("status_type"),
                "status_link": row.get("status_link"),
                "status_published": row.get("status_published"),
                "num_reactions": row.get("num_reactions"),
                "num_comments": row.get("num_comments"),
                "num_shares": row.get("num_shares"),
                "num_likes": row.get("num_likes"),
                "num_loves": row.get("num_loves"),
                "num_wows": row.get("num_wows"),
                "num_hahas": row.get("num_hahas"),
                "num_sads": row.get("num_sads"),
                "num_angrys": row.get("num_angrys"),
            }
        }

        yield doc


print(f"Reading data from {CSV_FILE_PATH}...")

try:
    #Loading CSV into pandas dataframe
    df = pd.read_csv(CSV_FILE_PATH)

    #Handling missing values
    df = df.where(pd.notnull(df), None)
    print("Starting bulk indexing of documents...")

    #We use bulk helper for efficient indexing
    success, failed = bulk(es, generate_actions(df))
    print(f"Successfully indexed {success} documents.")

    if failed:
        print(f"Failed to index {len(failed)} documents.")
except FileNotFoundError:
    print(f"ERROR: The file was not found at {CSV_FILE_PATH}")
except Exception as e:
    print(f"An error has occured: {e}.")
