import json

from rag.chunker import split_text
from rag.vector_store import store_chunks


class VectorService:

    def build_vectors(self, json_file):

        with open(json_file, "r", encoding="utf-8") as file:
            pages = json.load(file)

        total_chunks = 0

        for page in pages:

            chunks = split_text(page["content"])

            store_chunks(
                website=page["url"],
                title=page["title"],
                page_url=page["url"],
                chunks=chunks
            )

            total_chunks += len(chunks)

        return total_chunks