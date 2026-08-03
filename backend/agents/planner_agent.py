from llm.groq_client import ask_groq


class PlannerAgent:

    def create_plan(self, question):

        prompt = f"""
You are an AI Planning Agent.

Your job is NOT to answer the question.

Your job is to decide what information sources are needed.

Available Sources:

1. Website Pages
2. PDF Documents
3. OCR Images
4. Conversation Memory

Return ONLY valid JSON.

Example:

{{
    "website": true,
    "documents": false,
    "ocr": false,
    "memory": false,
    "keywords": [
        "principal",
        "administration"
    ]
}}

Question:

{question}
"""

        response = ask_groq(prompt)

        return response