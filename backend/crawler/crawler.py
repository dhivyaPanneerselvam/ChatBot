from crawler.browser import Browser
from crawler.extractor import Extractor
from crawler.links import LinkExtractor


class WebsiteCrawler:

    def __init__(self, max_pages=20):

        self.extractor = Extractor()
        self.link_extractor = LinkExtractor()

        self.max_pages = max_pages

        # File types to skip
        self.skip_extensions = (
            ".pdf",
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".bmp",
            ".svg",
            ".webp",
            ".ico",
            ".doc",
            ".docx",
            ".xls",
            ".xlsx",
            ".ppt",
            ".pptx",
            ".zip",
            ".rar",
            ".7z",
            ".mp3",
            ".mp4",
            ".avi",
            ".mov",
            ".wmv",
            ".csv",
            ".exe",
            ".apk",
        )

    def crawl(self, start_url):

        browser = Browser()
        browser.start()

        visited = set()

        queue = [start_url]

        website_data = []

        while queue and len(visited) < self.max_pages:

            url = queue.pop(0)

            if url in visited:
                continue

            print(f"Crawling : {url}")

            try:

                html = browser.get_html(url)

                title = self.extractor.extract_title(html)

                text = self.extractor.extract_text(html)

                website_data.append(
                    {
                        "url": url,
                        "title": title,
                        "content": text
                    }
                )

                visited.add(url)

                links = self.link_extractor.get_links(
                    html,
                    url
                )

                for link in links:

                    link = link.strip()

                    # Skip empty links
                    if not link:
                        continue

                    # Skip anchors
                    if link.startswith("#"):
                        continue

                    # Skip javascript
                    if link.startswith("javascript:"):
                        continue

                    # Skip mail links
                    if link.startswith("mailto:"):
                        continue

                    # Skip phone links
                    if link.startswith("tel:"):
                        continue

                    # Skip unwanted file types
                    if link.lower().endswith(self.skip_extensions):
                        continue

                    if link in visited:
                        continue

                    if link in queue:
                        continue

                    queue.append(link)

            except Exception as e:
                print(e)

        browser.stop()

        return website_data