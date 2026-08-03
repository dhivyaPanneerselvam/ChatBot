from rag.retriever import retrieve_context
from llm.groq_client import ask_groq


def chat_with_website(question, website):

    context, sources = retrieve_context(
    question,
    website
)

    prompt = f"""
You are an AI assistant.

Answer ONLY from the context below.

If the answer is not found in the context, reply exactly:

I couldn't find this information on the indexed website.

-------------------------
CONTEXT

{context}

-------------------------

QUESTION

{question}

Answer:
"""

    answer = ask_groq(prompt)

    return {
        "answer": answer,
        "sources": sources
    }