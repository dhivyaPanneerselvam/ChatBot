from agents.planner_agent import PlannerAgent
from agents.website_agent import WebsiteAgent
from agents.merge_agent import MergeAgent

from llm.groq_client import ask_groq


class AgentService:

    def __init__(self):

        self.planner = PlannerAgent()

        self.website = WebsiteAgent()

        self.merge = MergeAgent()

    def chat(self, question, website):

        print("\n" + "=" * 80)
        print("PLANNER")
        print("=" * 80)

        plan = self.planner.create_plan(question)

        print(plan)

        print("\n" + "=" * 80)
        print("WEBSITE AGENT")
        print("=" * 80)

        website_result = self.website.search(
            question=question,
            website=website
        )

        merged = self.merge.merge(
            website_result=website_result
        )

        prompt = f"""
You are an AI assistant.

Answer ONLY using the context below.

If the answer is not present,
reply:

I couldn't find this information on the indexed website.

------------------------------------------------

Context

{merged["context"]}

------------------------------------------------

Question

{question}

Answer:
"""

        answer = ask_groq(prompt)

        return {
            "answer": answer,
            "sources": merged["metadata"],
            "plan": plan
        }