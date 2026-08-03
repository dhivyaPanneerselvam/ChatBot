import chromadb
from rag.embeddings import generate_embedding

client = chromadb.PersistentClient(path="storage/vectors")

collection = client.get_or_create_collection(
    name="website_knowledge"
)


def store_chunks(website, title, page_url, chunks):

    ids = []
    embeddings = []
    documents = []
    metadatas = []

    for index, chunk in enumerate(chunks):

        ids.append(f"{page_url}_{index}")

        embeddings.append(
            generate_embedding(chunk)
        )

        documents.append(chunk)

        metadatas.append(
            {
                "website": website,
                "title": title,
                "page_url": page_url,
                "chunk": index
            }
        )

    collection.upsert(
        ids=ids,
        embeddings=embeddings,
        documents=documents,
        metadatas=metadatas
    )


def retrieve_chunks(question, website, top_k=5):

    embedding = generate_embedding(question)

    results = collection.query(
        query_embeddings=[embedding],
        n_results=top_k,
        where={
            "website": website
        }
    )

    return results