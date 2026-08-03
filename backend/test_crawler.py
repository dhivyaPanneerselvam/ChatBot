from crawler.crawler import WebsiteCrawler


def main():

    crawler = WebsiteCrawler(max_pages=5)

    pages = crawler.crawl("https://fastapi.tiangolo.com/")

    print("=" * 80)
    print("TOTAL PAGES:", len(pages))
    print("=" * 80)

    for page in pages:

        print("\nTITLE :", page["title"])
        print("URL   :", page["url"])
        print("TEXT LENGTH :", len(page["content"]))

        print("-" * 80)


if __name__ == "__main__":
    main()