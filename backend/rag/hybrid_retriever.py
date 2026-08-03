from rag.vector_store import retrieve_chunks
from rag.bm25_store import search_bm25


def hybrid_search(question, website, top_k=5):

    # Semantic Search
    vector_results = retrieve_chunks(
        question=question,
        website=website,
        top_k=top_k
    )

    vector_docs = vector_results["documents"][0]
    vector_meta = vector_results["metadatas"][0]

    # Keyword Search
    bm25_docs, bm25_meta = search_bm25(
        question,
        top_k
    )

    merged = []
    seen = set()

    # Add semantic results
    for doc, meta in zip(vector_docs, vector_meta):

        if doc not in seen:
            seen.add(doc)

            merged.append(
                {
                    "document": doc,
                    "metadata": meta
                }
            )

    # Add keyword results
    for doc, meta in zip(bm25_docs, bm25_meta):

        if doc not in seen:
            seen.add(doc)

            merged.append(
                {
                    "document": doc,
                    "metadata": meta
                }
            )

    return merged