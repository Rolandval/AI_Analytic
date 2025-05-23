import asyncio
import json
import google.generativeai as genai
from typing import List, Dict


genai.configure(api_key="AIzaSyBTDRyFPscZuc1wuyvb-4hk7OCUbMnBN1s")  # Заміни на свій ключ

model = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    generation_config={
        "temperature": 0.3,
        "top_p": 1,
        "top_k": 40,
        "max_output_tokens": 999999
    }
)


async def parse_chunk(index: int, data: Dict[str, str]) -> List[Dict]:
    text = data["batteries"]
    prompt = f"""
Діяй як професійний парсер і спеціаліст з продажу автомобільних акумуляторів.

З цього HTML-фрагменту повністю витягни дані про акумулятори та перетвори їх у масив JSON об'єктів такого формату:
{{
  "brand": brand,
  "name": model,
  "volume": volume,
  "full_name": full_name,
  "price": price,
  "c_amps": c_amps,
  "region": region,
  "polarity": polarity,
  "electrolyte": electrolyte
}}

📌 Деталі парсингу:
- 'brand': поверни назву бренду одним словом
- `price`: найменший оптовий
- `name`: назва акумулятора між брендом і об'ємом(якщо пустий рядок то поверни в name назву бренду)
- `c_amps`: пусковий струм(якщо немає то 0)
- `region`: за замовчуванням EUROPE, якщо є "ASIA", то ASIA
- `polarity`: у форматі R+ або L+ (в залежності з якої сторони +(якщо пише (-/+) то це R+)))
- `electrolyte`: AGM, GEL, або LAB (якщо не вказаний)
- `volume`: ємність в Ah

Ось HTML-дані:
{text}

❗️Поверни лише чистий JSON у відповідь. Без зайвого тексту.
"""

    try:
        response = await model.generate_content_async(prompt)
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
        print(f"Відповідь API: {response.text if 'response' in locals() else 'Немає відповіді'}")
        return []


async def ai_parser(all_data: List[Dict[str, str]]) -> List[Dict]:
    parsed_results = []
    chunk_size = 2  # максимум 2 запити за раз
    delay = 60      # інтервал між запитами у секундах

    for i in range(0, len(all_data), chunk_size):
        current_batch = all_data[i:i + chunk_size]
        tasks = [parse_chunk(i + j, data) for j, data in enumerate(current_batch)]
        results = await asyncio.gather(*tasks)
        parsed_results.extend([item for sublist in results for item in sublist])

        if i + chunk_size < len(all_data):  # уникаємо затримки після останнього батчу
            print(f"⏳ Очікування {delay} секунд перед наступними {chunk_size} запитами...")
            await asyncio.sleep(delay)

    return parsed_results


# # Приклад запуску:
# if __name__ == "__main__":
#     example_data = asyncio.run(parse_batteries())
#     print(example_data)
#     parsed = asyncio.run(ai_parser(example_data))
#     print(json.dumps(parsed, indent=2, ensure_ascii=False))
