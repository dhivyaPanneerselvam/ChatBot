from rag.hybrid_retriever import hybrid_search


def retrieve_context(question, website):

    results = hybrid_search(
        question,
        website,
        top_k=10
    )

    documents = []
    sources = []

    for item in results:

        documents.append(item["document"])

        sources.append(item["metadata"])

    context = "\n\n".join(documents)

    return context, sources