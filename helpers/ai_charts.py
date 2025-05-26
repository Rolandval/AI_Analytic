import google.generativeai as genai
from dotenv import load_dotenv
import os
import json

load_dotenv()


async def get_chart_data(input, data):
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
    prompt = f"""
Ти дієш як досвідчений аналітик та експерт.

### Завдання:
Проаналізуй дані про ціни на товар від різних постачальників та підготуй інформацію для побудови графіку цін.
 
проблема в тому що в мене в бд дані змаєть різні name, твоя задача розібратися, які з цих даних підходять саме до цього товару
звертай увагу на full_name ти маєш розпізнавати де є цей товар, де є інший! часто в кінці full_name є типу D24? враховуй це також

### товари для аналізу:
{input}

### Дані з бази даних:
{data}

### Інструкції:
1. Знайди записи з бази даних, які відповідають товарам зі списку для аналізу
2. Згрупуй дані за постачальниками (supplier)

### Формат відповіді:
Поверни лише JSON-масив без додаткових коментарів у такому форматі:
[
    {{"name": "Назва постачальника", "data": [{{"name": "Назва товару", "date": "YYYY-MM-DD", "price": 100}}, ...]}},
    {{"name": "Інший постачальник", "data": [{{"name": "Назва товару", "date": "YYYY-MM-DD", "price": 110}}, ...]}}
]

Важливо: повертай тільки JSON без будь-якого додаткового тексту!
"""
    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Видаляємо маркери розмітки Markdown, якщо вони є
        if response_text.startswith("```json"):
            response_text = response_text.replace("```json", "", 1)
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        response_text = response_text.strip()
        
        try:
            json_data = json.loads(response_text)
            print("JSON успішно розпарсовано")
            return json_data
        except json.JSONDecodeError as e:
            print(f"Помилка розпарсювання JSON: {e}")
            print(f"Текст відповіді: {response_text}")
            return []
    except Exception as e:
        print(f"Помилка аналізу: {e}")
        return []