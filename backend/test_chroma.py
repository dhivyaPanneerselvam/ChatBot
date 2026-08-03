from rag.vector_store import store_chunks

store_chunks(
    website="test",
    title="Test Page",
    page_url="https://test.com",
    chunks=[
        "Hello World"
    ]
)

print("Stored Successfully!")