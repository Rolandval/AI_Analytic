import requests
from bs4 import BeautifulSoup
import re
import sys
import os
import logging
import json
from typing import List, Dict, Any, Optional
import time
import random
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from helpers.get_user_agent import get_headers

def get_page_url(page: int):
    page_url = f"https://akbcenter.com.ua/akkumulyatory/?page={page}/"
    return page_url

def get_last_page():
    return 30

def parse_batteries():
    headers = get_headers()
    all_batteries = []

    for i in range(1, get_last_page() + 1):
        page_url = get_page_url(i)
        print(f"Парсимо сторінку {i}: {page_url}")
        response = requests.get(url=page_url, headers=headers)
        
        if response.status_code != 200:
            print(f"Помилка при запиті сторінки {i}: статус {response.status_code}")
            continue

        soup = BeautifulSoup(response.text, 'html.parser')

        battery_container = soup.find("div", attrs={
            "data-type": "width50"
        })

        if battery_container:
            all_batteries.append(battery_container)
        else:
            print(f"Не знайдено контейнер на сторінці {i}")

    return all_batteries
        
print(parse_batteries())
    