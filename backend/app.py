from flask import Flask
#test########text######
app = Flask(__name__)

@app.route("/")
def index():
  return {"message": "Backend server is running!"}

if __name__ == "__main__":
  app.run(debug=True)