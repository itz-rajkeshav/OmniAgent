import os
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def create_driver():
    options = Options()
    options.binary_location = "/usr/bin/chromium" 

    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")

    service = Service("/usr/bin/chromedriver")  

    return webdriver.Chrome(service=service, options=options)


def clean_text(soup):
    for tag in soup(["script", "style", "noscript", "header", "footer", "svg"]):
        tag.decompose()

    main = soup.find("main")
    if main:
        return main.get_text(separator=" ", strip=True)

    return soup.get_text(separator=" ", strip=True)


def should_visit(url):
    blacklist = ["login", "signup", "cart", "privacy", "terms", "mailto:", "tel:"]
    return not any(word in url.lower() for word in blacklist)


def crawl_website(start_url: str, max_pages: int = 10, max_depth: int = 2):
    driver = create_driver()

    base_domain = urlparse(start_url).netloc
    visited = set()
    queue = [(start_url, 0)]
    results = []

    try:
        while queue and len(visited) < max_pages:
            url, depth = queue.pop(0)

            if url in visited or depth > max_depth:
                continue

            try:
                driver.get(url)

                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.TAG_NAME, "body"))
                )

                visited.add(url)

                soup = BeautifulSoup(driver.page_source, "html.parser")
                text = clean_text(soup)

                title_tag = soup.find("title")
                title = title_tag.get_text(strip=True) if title_tag else None

                results.append({
                    "url": url,
                    "text": text,
                    "title": title,
                })
 
                # Collect internal links
                links = driver.find_elements(By.TAG_NAME, "a")

                for link in links:
                    href = link.get_attribute("href")
                    if not href:
                        continue

                    full_url = urljoin(url, href)
                    parsed = urlparse(full_url)

                    clean_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"

                    if (
                        parsed.netloc == base_domain and
                        clean_url not in visited and
                        should_visit(clean_url)
                    ):
                        queue.append((clean_url, depth + 1))

            except Exception as e:
                print(f"Error crawling {url}: {e}")

    finally:
        driver.quit()

    return results