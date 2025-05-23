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
Дій як професійний парсер та спеціаліст із продажу сонячних панелей.

Твоє завдання — проаналізувати CSV-фрагмент, що містить перелік товарів, та витягнути структуровані дані про сонячні панелі. Поверни результат у вигляді масиву JSON-об'єктів із такою структурою:

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

🔍 Правила парсингу:

1. **Наявність**: Пропускай товари, яких **немає в наявності**.

2. **Бренд**:
   - Витягни назву бренду одним **чистим словом**.
   - Виправляй типові скорочення та помилки в написанні.

3. **Назва (name)**:
   - Витягни модель панелі між брендом і потужністю.
   - Якщо модель не вказана, поверни як `name` назву бренду.

4. **Потужність (power)**:
   - Поверни потужність панелі у **ватах (W)** як ціле число.
   - Якщо не вказано явно, логічно визнач найбільш імовірне значення серед числових.
   - Якщо визначити потужність неможливо — поверни `0`.

5. **Ціна**:
   - Спорчатку визначи в якій валюті записуються ціни
   - Завжди повертай **найменшу оптову ціну в доларах США за штуку**.
   🧮 Особливо важливо: 
📌 Якщо ціна виглядає як дуже мале число (наприклад: `0.13`, `0,135` тощо), вважай, що це **ціна за 1 ват** (а не 13.5 доларів!).
✅ У цьому випадку обов’язково перемнож її на потужність панелі (у ватах), щоб отримати реальну **ціну за 1 штуку**.

‼️ Пам’ятай:
- `0.13` → це **0.13 $/W**, не 13 доларів.
- Якщо панель має потужність 425W і ціна `0.13`, то реальна ціна: `0.13 * 425 = 55.25$`
   - Визнач формат ціни:
     - Якщо ціна більша або дорівнює 1 доларам, вважай її **ціною за 1 шт**.
     - Якщо ціна підозріло мала (наприклад, менше $1), вважай, що це **ціна за ват**, і помнож її на потужність панелі.
     - Якщо ціна вказана в іншій валюті (наприклад, гривні або євро), конвертуй її в долари. спочатку проаналізуй в якій валюті постачальник записує ціну
     ❗ ВАЖЛИВО: правильно аналізуй формат ціни — завжди повертай **фінальну ціну за одну штуку в доларах**.
   - Якщо ціна відсутня, поверни `0`.

6. **full_name**:
   - Повна оригінальна назва або опис з рядка CSV.

7. **Тип панелі (panel_type)**:
   - Визнач, чи панель є **"двосторонньою"**  або **"односторонньою"** . Якщо не вказано — за замовчуванням `"одностороння"`.

8. **Тип клітин (cell_type)**:
   - Визнач, чи клітини є **"n-type"** чи **"p-type"**. Якщо не вказано — за замовчуванням `"n-type"`.

9. **Товщина (thickness)**:
   - Товщина панелі у міліметрах.
   - Якщо не вказано — поверни `30`.

Тепер витягни дані про сонячні панелі з CSV-фрагмента нижче та поверни лише масив JSON-об'єктів.

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
                print(f"Успішно оброблено блок {i}-{i + len(chunk)}: знайдено {len(json_data)} акумуляторів")
            except Exception as e:
                print(f"Помилка на блоці {i}-{i + chunk_size}: {e}")
                print(f"Відповідь API: {response.text if 'response' in locals() else 'Немає відповіді'}")
                continue

    return results
