from flask import Flask, jsonify, request, session
from flask_session import Session
from youtube_transcript_api import YouTubeTranscriptApi
import requests

app = Flask(__name__)
app.secret_key = 'super secret key'
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)


@app.route('/api/check')
def check():
    original_text = ""
    video_id = request.args.get('video_id')
    transcript = YouTubeTranscriptApi.get_transcript(video_id)
    for t in transcript:
        original_text += " " + t["text"]
    session['text'] = original_text
    return jsonify(original_text)


@app.route('/api/summarize')
def summarize():
    # This model aims to reduce the size to 20% of the original.
    r = requests.post(
        "https://api.deepai.org/api/summarization",
        data={
            'text': session.get('text', None),
        },
        headers={'api-key': ''}  # api key
    )
    output = r.json()
    output['output'].replace("\n", "\n\n")
    return jsonify(output['output'])


if __name__ == '__main__':
    app.run()
