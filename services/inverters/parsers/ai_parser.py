import csv
import json
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()


def ai_parser(csv_path: str, chunk_size: int = 50):
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

    # Використовуємо доступну модель gemini-1.5-flash або gemini-pro
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config={
            "temperature": 0.3,
            "top_p": 1,
            "top_k": 40,
            "max_output_tokens": 999999
        }
    )
    results = []

    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.reader(f)
        headers = next(reader)
        rows = list(reader)
    

        for i in range(0, len(rows), chunk_size):
            chunk = rows[i:i + chunk_size]

            # Формуємо CSV-рядок
            csv_chunk = [headers] + chunk
            csv_text = '\n'.join([','.join(row) for row in csv_chunk])

            prompt = f"""
Дій як професійний парсер та спеціаліст із продажу інверторів для сонячних електростанцій.

Твоє завдання — проаналізувати CSV-фрагмент, що містить перелік товарів, та витягнути структуровані дані про інвертори. Поверни результат у вигляді масиву JSON-об'єктів із такою структурою:

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

🔍 Правила парсингу:

1. **Наявність**: Пропускай товари, яких **немає в наявності**.

2. **Бренд**:
   - Витягни назву бренду одним **чистим словом**.
   - Виправляй типові скорочення та помилки в написанні.

3. **Назва (name)**:
   - Витягни модель інвертора.
   - Якщо модель не вказана, поверни як `name` назву бренду.

4. **Ціна**:
   - Спочатку визнач в якій валюті записуються ціни.
   - Завжди повертай **найменшу оптову ціну в доларах США за штуку**.
   - Якщо ціна вказана в іншій валюті (наприклад, гривні або євро), конвертуй її в долари.
   - Якщо ціна відсутня, поверни `0`.

5. **full_name**:
   - Повна оригінальна назва або опис з рядка CSV.

6. **Тип інвертора (inverter_type)**:
   - Визнач тип інвертора: **"gybrid"** (гібридний), **"off-grid"** (автономний), **"on-grid"** (мережевий).
   - Якщо не вказано — за замовчуванням `"gybrid"`.

7. **Покоління (generation)**:
   - Визнач покоління інвертора (наприклад, "3", "4", "5").
   - Якщо не вказано — за замовчуванням `"4"`.

8. **Кількість стрінгів (string_count)**:
   - Визнач кількість стрінгів (входів) інвертора як ціле число.
   - Якщо не вказано — поверни `0`.

9. **Прошивка (firmware)**:
   - Версія прошивки інвертора, якщо вказана.
   - Якщо не вказано — поверни порожній рядок `""`.

10. **Потужність (power)**:
    - Потужність інвертора у Вт.
    - Якщо не вказано — поверни `0`.

Тепер витягни дані про інвертори з CSV-фрагмента нижче та поверни лише масив JSON-об'єктів.

Вхідні CSV-дані:
{csv_text}

❗ Поверни **тільки чистий JSON** — без додаткових коментарів або тексту.
"""

            try:
                response = model.generate_content(prompt)
                response_text = response.text
                
                # Видаляємо зайві символи, які можуть заважати парсингу JSON
                response_text = response_text.strip()
                if response_text.startswith("```json"):
                    response_text = response_text.replace("```json", "", 1)
                if response_text.endswith("```"):
                    response_text = response_text.rsplit("```", 1)[0]
                response_text = response_text.strip()
                
                # Парсимо JSON
                json_data = json.loads(response_text)
                results.extend(json_data)
                print(f"Успішно оброблено блок {i}-{i + len(chunk)}: знайдено {len(json_data)} інверторів")
            except Exception as e:
                print(f"Помилка на блоці {i}-{i + chunk_size}: {e}")
                print(f"Відповідь API: {response.text if 'response' in locals() else 'Немає відповіді'}")
                continue

    return results
