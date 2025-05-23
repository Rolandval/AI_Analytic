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


def parse_chunk(index: int, data: Dict[str, str]) -> List[Dict]:
    text = data["sollar_panels"]
    prompt = f"""
Дій як професійний парсер і спеціаліст з продажу сонячних панелей.

📌 ГОЛОВНЕ: спочатку визнач, чи дійсно товар є сонячною панеллю. Якщо це не панель — ПРОПУСТИ його.

З цього HTML-фрагменту повністю витягни дані про сонячні панелі та перетвори їх у масив JSON об'єктів такого формату:
{{
  "brand": brand,
  "name": model,
  "power": power,
  "full_name": full_name,
  "price": price,
  "panel_type": panel_type,
  "cell_type": cell_type,
  "thickness": thickness
}}

📌 Деталі парсингу:
- `brand`: назва бренду одним словом (навіть якщо вказано з помилкою або у скороченні)
- `name`: назва моделі між брендом і потужністю (якщо не знайдено — просто поверни бренд)
- `power`: потужність у ватах (W). Якщо немає — логічно виведи з назви моделі або опису. Якщо неможливо — 0
- `full_name`: повна назва або опис панелі
- `price`: ціна за 1 шт у доларах. Якщо ціна вказана за ват (наприклад, 0.13 або 0,138) — перемнож на `power`. Якщо валюта інша — конвертуй у $ (якщо можливо). Якщо не знайдено — 0
- `panel_type`: одностороння або двостороння. Якщо не вказано — одностороння
- `cell_type`: n-type або p-type. Якщо не вказано — n-type
- `thickness`: товщина панелі в мм. Якщо не вказано — 30

‼️ВАЖЛИВО:
- Ціна формату "0.13", "0,138" — це ціна за ВАТ. Не переплутай з 13$.
  Наприклад: 425W * 0.13 = 55.25$

Ось HTML-дані:
{text}

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
        print(f"✅ Оброблено блок {index}: знайдено {len(parsed)} акумуляторів")
        return parsed

    except Exception as e:
        print(f"❌ Помилка на блоці {index}: {e}")
        return []


async def ai_parser(all_data: List[Dict[str, str]]) -> List[Dict]:
    parsed_results = []
    min_request_time = 10
    for i, data in enumerate(all_data):
        start_time = time.time()
        result = parse_chunk(i, data)
        parsed_results.extend(result)

        elapsed_time = time.time() - start_time
        if elapsed_time < min_request_time and i < len(all_data) - 1:  # не чекаємо після останнього запиту
            wait_time = min_request_time - elapsed_time
            print(f"⏳ Запит виконано за {elapsed_time:.1f} сек. Очікування {wait_time:.1f} секунд перед наступним запитом...")
            time.sleep(wait_time)


    return parsed_results


# # Приклад запуску:async def ai_parser(all_data: List[Dict[str, str]]) -> List[Dict]:
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

