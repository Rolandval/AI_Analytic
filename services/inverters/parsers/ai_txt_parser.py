import asyncio
import json
import time
import google.generativeai as genai
from typing import List, Dict
from dotenv import load_dotenv
import os

load_dotenv()


genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config={
        "temperature": 0.3,
        "top_p": 1,
        "top_k": 40,
        "max_output_tokens": 999999
    }
)


def parse_chunk(index: int, data: str) -> List[Dict]:
    prompt = f"""
Дій як професійний парсер і спеціаліст з продажу інверторів для сонячних електростанцій.

📌 ГОЛОВНЕ: спочатку визнач, чи дійсно товар є інвертором для сонячних електростанцій. Якщо це не інвертор — ПРОПУСТИ його.

З цього TXT-фрагменту повністю витягни дані про інвертори та перетвори їх у масив JSON об'єктів такого формату:
{{
  "brand": brand,
  "name": model,
  "full_name": full_name,
  "price": price,
  "inverter_type": inverter_type,
  "generation": generation,
  "string_count": string_count,
  "firmware": firmware,
  "power": power
}}

📌 Деталі парсингу:
- `brand`: назва бренду одним словом (навіть якщо вказано з помилкою або у скороченні)
- `name`: назва моделі інвертора (якщо відсутня — просто поверни бренд)
- `full_name`: повна назва або опис інвертора
- `price`: найменша оптова ціна у доларах США за 1 штуку. Якщо ціна в іншій валюті — переведи у долари. Якщо немає ціни — поверни 0.
- `inverter_type`: тип інвертора - "gybrid" (гібридний), "off-grid" (автономний) або "on-grid" (мережевий). Якщо не вказано — поверни "gybrid".
- `generation`: покоління інвертора (наприклад, "3", "4", "5"). Якщо не вказано — поверни "4".
- `string_count`: кількість стрінгів (входів) інвертора як ціле число. Якщо не вказано — поверни 0.
- `firmware`: версія прошивки інвертора. Якщо не вказано — поверни порожній рядок "".
- `power`: потужність інвертора у Вт. Якщо не вказано — поверни 0.

‼️ВАЖЛИВО:
- Уважно аналізуй технічні характеристики для визначення типу інвертора та кількості стрінгів
- Якщо ціна відсутня або дорівнює 0, все одно поверни об'єкт, але з ціною 0

Ось дані:
{data}

❗️Поверни лише чистий JSON у відповідь. Без зайвого тексту.
"""

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()

        # Очищення
        if response_text.startswith("```json"):
            response_text = response_text.replace("```json", "", 1)
        if response_text.endswith("```"):
            response_text = response_text.rsplit("```", 1)[0]

        parsed = json.loads(response_text)
        print(f"✅ Оброблено блок {index}: знайдено {len(parsed)} інверторів")
        return parsed

    except Exception as e:
        print(f"❌ Помилка на блоці {index}: {e}")
        return []


async def ai_parser(all_data: str) -> List[Dict]:
    parsed_results = []
    min_request_time = 10
    
    start_time = time.time()
    result = parse_chunk(0, all_data)
    parsed_results.extend(result)

    elapsed_time = time.time() - start_time
    if elapsed_time < min_request_time:  # не чекаємо після останнього запиту
        wait_time = min_request_time - elapsed_time
        print(f"⏳ Запит виконано за {elapsed_time:.1f} сек. Очікування {wait_time:.1f} секунд перед наступним запитом...")
        time.sleep(wait_time)

    return parsed_results


# Приклад запуску:
    parsed_results = []
    base_wait_time = 10  # Базовий час очікування в секундах
    max_wait_time = 120  # Максимальний час очікування в секундах
    consecutive_errors = 0  # Лічильник послідовних помилок
    
    for i, data in enumerate(all_data):
        start_time = time.time()
        
        # Спроба з повторами при помилках
        max_retries = 3
        for retry in range(max_retries):
            try:
                result = parse_chunk(i, data)
                parsed_results.extend(result)
                consecutive_errors = 0  # Скидаємо лічильник помилок при успіху
                break
            except Exception as e:
                error_message = str(e)
                if "429" in error_message:  # Помилка обмеження швидкості
                    consecutive_errors += 1
                    
                    # Витягуємо час очікування з повідомлення про помилку, якщо можливо
                    retry_delay = 0
                    if "retry_delay" in error_message and "seconds" in error_message:
                        try:
                            # Спроба витягти число секунд з повідомлення про помилку
                            retry_part = error_message.split("retry_delay")[1]
                            seconds_part = retry_part.split("seconds:")[1].split("}")[0].strip()
                            retry_delay = int(seconds_part)
                        except:
                            retry_delay = 0
                    
                    # Розрахунок часу очікування з експоненційним відступанням
                    wait_time = max(
                        base_wait_time * (2 ** consecutive_errors),  # Експоненційне відступання
                        retry_delay + 5  # Використовуємо час з API + запас
                    )
                    wait_time = min(wait_time, max_wait_time)  # Обмежуємо максимальним часом
                    
                    print(f"⚠️ Помилка обмеження швидкості на блоці {i}, спроба {retry+1}/{max_retries}. Очікування {wait_time} секунд...")
                    time.sleep(wait_time)
                    
                    if retry == max_retries - 1:  # Остання спроба
                        print(f"❌ Вичерпано максимальну кількість спроб для блоку {i}")
                        break
                else:
                    # Інша помилка, не пов'язана з обмеженням швидкості
                    print(f"❌ Помилка на блоці {i}: {e}")
                    break
        
        # Завжди чекаємо між запитами, навіть після помилки
        elapsed_time = time.time() - start_time
        
        # Адаптивний час очікування в залежності від кількості послідовних помилок
        adaptive_wait_time = base_wait_time * (1 + (consecutive_errors * 0.5))
        
        if elapsed_time < adaptive_wait_time and i < len(all_data) - 1:
            wait_time = adaptive_wait_time - elapsed_time
            print(f"⏳ Запит виконано за {elapsed_time:.1f} сек. Очікування {wait_time:.1f} секунд перед наступним запитом...")
            time.sleep(wait_time)

    return parsed_results
