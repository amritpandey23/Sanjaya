from flask import Flask, request, jsonify
import tensorflow as tf
import sqlite_vec
from flask_cors import CORS
from gemini import get_completion

from database_wrappers import VectorDatabase, SampleDatabase


app = Flask(__name__)

CORS(app)

model = None


def load_model(saved_model_path_dir):
    model = tf.saved_model.load(saved_model_path_dir)
    return model


def text_to_embeddings(text, model):
    text_tensor = tf.convert_to_tensor([text])
    embeddings = model(text_tensor)
    return embeddings.numpy()[0]


@app.route("/embeddings/generate", methods=["GET"])
def generate_embeddings():
    data = request.get_json()
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "Text field is required"}), 400

    try:
        embeddings = text_to_embeddings(text, model)
        return jsonify({"embeddings": embeddings.tolist()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/embeddings/store", methods=["POST"])
def store_embeddings():
    data = request.get_json()
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "Text field is required"}), 400

    embeddings = None

    try:
        embeddings = text_to_embeddings(text, model)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    db = VectorDatabase("final.db", 250)

    try:
        db.insert_embeddings(text=text, vector=embeddings)
    except Exception as e:
        print("Some error occured while adding the data to the db")
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "successfully add the embedding to the db"}), 200


@app.route("/embeddings/retrieve/<int:id>", methods=["GET"])
def retrieve_embeddings_with_id(id: int):
    pass


def knn_search(text: str, k: int, db: VectorDatabase):
    embeddings = None
    try:
        embeddings = text_to_embeddings(text, model)
    except Exception as e:
        print("some error via generating embeddings of the text", e)

    knn_query = f"""
        SELECT
        rowid,
        distance
        FROM text_embeddings
        where sample_embedding match ?
        and k = {k} 
        ORDER BY distance
    """

    serialized_query_vector = sqlite_vec.serialize_float32(embeddings)

    results = None

    try:
        results = db.get_db().execute(knn_query, (serialized_query_vector,)).fetchall()
    except Exception as e:
        print(e)

    return results


def get_text_from_knn_results(results, db_path):
    result_set = []
    db = SampleDatabase(db_path)
    for row in results:
        text = db.get_sample_by_embedding_id(row[0])
        distance = row[1]
        result_set.append({"text": text, "distance": distance})
    return result_set


@app.route("/text/search", methods=["GET", "POST"])
def text_embeddings():
    data = request.get_json()
    text = data.get("text", "")
    k = data.get("k", 2)
    db_name = data.get("db_name", "final.db")

    if not text:
        return jsonify({"message": "please specify text"}), 400

    db = VectorDatabase(db_name)

    try:
        results = get_text_from_knn_results(
            knn_search(text=text, k=k, db=db), db.get_db_path()
        )
    except Exception as e:
        return jsonify({"error": e}), 500

    return jsonify({"results": results}), 200


@app.route("/text/ask", methods=["GET", "POST"])
def ask():
    data = request.get_json()
    question = data.get("question", "")
    db_name = data.get("db_name", "final.db")

    if not question:
        return jsonify({"message": "please specify question"}), 400

    db = VectorDatabase(db_name)

    content = ""
    try:
        results = get_text_from_knn_results(
            knn_search(text=question, k=3, db=db), db.get_db_path()
        )
        for r in results:
            content += r["text"]
            content += "\n"
    except Exception as e:
        return jsonify({"error": e}), 500

    print(content)

    answer = get_completion(content=content, question=question)

    return jsonify({"answer": answer}), 200


@app.route("/text/all", methods=["GET"])
def get_all_text_samples():
    db_path = "databases/final.db"
    sample_db = SampleDatabase(db_path)

    try:
        samples = sample_db.get_all_samples()
        data = [{"id": row[0], "text": row[1]} for row in samples]
        return jsonify({"data": data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    model_path = "./wiki_words"
    model = load_model(model_path)
    app.run(debug=True)
