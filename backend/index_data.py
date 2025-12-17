#Index data (yes very self explanatory)
import pandas as pd
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk, BulkIndexError
import os
import sys

#Configuration

#Paths
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CSV_FILE_PATH = os.path.join(PROJECT_ROOT, 'data', 'trump_posts.csv')

ES_HOST = "http://localhost:9200"
INDEX_NAME = "trash_posts"

#Index mapping

INDEX_MAPPING = {
    "properties": {
        "status_message":   { "type": "text", "analyzer": "english", "term_vector": "with_positions_offsets" },
        "link_name":        { "type": "text", "analyzer": "english", "term_vector": "with_positions_offsets" },
        "status_type":      { "type": "keyword" },
        "status_link":      { "type": "keyword" },
        "status_published": { "type": "date", "format": "M/d/yyyy H:mm:ss || M/d/yy H:mm || yyyy-MM-dd" },
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

def main():
    """Main function for indexing."""

    #Elasticsearch Connection
    print(f"Connecting to elasticsearch at {ES_HOST}...")
    try:
        es = Elasticsearch(ES_HOST, request_timeout=30)
        if not es.ping():
            raise ConnectionError("Could not connect to elasticsearch")
        print("Successfully connected to elasticsearch")
    except ConnectionError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)

    #Index Creation (if it doesn't exist already)
    if es.indices.exists(index=INDEX_NAME):
        print(f"Index '{INDEX_NAME}' already exists. \n Deleting it for fresh start.")
        es.indices.delete(index=INDEX_NAME)

    print(f"Creating index '{INDEX_NAME}' with mapping...")
    es.indices.create(index=INDEX_NAME, mappings=INDEX_MAPPING)

    print(f"Reading data from {CSV_FILE_PATH}...")
    try:
        #Loading CSV into pandas dataframe
        df = pd.read_csv(CSV_FILE_PATH)
        initial_doc_count = len(df)
        print(f"Found {initial_doc_count} total rows in the CSV file")

        #Checking for incorrect format rows in the CSV file
        df.dropna(how='all', inplace=True)

        df.dropna(subset=['status_published'], inplace=True)

        final_doc_count = len(df)
        skipped_rows = initial_doc_count - final_doc_count
        if skipped_rows > 0:
            print(f"Skipped {skipped_rows} rows due to being empty or missing a publication date")

        #Numeric conversion
        numeric_cols = ['num_reactions', 'num_comments', 'num_shares', 'num_likes', 'num_loves', 'num_wows', 'num_hahas', 'num_sads', 'num_angrys']
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        
        #Dropping the rows where the numeric conversion fails
        df.dropna(subset=numeric_cols, inplace=True)

        #Converting floats to integers
        df[numeric_cols] = df[numeric_cols].astype(int)

        #Handling missing values
        df = df.where(pd.notnull(df), None)

        print(f"Found {len(df)} valid documents to index.")
    except FileNotFoundError:
        print(f"ERROR: The file was not found at {CSV_FILE_PATH}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"An error has occured while reading the CSV: {e}.", file=sys.stderr)
        sys.exit(1)

    # Bulk Helper for ~efficiancy~
    def generate_actions (dataframe):
        """Generator function to yield documents for bulk indexing."""
        for index, row in dataframe.iterrows():
            yield {
                "_index": INDEX_NAME,
                "_source": row.to_dict(),
            }
        
    print("Starting bulk indexing... Sit tight and enjoy your coffee, this may take a while.")
    try:
        success, _ = bulk(es, generate_actions(df), stats_only=True, raise_on_error=True)
        print(f"Successfully indexed {success} documents.")
    except BulkIndexError as e:
        print(f"Failed to index {len(e.errors)} documents.", file=sys.stderr)
        print("--- Showing details for the first 5 failures ---", file=sys.stderr)
        for i,error in enumerate(e.errors):
            if i >= 5: break
            print(f"Failure {i+1}: {error['index']['error']}", file=sys.stderr)
    except Exception as e:
        print(f"An error occurred during bulk indexing: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()