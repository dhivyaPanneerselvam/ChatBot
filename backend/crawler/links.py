from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse


class LinkExtractor:

    def get_links(self, html, base_url):

        soup = BeautifulSoup(html, "html.parser")

        links = set()

        base_domain = urlparse(base_url).netloc

        for tag in soup.find_all("a", href=True):

            href = tag["href"]

            if href.startswith("#"):
                continue

            if href.startswith("javascript:"):
                continue

            if href.startswith("mailto:"):
                continue

            full_url = urljoin(base_url, href)

            parsed = urlparse(full_url)

            if parsed.netloc != base_domain:
                continue

            clean_url = parsed.scheme + "://" + parsed.netloc + parsed.path

            links.add(clean_url)

        return sorted(list(links))