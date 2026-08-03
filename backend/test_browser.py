from crawler.browser import Browser

browser = Browser()

browser.start()

html = browser.get_html("https://fastapi.tiangolo.com")

print(len(html))

browser.stop()