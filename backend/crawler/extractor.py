from bs4 import BeautifulSoup


class Extractor:

    def clean_html(self, html):

        soup = BeautifulSoup(html, "html.parser")

        # Remove unwanted tags
        for tag in soup([
            "script",
            "style",
            "noscript",
            "svg",
            "img",
            "footer",
            "header",
            "nav",
            "aside",
            "iframe"
        ]):
            tag.decompose()

        return soup

    def extract_text(self, html):

        soup = self.clean_html(html)

        text = soup.get_text(separator="\n")

        lines = []

        for line in text.splitlines():

            line = line.strip()

            if line:
                lines.append(line)

        return "\n".join(lines)

    def extract_title(self, html):

        soup = BeautifulSoup(html, "html.parser")

        if soup.title:
            return soup.title.text.strip()

        return "No Title"