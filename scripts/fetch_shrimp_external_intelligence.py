import os
import requests
import json
from datetime import datetime
import xml.etree.ElementTree as ET
try:
    from bs4 import BeautifulSoup
except ImportError:
    os.system("pip install beautifulsoup4 requests feedparser")
    from bs4 import BeautifulSoup
import feedparser

# GitHub Actions 환경 및 로컬 환경 모두 호환되도록 상대 경로로 설정
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(BASE_DIR, "data", "새우")
os.makedirs(OUT_DIR, exist_ok=True)

def log(msg):
    print(f"[*] {msg}")

def fetch_undercurrent_news_rss():
    log("Fetching Undercurrent News RSS (Shrimp)...")
    url = "https://www.undercurrentnews.com/feed/"
    feed = feedparser.parse(url)
    
    entries = []
    for entry in feed.entries:
        if 'shrimp' in entry.title.lower() or 'shrimp' in entry.summary.lower() or 'prawn' in entry.title.lower():
            entries.append({
                'title': entry.title,
                'link': entry.link,
                'published': entry.get('published', ''),
                'summary': entry.get('summary', '')
            })
            
    if entries:
        filename = os.path.join(OUT_DIR, f"External_UndercurrentNews_Shrimp_{datetime.now().strftime('%Y%m')}.md")
        with open(filename, "w", encoding="utf-8") as f:
            f.write("# Undercurrent News - Shrimp Intelligence\n\n")
            f.write(f"*Scraped at: {datetime.now().isoformat()}*\n\n")
            for e in entries:
                f.write(f"### [{e['title']}]({e['link']})\n")
                f.write(f"**Date:** {e['published']}\n\n")
                # Clean HTML tags from summary
                soup = BeautifulSoup(e['summary'], "html.parser")
                f.write(f"{soup.get_text()}\n\n---\n")
        log(f"Saved {len(entries)} articles to {filename}")
    else:
        log("No recent shrimp articles found in Undercurrent News RSS.")

def fetch_noaa_fishery_news():
    log("Fetching NOAA Fishery Market News (Shrimp)...")
    # Using the standard NOAA fishery market news URL for shrimp (example endpoint)
    # NOAA uses text files and PDFs. We'll scrape the main landing page for recent updates.
    url = "https://www.fisheries.noaa.gov/national/sustainable-fisheries/fishery-market-news"
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        res = requests.get(url, headers=headers, timeout=10)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, "html.parser")
        
        paragraphs = soup.find_all('p')
        content = [p.get_text().strip() for p in paragraphs if p.get_text().strip()]
        
        filename = os.path.join(OUT_DIR, f"External_NOAA_MarketNews_{datetime.now().strftime('%Y%m')}.md")
        with open(filename, "w", encoding="utf-8") as f:
            f.write("# NOAA Fishery Market News Overview\n\n")
            f.write(f"*Scraped from: {url}*\n\n")
            for c in content:
                if 'shrimp' in c.lower():
                    f.write(f"> **SHRIMP MENTION:** {c}\n\n")
                else:
                    f.write(f"{c}\n\n")
        log(f"Saved NOAA overview to {filename}")
    except Exception as e:
        log(f"Failed to fetch NOAA data: {e}")

def fetch_eumofa_highlights():
    log("Fetching EUMOFA Market Highlights...")
    # EUMOFA publishes monthly highlights. We'll scrape the publications page.
    url = "https://www.eumofa.eu/market-analysis"
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        res = requests.get(url, headers=headers, timeout=10)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, "html.parser")
        
        links = []
        for a in soup.find_all('a', href=True):
            if 'monthly-highlights' in a['href'].lower() or 'shrimp' in a.get_text().lower():
                link = a['href'] if a['href'].startswith('http') else f"https://www.eumofa.eu{a['href']}"
                links.append((a.get_text().strip(), link))
                
        # Deduplicate
        links = list(set(links))
        
        filename = os.path.join(OUT_DIR, f"External_EUMOFA_Analysis_{datetime.now().strftime('%Y%m')}.md")
        with open(filename, "w", encoding="utf-8") as f:
            f.write("# EUMOFA Market Analysis & Publications\n\n")
            f.write("*Note: EUMOFA is critical for EU premium spread & import logistics.*\n\n")
            for text, link in links:
                if text:
                    f.write(f"- [{text}]({link})\n")
        log(f"Saved EUMOFA links to {filename}")
    except Exception as e:
        log(f"Failed to fetch EUMOFA data: {e}")

if __name__ == "__main__":
    log("Starting External Intelligence Scraper for Shrimp...")
    fetch_undercurrent_news_rss()
    fetch_noaa_fishery_news()
    fetch_eumofa_highlights()
    log("Scraping completed.")
