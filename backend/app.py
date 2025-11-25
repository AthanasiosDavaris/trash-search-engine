from flask import Flask
from elasticsearch import Elasticsearch
import os
#Connect with docker

es = Elasticsearch("http://host.docker.internal:9200")

#Flask initialization

app = Flask(__name__)

#Api endpoints

@app.route("/")
def index():
    #TEST CONNECTION
    if es.ping():
        return {"status":"success","message":"backend is connected to elasticsearch"}
    else:
        return {"status":"failure","message":"backend cannot connect to elasticsearch"}

#Main function

if __name__ == "__main__":
    app.run(debug=True)