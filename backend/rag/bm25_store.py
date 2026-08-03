import json
from rank_bm25 import BM25Okapi

documents = []
metadata = []
bm25 = None


def build_bm25(json_file):

    global documents
    global metadata
    global bm25

    documents = []
    metadata = []

    with open(json_file, "r", encoding="utf-8") as f:
        pages = json.load(f)

    corpus = []

    for page in pages:

        text = page["content"]

        corpus.append(text.lower().split())

        documents.append(text)

        metadata.append(
            {
                "website": page["url"],
                "title": page["title"],
                "page_url": page["url"]
            }
        )

    bm25 = BM25Okapi(corpus)


def search_bm25(question, top_k=5):

    global bm25

    if bm25 is None:
        return [], []

    scores = bm25.get_scores(
        question.lower().split()
    )

    ranked = sorted(
        range(len(scores)),
        key=lambda i: scores[i],
        reverse=True
    )

    docs = []
    metas = []

    for i in ranked[:top_k]:

        docs.append(documents[i])

        metas.append(metadata[i])

    return docs, metas