from rag.vector_store import retrieve_chunks


class WebsiteAgent:

    def search(self, question, website):

        results = retrieve_chunks(
            question=question,
            website=website,
            top_k=10
        )

        documents = results["documents"][0]
        metadata = results["metadatas"][0]

        context = "\n\n".join(documents)

        return {
            "context": context,
            "metadata": metadata
        }