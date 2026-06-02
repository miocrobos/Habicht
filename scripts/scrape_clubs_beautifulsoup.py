#!/usr/bin/env python3
"""
Swiss Volleyball Clubs Scraper - BeautifulSoup + API + Historical Data
========================================================================
Sources (in priority order):
  1. SearchKit API (volleyball.ch/api/searchkit/club-search)
       - All registered clubs, structured JSON with league/youth data, logos
       - Currently limited (~22 clubs) due to seasonal "Saisonwechsel"
  2. Game Center (Playwright + BeautifulSoup) - live NLA/NLB/1L verification
  3. data/game-center-verified-teams.json - 44 NLA/NLB clubs with VolleyManager IDs
  4. data/clubs-with-websites.json - 233 clubs with postal codes, towns, emails

Merging strategy:
  - Start from clubs-with-websites (broadest base, 233 clubs)
  - Enrich with verified NLA/NLB club IDs from game-center-verified-teams
  - Override/update with live SearchKit API data (most accurate when available)
  - Confirm top-league flags with live Game Center scrape

Output:
  data/swiss-volleyball-clubs-bs4.json
  data/swiss-volleyball-clubs-bs4-raw.json

Usage:
  pip install playwright beautifulsoup4 requests lxml
  python -m playwright install chromium
  python scripts/scrape_clubs_beautifulsoup.py
"""

import asyncio
import json
import re
import time
from pathlib import Path
from typing import Optional

import requests
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright, Page, BrowserContext

# ── Paths ─────────────────────────────────────────────────────────────────────
ROOT     = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
DATA_DIR.mkdir(exist_ok=True)

OUT_FILE = DATA_DIR / "swiss-volleyball-clubs-bs4.json"
RAW_FILE = DATA_DIR / "swiss-volleyball-clubs-bs4-raw.json"

BASE_URL = "https://www.volleyball.ch"
API_URL  = f"{BASE_URL}/api/searchkit/club-search"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Referer": f"{BASE_URL}/de/verband/services/verein-suchen",
    "Content-Type": "application/json",
}

# ── Game Center league config ─────────────────────────────────────────────────
GC_LEAGUES = [
    ("NLA_WOMEN", "f", "6608", "NLA Women"),
    ("NLA_MEN",   "m", "6609", "NLA Men"),
    ("NLB_WOMEN", "f", "6610", "NLB Women"),
    ("NLB_MEN",   "m", "6611", "NLB Men"),
    ("1L_WOMEN",  "f", "6612", "1. Liga Women"),
    ("1L_MEN",    "m", "6613", "1. Liga Men"),
]

# ── Canton lookup from postal code ────────────────────────────────────────────
_POSTAL_RANGES = [
    (1000,1295,"VD"),(1296,1297,"GE"),(1298,1347,"VD"),(1348,1373,"VD"),
    (1374,1416,"VD"),(1417,1452,"VD"),(1453,1469,"FR"),(1470,1524,"FR"),
    (1525,1529,"VD"),(1530,1695,"FR"),(1700,1797,"FR"),(1800,1869,"VD"),
    (1870,1945,"VS"),(1950,1999,"VS"),
    (2000,2149,"NE"),(2200,2350,"BE"),(2500,2579,"BE"),(2580,2616,"BE"),
    (2720,2762,"BE"),(2800,2855,"JU"),(2900,2999,"JU"),
    (3000,3327,"BE"),(3360,3550,"BE"),(3551,3700,"BE"),(3702,3999,"BE"),
    (4000,4059,"BS"),(4101,4153,"BL"),(4200,4229,"BL"),(4232,4341,"SO"),
    (4410,4469,"BL"),(4490,4499,"SO"),(4500,4579,"SO"),(4600,4703,"SO"),
    (4704,4799,"SO"),  # Solothurn Thal/Gäu (Balsthal, Welschenrohr...)
    (4800,4853,"AG"),(4856,4917,"AG"),
    (4900,4999,"BE"),  # Oberaargau (Langenthal, Huttwil, Madiswil...)
    (5000,5745,"AG"),  # AG ends at Safenwil
    (5746,5746,"SO"),  # Walterswil
    (5747,5999,"AG"),  # remaining AG
    (6000,6019,"LU"),(6020,6045,"LU"),(6046,6056,"OW"),(6060,6072,"OW"),
    (6073,6083,"NW"),(6084,6084,"OW"),(6085,6086,"NW"),(6102,6197,"LU"),
    (6200,6288,"LU"),(6289,6295,"ZG"),(6300,6354,"ZG"),(6355,6374,"SZ"),
    (6375,6382,"NW"),(6383,6440,"SZ"),(6441,6469,"UR"),(6472,6499,"UR"),
    (6500,6999,"TI"),
    (7000,7745,"GR"),
    (8000,8099,"ZH"),(8100,8194,"ZH"),(8200,8269,"SH"),(8270,8299,"TG"),
    (8300,8499,"ZH"),(8500,8595,"TG"),(8596,8615,"ZH"),(8616,8718,"SG"),
    (8719,8762,"GL"),(8763,8898,"SG"),(8900,8999,"ZH"),
    (9000,9249,"SG"),(9300,9498,"SG"),(9500,9658,"SG"),
]

def postal_to_canton(postal: str) -> str:
    if not postal or not postal.isdigit() or len(postal) != 4:
        return ""
    p = int(postal)
    for lo, hi, c in _POSTAL_RANGES:
        if lo <= p <= hi:
            return c
    return ""


def clean_url(url: Optional[str]) -> str:
    if not url:
        return ""
    url = url.strip()
    if url.startswith("//"):
        return "https:" + url
    if not url.startswith("http"):
        if url.startswith("www."):
            return "https://" + url
        return ""
    return url


def clean_text(t: Optional[str]) -> str:
    if not t:
        return ""
    return re.sub(r"\s+", " ", t).strip()


# ── SearchKit API ─────────────────────────────────────────────────────────────

def fetch_all_clubs_via_api() -> list[dict]:
    """
    Query the volleyball.ch SearchKit API to get ALL registered clubs.
    Returns structured club data with leagues, logos, and location.
    """
    print("\n=== Fetching clubs from SearchKit API ===")
    all_hits: list[dict] = []

    page = 0
    hits_per_page = 500  # request maximum to minimize round-trips

    while True:
        payload = [{
            "indexName": "clubs-0_caption_asc",
            "params": {
                "facets": [
                    "activeLeaguesMen",
                    "activeLeaguesWomen",
                    "juniorteamsMen",
                    "juniorteamsWomen",
                    "offers",
                ],
                "highlightPostTag": "__/ais-highlight__",
                "highlightPreTag": "__ais-highlight__",
                "hitsPerPage": hits_per_page,
                "maxValuesPerFacet": 100,
                "page": page,
                "query": "",
            },
        }]

        try:
            resp = requests.post(API_URL, headers=HEADERS, json=payload, timeout=20)
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            print(f"  WARNING: API error on page {page}: {e}")
            break

        result = data["results"][0]
        hits      = result.get("hits", [])
        nb_pages  = result.get("nbPages", 1)
        nb_hits   = result.get("nbHits", 0)

        print(f"  Page {page+1}/{nb_pages}: {len(hits)} clubs  (total available: {nb_hits})")

        if page == 0:
            facets_path = DATA_DIR / "club-search-facets.json"
            facets_path.write_text(
                json.dumps(result.get("facets", {}), ensure_ascii=False, indent=2),
                encoding="utf-8",
            )

        all_hits.extend(hits)

        if page + 1 >= nb_pages:
            break
        page += 1
        time.sleep(0.5)

    print(f"  Total clubs from API: {len(all_hits)}")
    return all_hits


def normalize_api_hit(hit: dict) -> dict:
    """Convert a SearchKit API hit into our standard club dict."""
    zip_code = str(hit.get("zip", "")).strip()
    city     = hit.get("city", "").strip()
    canton   = postal_to_canton(zip_code) if zip_code else hit.get("canton", "")

    website = clean_url(hit.get("website", ""))
    logo    = hit.get("logo", "")

    leagues_w = hit.get("activeLeaguesWomen", [])
    leagues_m = hit.get("activeLeaguesMen",   [])
    jt_w      = hit.get("juniorteamsWomen",   [])
    jt_m      = hit.get("juniorteamsMen",     [])
    offers    = hit.get("offers",             [])

    def in_league(leagues: list, key: str) -> bool:
        return key in leagues

    def in_age(jt: list, *ages: str) -> bool:
        return any(a in jt for a in ages)

    return {
        "name":              hit.get("caption", "").strip(),
        "swissVolleyClubId": str(hit.get("objectID", "")),
        "postalCode":        zip_code,
        "town":              city,
        "canton":            canton,
        "website":           website,
        "logo":              logo,
        # Senior leagues
        "hasNLAWomen":       in_league(leagues_w, "NLA"),
        "hasNLBWomen":       in_league(leagues_w, "NLB"),
        "has1LigaWomen":     in_league(leagues_w, "1L"),
        "has2LigaWomen":     in_league(leagues_w, "2L"),
        "has3LigaWomen":     in_league(leagues_w, "3L"),
        "has4LigaWomen":     in_league(leagues_w, "4L"),
        "has5LigaWomen":     in_league(leagues_w, "5L"),
        "hasNLAMen":         in_league(leagues_m, "NLA"),
        "hasNLBMen":         in_league(leagues_m, "NLB"),
        "has1LigaMen":       in_league(leagues_m, "1L"),
        "has2LigaMen":       in_league(leagues_m, "2L"),
        "has3LigaMen":       in_league(leagues_m, "3L"),
        "has4LigaMen":       in_league(leagues_m, "4L"),
        "has5LigaMen":       in_league(leagues_m, "5L"),
        # Youth
        "hasU23Women":       in_age(jt_w, "U23"),
        "hasU20Women":       in_age(jt_w, "U20"),
        "hasU18Women":       in_age(jt_w, "U18"),
        "hasU17Women":       in_age(jt_w, "U17"),
        "hasU16Women":       in_age(jt_w, "U16"),
        "hasU14Women":       in_age(jt_w, "U14"),
        "hasU23Men":         in_age(jt_m, "U23"),
        "hasU20Men":         in_age(jt_m, "U20"),
        "hasU18Men":         in_age(jt_m, "U18"),
        "hasU17Men":         in_age(jt_m, "U17"),
        "hasU16Men":         in_age(jt_m, "U16"),
        "hasU14Men":         in_age(jt_m, "U14"),
        # Other offers
        "hasKidsVolley":          "kidsVolley" in offers,
        "hasBeachWomen":          "activeBeachWomen" in offers,
        "hasBeachMen":            "activeBeachMen" in offers,
        "hasBeachJuniorinnen":    "juniorteamsBeachWomen" in offers,
        "hasBeachJunioren":       "juniorteamsBeachMen" in offers,
        "hasOtherAdult":          "additionalOffersAdults" in offers,
        "hasOtherYouth":          "additionalOffersJuniors" in offers,
        # Keep raw arrays for advanced filtering
        "_raw_leagues_women":     leagues_w,
        "_raw_leagues_men":       leagues_m,
        "_raw_junior_women":      jt_w,
        "_raw_junior_men":        jt_m,
        "_raw_offers":            offers,
    }


# ── Game Center scraper ───────────────────────────────────────────────────────

async def scrape_game_center(page: Page) -> dict[str, dict]:
    """
    Scrape Game Center pages for NLA/NLB/1L teams using BeautifulSoup.
    Returns dict keyed by swissVolleyClubId.
    """
    print("\n=== Scraping Game Center (NLA/NLB/1L) ===")
    gc_data: dict[str, dict] = {}

    for league_key, gender, league_id, label in GC_LEAGUES:
        url = f"{BASE_URL}/de/game-center?gender={gender}&i_region=SV&i_league={league_id}"
        print(f"  > {label}")

        try:
            await page.goto(url, wait_until="networkidle", timeout=30000)
            await page.wait_for_timeout(4000)
            html = await page.content()
        except Exception as e:
            print(f"    WARNING: Page load error: {e}")
            continue

        soup = BeautifulSoup(html, "lxml")

        # Links are relative: "game-center/club/XXXXX/team/YYY"
        team_links = soup.find_all(
            "a", href=re.compile(r"game-center/club/\d+/team/\d+")
        )
        print(f"    Found {len(team_links)} team links")

        for link in team_links:
            href = link["href"]
            m = re.search(r"game-center/club/(\d+)/team/(\d+)", href)
            if not m:
                continue
            club_id = m.group(1)
            team_id = m.group(2)

            # Extract club name
            name_p = link.find("p")
            if name_p:
                name = clean_text(name_p.get_text())
            else:
                img = link.find("img")
                if img:
                    alt  = img.get("alt", "")
                    name = re.sub(r"(?i)^Logo\s+Team\s+", "", alt).strip()
                else:
                    name = clean_text(link.get_text())

            # Extract logo
            img  = link.find("img")
            logo = ""
            if img and img.get("src"):
                src  = img["src"]
                logo = src if src.startswith("http") else BASE_URL + "/" + src.lstrip("/")

            if club_id not in gc_data:
                gc_data[club_id] = {
                    "swissVolleyClubId":  club_id,
                    "name":               name,
                    "logo":               logo,
                    "teamIds":            [],
                    "gcHasNLAMen":        False,
                    "gcHasNLAWomen":      False,
                    "gcHasNLBMen":        False,
                    "gcHasNLBWomen":      False,
                    "gcHas1LigaMen":      False,
                    "gcHas1LigaWomen":    False,
                }
            elif not gc_data[club_id]["name"]:
                gc_data[club_id]["name"] = name
            if logo and not gc_data[club_id]["logo"]:
                gc_data[club_id]["logo"] = logo

            gc_data[club_id]["teamIds"].append(team_id)

            flag_map = {
                "NLA_WOMEN": "gcHasNLAWomen",
                "NLA_MEN":   "gcHasNLAMen",
                "NLB_WOMEN": "gcHasNLBWomen",
                "NLB_MEN":   "gcHasNLBMen",
                "1L_WOMEN":  "gcHas1LigaWomen",
                "1L_MEN":    "gcHas1LigaMen",
            }
            if league_key in flag_map:
                gc_data[club_id][flag_map[league_key]] = True

    print(f"\n  Unique clubs from Game Center: {len(gc_data)}")
    return gc_data


# ── Club detail scraper ───────────────────────────────────────────────────────

async def scrape_club_detail(page: Page, club_id: str) -> dict:
    """
    Parse a club's detail page with BeautifulSoup for contact + social media.
    """
    url = f"{BASE_URL}/de/game-center/club/{club_id}"
    try:
        await page.goto(url, wait_until="networkidle", timeout=25000)
        await page.wait_for_timeout(2000)
        html = await page.content()
    except Exception as e:
        print(f"    WARNING: Detail page error for {club_id}: {e}")
        return {}

    soup = BeautifulSoup(html, "lxml")
    detail: dict = {}

    email_a = soup.find("a", href=re.compile(r"^mailto:", re.I))
    if email_a:
        detail["email"] = email_a["href"].replace("mailto:", "").strip()

    phone_a = soup.find("a", href=re.compile(r"^tel:", re.I))
    if phone_a:
        detail["phone"] = phone_a["href"].replace("tel:", "").strip()

    for field, pattern in [
        ("facebook",  re.compile(r"facebook\.com", re.I)),
        ("instagram", re.compile(r"instagram\.com", re.I)),
        ("twitter",   re.compile(r"twitter\.com|x\.com", re.I)),
        ("youtube",   re.compile(r"youtube\.com", re.I)),
        ("tiktok",    re.compile(r"tiktok\.com", re.I)),
    ]:
        link = soup.find("a", href=pattern)
        if link:
            detail[field] = link["href"].strip()

    return detail


# ── Logo scraper from Game Center club pages ──────────────────────────────────

async def scrape_club_logos(context: BrowserContext, clubs_needing_logos: list[dict]) -> dict[str, str]:
    """
    For each club that has a swissVolleyClubId but no logo,
    visit its Game Center page and extract the club logo URL.
    Returns dict of swissVolleyClubId → logo URL.
    """
    print(f"\n=== Scraping logos for {len(clubs_needing_logos)} clubs ===")
    logos: dict[str, str] = {}
    page = await context.new_page()

    for i, club in enumerate(clubs_needing_logos):
        cid  = club.get("swissVolleyClubId", "")
        name = club.get("name", "")
        if not cid:
            continue

        url = f"{BASE_URL}/de/game-center/club/{cid}"
        try:
            await page.goto(url, wait_until="networkidle", timeout=25000)
            await page.wait_for_timeout(1500)
            html = await page.content()
        except Exception as e:
            print(f"  [{i+1}/{len(clubs_needing_logos)}] {name}: timeout/error")
            continue

        soup = BeautifulSoup(html, "lxml")
        norm = norm_name(name)

        # Find all _images-volleymanager images
        imgs = soup.find_all("img", src=re.compile(r"_images-volleymanager", re.I))

        # Prefer images whose alt text matches the club name at 300x0 size.
        # Fall back to 770x0 (banner) images with matching alt, converting to 300x0.
        # Final fallback: any 300x0 image on the page.
        best = None
        norm = norm_name(name)
        banner_fallback = None

        for img in imgs:
            alt  = img.get("alt", "")
            src  = img.get("src", "")
            if not src:
                continue
            alt_norm = norm_name(alt)
            name_matches = alt_norm and norm and (
                alt_norm in norm or norm in alt_norm or alt_norm == norm
            )
            if "770x0" in src:
                # Convert banner to 300x0 thumbnail
                logo_src = src.replace("770x0", "300x0")
                if name_matches and not best:
                    best = logo_src
                elif not banner_fallback:
                    banner_fallback = logo_src
            elif "300x0" in src:
                if name_matches and not best:
                    best = src

        if not best and banner_fallback:
            best = banner_fallback
        if not best and imgs:
            # Absolute last resort: first image, converted to 300x0
            src = imgs[0].get("src", "")
            best = src.replace("770x0", "300x0") if "770x0" in src else src

        if best:
            logos[cid] = best
            print(f"  [{i+1}/{len(clubs_needing_logos)}] {name}: logo found")
        else:
            print(f"  [{i+1}/{len(clubs_needing_logos)}] {name}: no logo found")

        if i > 0 and i % 10 == 0:
            await asyncio.sleep(0.5)  # gentle rate limiting

    await page.close()
    print(f"  Logos found: {len(logos)} / {len(clubs_needing_logos)}")
    return logos


# ── Historical data loaders ───────────────────────────────────────────────────

def load_verified_teams() -> dict[str, dict]:
    """
    Load data/game-center-verified-teams.json.
    Returns dict keyed by swissVolleyClubId.
    44 NLA/NLB clubs with confirmed league status from a previous full-season scrape.
    """
    path = DATA_DIR / "game-center-verified-teams.json"
    if not path.exists():
        print("  WARNING: game-center-verified-teams.json not found, skipping")
        return {}
    with path.open(encoding="utf-8") as f:
        teams: list[dict] = json.load(f)
    clubs: dict[str, dict] = {}
    for t in teams:
        cid    = str(t.get("clubId", ""))
        league = t.get("league", "")
        gender = t.get("gender", "")  # "men" | "women"
        if not cid:
            continue
        if cid not in clubs:
            clubs[cid] = {
                "swissVolleyClubId": cid,
                "name":              t.get("teamName", ""),
                "vtHasNLAMen":       False,
                "vtHasNLAWomen":     False,
                "vtHasNLBMen":       False,
                "vtHasNLBWomen":     False,
            }
        if league == "NLA" and gender == "men":     clubs[cid]["vtHasNLAMen"]   = True
        if league == "NLA" and gender == "women":   clubs[cid]["vtHasNLAWomen"] = True
        if league == "NLB" and gender == "men":     clubs[cid]["vtHasNLBMen"]   = True
        if league == "NLB" and gender == "women":   clubs[cid]["vtHasNLBWomen"] = True
    print(f"  Loaded {len(clubs)} clubs from game-center-verified-teams.json")
    return clubs


def _empty_club(name: str = "") -> dict:
    """Return a blank club dict with all expected boolean fields."""
    return {
        "name": name,
        "swissVolleyClubId": "",
        "postalCode": "", "town": "", "canton": "", "website": "",
        "logo": "", "email": "",
        "hasNLAWomen": False, "hasNLBWomen": False,
        "has1LigaWomen": False, "has2LigaWomen": False,
        "has3LigaWomen": False, "has4LigaWomen": False, "has5LigaWomen": False,
        "hasNLAMen": False, "hasNLBMen": False,
        "has1LigaMen": False, "has2LigaMen": False,
        "has3LigaMen": False, "has4LigaMen": False, "has5LigaMen": False,
        "hasU23Women": False, "hasU20Women": False, "hasU18Women": False,
        "hasU17Women": False, "hasU16Women": False, "hasU14Women": False,
        "hasU23Men": False, "hasU20Men": False, "hasU18Men": False,
        "hasU17Men": False, "hasU16Men": False, "hasU14Men": False,
        "hasKidsVolley": False,
        "hasBeachWomen": False, "hasBeachMen": False,
        "hasBeachJuniorinnen": False, "hasBeachJunioren": False,
        "hasOtherAdult": False, "hasOtherYouth": False,
    }


def load_clubs_with_websites() -> list[dict]:
    """
    Load data/clubs-with-websites.json (233 clubs with postalCode, town, email).
    Returns a list of normalised club dicts.
    """
    path = DATA_DIR / "clubs-with-websites.json"
    if not path.exists():
        print("  WARNING: clubs-with-websites.json not found, skipping")
        return []
    with path.open(encoding="utf-8") as f:
        raw = json.load(f)
    src = raw if isinstance(raw, list) else raw.get("clubs", [])

    clubs = []
    for s in src:
        c = _empty_club(s.get("name", "").strip())
        pc = str(s.get("postalCode", "")).strip()
        c["postalCode"] = pc
        c["town"]       = s.get("town", "").strip()
        c["canton"]     = postal_to_canton(pc) if pc else ""
        c["website"]    = clean_url(s.get("website", ""))
        c["logo"]       = clean_url(s.get("logo", ""))
        # Clean messy emails (sometimes concatenated with "AngebotVolleyball")
        raw_email = s.get("email", "")
        if raw_email:
            m = re.match(r"([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})", raw_email)
            c["email"] = m.group(1) if m else ""
        clubs.append(c)

    print(f"  Loaded {len(clubs)} clubs from clubs-with-websites.json")
    return clubs


def load_website_lookup() -> dict[str, str]:
    """
    Load data/club-websites.json (254 clubs, name → website URL).
    Returns dict of norm_name → website URL.
    Filters out known invalid/generic URLs.
    """
    _INVALID_DOMAINS = {
        "sofascore.com", "flashscore.com", "soccerway.com",
        "facebook.com", "instagram.com", "twitter.com",
        "volleyball.ch",  # don't override with the federation site
    }
    path = DATA_DIR / "club-websites.json"
    if not path.exists():
        return {}
    with path.open(encoding="utf-8") as f:
        raw = json.load(f)
    src = list(raw.values()) if isinstance(raw, dict) else raw
    result = {}
    for entry in src:
        if not isinstance(entry, dict):
            continue
        name = entry.get("name", "")
        url  = clean_url(entry.get("website", ""))
        if not name or not url:
            continue
        # Skip obviously wrong URLs
        domain = re.sub(r"^https?://(www\.)?", "", url).split("/")[0].lower()
        if any(bad in domain for bad in _INVALID_DOMAINS):
            continue
        result[norm_name(name)] = url
    print(f"  Loaded {len(result)} website entries from club-websites.json")
    return result


STANDARD_LEAGUES = {"NLA", "NLB", "1L", "2L", "3L", "4L", "5L"}

# Maps (league, gender) → (fieldMen, fieldWomen) flag keys
_LEAGUE_FIELD_MAP = {
    "NLA":  ("hasNLAMen",     "hasNLAWomen"),
    "NLB":  ("hasNLBMen",     "hasNLBWomen"),
    "1L":   ("has1LigaMen",   "has1LigaWomen"),
    "2L":   ("has2LigaMen",   "has2LigaWomen"),
    "3L":   ("has3LigaMen",   "has3LigaWomen"),
    "4L":   ("has4LigaMen",   "has4LigaWomen"),
    "5L":   ("has5LigaMen",   "has5LigaWomen"),
}


def load_thorough_leagues() -> dict[str, dict]:
    """
    Load data/club-leagues-thorough.json.
    This file was scraped from club websites and contains 226 clubs with
    their league participation (NLA-5L, senior category).
    Returns dict of norm_name → dict of has<X><Gender> flags.
    """
    path = DATA_DIR / "club-leagues-thorough.json"
    if not path.exists():
        print("  WARNING: club-leagues-thorough.json not found, skipping")
        return {}
    with path.open(encoding="utf-8") as f:
        raw: list[dict] = json.load(f)

    result: dict[str, dict] = {}
    for entry in raw:
        name = entry.get("name", "").strip()
        if not name:
            continue
        flags: dict[str, bool] = {}
        for lg_entry in entry.get("leagues", []):
            if not isinstance(lg_entry, dict):
                continue
            if lg_entry.get("category") != "senior":
                continue
            league = lg_entry.get("league", "")
            gender = lg_entry.get("gender", "unknown")
            if league not in STANDARD_LEAGUES:
                continue
            field_men, field_women = _LEAGUE_FIELD_MAP[league]
            if gender == "men":
                flags[field_men] = True
            elif gender == "women":
                flags[field_women] = True
            else:
                # Unknown gender — set both conservatively
                flags[field_men] = True
                flags[field_women] = True
        if flags:
            result[norm_name(name)] = flags

    print(f"  Loaded league flags for {len(result)} clubs from club-leagues-thorough.json")
    return result


# ── Merge ─────────────────────────────────────────────────────────────────────

def norm_name(n: str) -> str:
    return re.sub(r"[^a-z0-9]", "", n.lower())


def find_match(
    name: str,
    cid: str,
    lookup_by_id: dict[str, dict],
    lookup_by_name: dict[str, dict],
    fuzzy: bool = True,
) -> Optional[dict]:
    """Find a club dict from a lookup by ID then name."""
    if cid:
        m = lookup_by_id.get(cid)
        if m:
            return m
    if name:
        nn = norm_name(name)
        m  = lookup_by_name.get(nn)
        if m:
            return m
        if fuzzy:
            for gn, gv in lookup_by_name.items():
                if nn and gn and (nn in gn or gn in nn) and len(nn) > 4:
                    return gv
    return None


def merge_all_sources(
    api_clubs:        list[dict],
    gc_clubs:         dict[str, dict],  # live GC scrape
    vt_clubs:         dict[str, dict],  # game-center-verified-teams
    base_clubs:       list[dict],       # clubs-with-websites
    web_lookup:       dict[str, str],   # name → website URL
    thorough_leagues: dict[str, dict],  # norm_name → league flags from club websites
) -> list[dict]:
    """
    Multi-source merge:
      1. Start with base_clubs (broadest coverage, location data)
      2. Apply vt_clubs NLA/NLB flags by ID and name match
      3. Apply live gc_clubs NLA/NLB/1L flags by ID and name match
      4. Apply thorough_leagues 1L-5L flags by name match
      5. Override/enrich with api_clubs (most accurate when available):
         - logo, website, league flags, youth flags
      Priority: api > gc_live > vt > thorough_leagues > base
    """
    print("  Building lookup tables...")

    # --- Build lookup tables ---
    api_by_id   = {c["swissVolleyClubId"]: c for c in api_clubs if c.get("swissVolleyClubId")}
    api_by_name = {norm_name(c["name"]): c for c in api_clubs if c.get("name")}

    gc_by_id    = gc_clubs
    gc_by_name  = {norm_name(v["name"]): v for v in gc_clubs.values() if v.get("name")}

    vt_by_id    = vt_clubs
    vt_by_name  = {norm_name(v["name"]): v for v in vt_clubs.values() if v.get("name")}

    # Collect all known club IDs to avoid duplicates
    seen_ids:   set[str] = set()
    seen_names: set[str] = set()
    merged:     list[dict] = []

    def _apply_api(result: dict, api: dict) -> dict:
        """Overlay API data onto result (API wins for most fields)."""
        if api.get("logo"):              result["logo"]     = api["logo"]
        if api.get("website"):           result["website"]  = api["website"]
        if api.get("postalCode"):        result["postalCode"] = api["postalCode"]
        if api.get("town"):              result["town"]     = api["town"]
        if api.get("canton"):            result["canton"]   = api["canton"]
        if not result.get("swissVolleyClubId") and api.get("swissVolleyClubId"):
            result["swissVolleyClubId"] = api["swissVolleyClubId"]
        # League flags: API is authoritative when available
        for key in [
            "hasNLAWomen","hasNLBWomen","has1LigaWomen","has2LigaWomen",
            "has3LigaWomen","has4LigaWomen","has5LigaWomen",
            "hasNLAMen","hasNLBMen","has1LigaMen","has2LigaMen",
            "has3LigaMen","has4LigaMen","has5LigaMen",
            "hasU23Women","hasU20Women","hasU18Women","hasU17Women","hasU16Women","hasU14Women",
            "hasU23Men","hasU20Men","hasU18Men","hasU17Men","hasU16Men","hasU14Men",
            "hasKidsVolley","hasBeachWomen","hasBeachMen",
            "hasBeachJuniorinnen","hasBeachJunioren","hasOtherAdult","hasOtherYouth",
        ]:
            if api.get(key):
                result[key] = True
        return result

    def _apply_gc(result: dict, gc: dict) -> dict:
        """Apply live game-center flags (NLA/NLB/1L only)."""
        if gc.get("gcHasNLAMen"):     result["hasNLAMen"]     = True
        if gc.get("gcHasNLAWomen"):   result["hasNLAWomen"]   = True
        if gc.get("gcHasNLBMen"):     result["hasNLBMen"]     = True
        if gc.get("gcHasNLBWomen"):   result["hasNLBWomen"]   = True
        if gc.get("gcHas1LigaMen"):   result["has1LigaMen"]   = True
        if gc.get("gcHas1LigaWomen"): result["has1LigaWomen"] = True
        if not result.get("logo") and gc.get("logo"):
            result["logo"] = gc["logo"]
        if not result.get("swissVolleyClubId") and gc.get("swissVolleyClubId"):
            result["swissVolleyClubId"] = gc["swissVolleyClubId"]
        return result

    def _apply_vt(result: dict, vt: dict) -> dict:
        """Apply verified-teams NLA/NLB flags."""
        if vt.get("vtHasNLAMen"):   result["hasNLAMen"]   = True
        if vt.get("vtHasNLAWomen"): result["hasNLAWomen"] = True
        if vt.get("vtHasNLBMen"):   result["hasNLBMen"]   = True
        if vt.get("vtHasNLBWomen"): result["hasNLBWomen"] = True
        if not result.get("swissVolleyClubId") and vt.get("swissVolleyClubId"):
            result["swissVolleyClubId"] = vt["swissVolleyClubId"]
        return result

    def _apply_thorough(result: dict, flags: dict) -> dict:
        """Apply league flags scraped from club websites (thorough data)."""
        for key, val in flags.items():
            if val and not result.get(key):
                result[key] = True
        return result

    # ── Step 1: Process base clubs (clubs-with-websites) ──────────────────────
    print("  Processing base clubs...")
    for bc in base_clubs:
        name = bc.get("name", "").strip()
        if not name:
            continue
        nn = norm_name(name)
        result = dict(bc)

        # Find matching API club
        api = find_match(name, "", api_by_id, api_by_name)
        cid = result.get("swissVolleyClubId", "")
        if api:
            cid = api.get("swissVolleyClubId", cid)
            result = _apply_api(result, api)
            seen_ids.add(cid)

        # Apply verified-teams data
        vt = find_match(name, cid, vt_by_id, vt_by_name)
        if vt:
            result = _apply_vt(result, vt)
            seen_ids.add(vt["swissVolleyClubId"])

        # Apply live GC data
        gc = find_match(name, cid, gc_by_id, gc_by_name)
        if gc:
            result = _apply_gc(result, gc)
            seen_ids.add(gc.get("swissVolleyClubId", ""))

        # Apply thorough league data (lower priority – only fills gaps)
        tl = thorough_leagues.get(nn)
        if tl:
            result = _apply_thorough(result, tl)

        seen_names.add(nn)
        merged.append(result)

    # ── Step 2: Add API clubs not in base ─────────────────────────────────────
    print("  Adding API-only clubs...")
    for api in api_clubs:
        cid  = api.get("swissVolleyClubId", "")
        name = api.get("name", "")
        if cid in seen_ids or norm_name(name) in seen_names:
            continue
        result = _empty_club(name)
        result = _apply_api(result, api)
        # Apply vt / gc
        vt = find_match(name, cid, vt_by_id, vt_by_name)
        if vt:
            result = _apply_vt(result, vt)
        gc = find_match(name, cid, gc_by_id, gc_by_name)
        if gc:
            result = _apply_gc(result, gc)
        tl = thorough_leagues.get(norm_name(name))
        if tl:
            result = _apply_thorough(result, tl)
        if cid:
            seen_ids.add(cid)
        seen_names.add(norm_name(name))
        merged.append(result)

    # ── Step 3: Add verified-teams clubs not yet in merged ────────────────────
    print("  Adding verified-teams-only clubs...")
    for cid, vt in vt_clubs.items():
        name = vt.get("name", "")
        if cid in seen_ids or norm_name(name) in seen_names:
            continue
        result = _empty_club(name)
        result["swissVolleyClubId"] = cid
        result = _apply_vt(result, vt)
        gc = find_match(name, cid, gc_by_id, gc_by_name)
        if gc:
            result = _apply_gc(result, gc)
        tl = thorough_leagues.get(norm_name(name))
        if tl:
            result = _apply_thorough(result, tl)
        seen_ids.add(cid)
        seen_names.add(norm_name(name))
        merged.append(result)

    # ── Step 4: Add live GC clubs not yet in merged ───────────────────────────
    print("  Adding live GC-only clubs...")
    for cid, gc in gc_clubs.items():
        name = gc.get("name", "")
        if cid in seen_ids or norm_name(name) in seen_names:
            continue
        result = _empty_club(name)
        result = _apply_gc(result, gc)
        seen_ids.add(cid)
        if name:
            seen_names.add(norm_name(name))
        merged.append(result)

    # Compute canton from postal if missing; fill website from web_lookup
    for c in merged:
        if not c.get("canton") and c.get("postalCode"):
            c["canton"] = postal_to_canton(c["postalCode"])
        if not c.get("website"):
            url = web_lookup.get(norm_name(c.get("name", "")))
            if url:
                c["website"] = url

    merged.sort(key=lambda c: c.get("name", "").lower())
    return [{k: v for k, v in c.items() if not k.startswith("_raw_")} for c in merged]


# ── Main ──────────────────────────────────────────────────────────────────────

async def main():
    print("Swiss Volleyball Clubs - BeautifulSoup + API Scraper")
    print("=" * 60)

    # 1. SearchKit API (structured JSON, all registered clubs)
    print("\n--- Source 1: SearchKit API ---")
    raw_hits  = fetch_all_clubs_via_api()
    api_clubs = [normalize_api_hit(h) for h in raw_hits]
    print(f"  Normalized {len(api_clubs)} clubs from API")

    # 2. Live Game Center scrape via Playwright + BeautifulSoup
    print("\n--- Source 2: Live Game Center ---")
    gc_clubs: dict[str, dict] = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        context: BrowserContext = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            ),
            locale="de-CH",
            viewport={"width": 1280, "height": 900},
        )
        page = await context.new_page()
        gc_clubs = await scrape_game_center(page)
        await browser.close()

    # 3. Historical data files
    print("\n--- Source 3: Historical data files ---")
    vt_clubs       = load_verified_teams()
    base_clubs     = load_clubs_with_websites()
    web_lookup     = load_website_lookup()
    thorough_leagues = load_thorough_leagues()

    # 4. Merge all sources (first pass — without logos for non-API clubs)
    print("\n=== Merging all data sources ===")
    merged = merge_all_sources(api_clubs, gc_clubs, vt_clubs, base_clubs, web_lookup, thorough_leagues)
    print(f"  Total merged clubs: {len(merged)}")

    # 5. Scrape logos for clubs that have a swissVolleyClubId but no logo
    print("\n--- Logo enrichment ---")
    clubs_needing_logos = [
        c for c in merged
        if c.get("swissVolleyClubId") and not c.get("logo")
    ]
    print(f"  Clubs needing logos: {len(clubs_needing_logos)}")

    if clubs_needing_logos:
        async with async_playwright() as p2:
            browser2 = await p2.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-dev-shm-usage"],
            )
            logo_ctx = await browser2.new_context(
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                ),
                locale="de-CH",
                viewport={"width": 1280, "height": 900},
            )
            logo_map = await scrape_club_logos(logo_ctx, clubs_needing_logos)
            await browser2.close()

        # Apply scraped logos to merged clubs
        for club in merged:
            cid = club.get("swissVolleyClubId", "")
            if cid and cid in logo_map and not club.get("logo"):
                club["logo"] = logo_map[cid]
    else:
        print("  All clubs with IDs already have logos, skipping logo scrape")

    # 6. Save raw output
    raw_output = {
        "apiHits":       raw_hits,
        "gameCenter":    list(gc_clubs.values()),
        "verifiedTeams": list(vt_clubs.values()),
    }
    RAW_FILE.write_text(
        json.dumps(raw_output, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"  Raw data saved  -> {RAW_FILE.name}")

    # 7. Save final output
    final = {
        "description": "Swiss Volleyball Clubs - merged from SearchKit API, Game Center, and historical data",
        "lastUpdated": time.strftime("%Y-%m-%d"),
        "totalClubs":  len(merged),
        "sources": [
            "https://www.volleyball.ch/api/searchkit/club-search (SearchKit API)",
            "https://www.volleyball.ch/de/game-center (Playwright + BeautifulSoup)",
            "data/game-center-verified-teams.json (44 NLA/NLB clubs, previously verified)",
            "data/clubs-with-websites.json (233 clubs with location data)",
            "data/club-websites.json (254 clubs with website URLs)",
            "data/club-leagues-thorough.json (226 clubs with 1L-5L league data from websites)",
        ],
        "clubs": merged,
    }
    OUT_FILE.write_text(
        json.dumps(final, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"  Final data saved -> {OUT_FILE.name}")

    # 8. Print summary
    def _s(key: str) -> int:
        return sum(1 for c in merged if c.get(key))

    print("\n=== Summary ===")
    print(f"  Total clubs:   {len(merged)}")
    print(f"  With canton:   {_s('canton')}")
    print(f"  With website:  {_s('website')}")
    print(f"  With email:    {_s('email')}")
    print(f"  With logo:     {_s('logo')}")
    print(f"  With club ID:  {_s('swissVolleyClubId')}")
    print(f"  NLA Men:       {_s('hasNLAMen')}")
    print(f"  NLA Women:     {_s('hasNLAWomen')}")
    print(f"  NLB Men:       {_s('hasNLBMen')}")
    print(f"  NLB Women:     {_s('hasNLBWomen')}")
    print(f"  1L Men:        {_s('has1LigaMen')}")
    print(f"  1L Women:      {_s('has1LigaWomen')}")
    print(f"  2L Men:        {_s('has2LigaMen')}")
    print(f"  2L Women:      {_s('has2LigaWomen')}")
    print(f"  Kids Volley:   {_s('hasKidsVolley')}")
    print(f"  Beach Women:   {_s('hasBeachWomen')}")
    print(f"\n  Output: {OUT_FILE}")
    print("Done!")


if __name__ == "__main__":
    asyncio.run(main())
