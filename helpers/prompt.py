import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()


async def analytics_prompt(data, comment):
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
Ти дієш як досвідчений аналітик ринку та експерт з продажу автомобільних акумуляторів.

Твоє завдання — провести глибокий професійний аналіз на основі наданих даних у форматі JSON.

### Дані:
{data}

### Проаналізуй кожен товар, враховуючи такі параметри:
- Потенційна цінова конкурентність (чи вигідна ціна щодо показників об’єму та пускового струму)
- Позиціонування на ринку (преміум/масовий сегмент)
- Полярність — сумісність з популярними авто в Україні
- Порівняй товари одного бренду: сильні/слабкі сторони
- Прогнозована маржинальність
- Потенційна цільова аудиторія

### Додатково:
- Рекомендації щодо просування кожного з товарів (через які канали, на яку ЦА орієнтуватися)
- Який з акумуляторів вигідніше закупити для перепродажу
- Чи присутня канібалізація між продуктами (внутрішня конкуренція)

{comment}

Зроби повноцінний аналітичний висновок професійним тоном українською мовою.
"""
    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()

        return response_text
    except Exception as e:
        print(f"Помилка аналізу: {e}")
        return "Помилка аналізу"