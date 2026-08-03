import json
import os
from urllib.parse import urlparse

from crawler.crawler import WebsiteCrawler
from services.vector_service import VectorService
import rag.bm25_store as bm25_store


def validate_json_file(json_file):
    print("=" * 80)
    print("READING:", json_file)

    with open(json_file, "r", encoding="utf-8") as f:
        content = f.read()

    print("FILE SIZE:", len(content))

    try:
        pages = json.loads(content)
        print("JSON Loaded Successfully")
        return pages
    except Exception as e:
        print("JSON ERROR:", e)
        if hasattr(e, 'pos') and e.pos is not None:
            error_pos = e.pos
            start = max(0, error_pos - 200)
            end = min(len(content), error_pos + 200)
            print("\n========= ERROR AREA =========\n")
            print(content[start:end])
            print("\n==============================\n")
        raise


class IndexService:

    def __init__(self):
        self.crawler = WebsiteCrawler(max_pages=20)
        self.vector_service = VectorService()

    def index_website(self, url):
        print(f"Starting crawl for: {url}")
        pages = self.crawler.crawl(url)
        
        if not pages:
            return {
                "status": "error",
                "message": "No pages crawled. Check if the URL is correct and accessible."
            }

        # Create websites directory in workspace root if not exists
        # Since backend runs in the backend directory or project root, let's build the path relative to project root.
        # Let's find the project root or use "websites" directly.
        # In list_dir of the workspace we saw "websites" at root level.
        # Let's write to "../websites/" if we are running from backend directory, 
        # or handle both (check where we are).
        websites_dir = "websites"
        if not os.path.exists(websites_dir) and os.path.exists("../websites"):
            websites_dir = "../websites"
        
        os.makedirs(websites_dir, exist_ok=True)
        
        parsed_url = urlparse(url)
        # Use netloc as filename, replace invalid characters
        filename = parsed_url.netloc.replace(":", "_").replace("/", "_")
        if not filename:
            filename = "website_data"
        json_file_path = os.path.join(websites_dir, f"{filename}.json")

        with open(json_file_path, "w", encoding="utf-8") as f:
            json.dump(pages, f, ensure_ascii=False, indent=4)

        # Validate the generated JSON file
        validate_json_file(json_file_path)

        # Build vectors
        total_chunks = self.vector_service.build_vectors(json_file_path)

        # Build BM25 store index
        bm25_store.build_bm25(json_file_path)

        return {
            "status": "success",
            "message": f"Successfully indexed {url}",
            "pages_crawled": len(pages),
            "chunks_stored": total_chunks,
            "filename": f"{filename}.json"
        }