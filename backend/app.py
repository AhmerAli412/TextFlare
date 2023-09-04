from flask import Flask, request, render_template, jsonify
from flask_cors import CORS  # Import CORS from flask_cors

app = Flask(__name__)
CORS(app)  # Enable CORS for your Flask app

@app.route('/', methods=['GET', 'POST'])
def index():
    paragraph = ""
    word = ""
    count = 0

    if request.method == 'POST':
        paragraph = request.form['paragraph']
        word = request.form['word'].lower()
        words = paragraph.lower().split()
        count = words.count(word)

    return render_template('index.html', paragraph=paragraph, word=word, count=count)

@app.route('/api/word-cloud', methods=['POST'])
def word_cloud():
    data = request.get_json()
    paragraph = data.get('paragraph', '')
    words = paragraph.lower().split()
    word_frequency = {}
    for word in words:
        word_frequency[word] = word_frequency.get(word, 0) + 1
    cloud_data = [{'text': word, 'value': freq} for word, freq in word_frequency.items()]
    return jsonify(cloud_data)

if __name__ == '__main__':
    app.run(debug=True)
