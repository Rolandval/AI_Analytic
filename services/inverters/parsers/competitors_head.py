from services.inverters.parsers.ai_competitors_parser import ai_parser
from services.inverters.parsers.ai_inverters_filter import ai_filter


async def parse_ai_reports(acync_parse_func):
    # Додаємо більше логування для відстеження проблеми
    print(f"Запуск функції parse_ai_reports з функцією {acync_parse_func.__name__ if hasattr(acync_parse_func, '__name__') else 'unknown'}")
    try:
        # Викликаємо функцію парсингу
        data = await acync_parse_func()
        print(f"Отримані дані: {data[:5] if isinstance(data, list) and data else data}")
        
        # Перевіряємо, чи є дані
        if not data:
            print("Попередження: Функція парсингу повернула порожні дані")
            return []
            
        # Передаємо дані в AI парсер
        ai_data = await ai_parser(data)
        print(f"Дані після AI парсера: {len(ai_data) if isinstance(ai_data, list) else ai_data}")
        
        # Фільтруємо дані
        result = ai_filter(ai_data)
        print(f"Результат після фільтрації: {len(result) if isinstance(result, list) else result}")
        
        return result
    except Exception as e:
        print(f"Помилка в parse_ai_reports: {e}")
        # Повертаємо порожній список у випадку помилки
        return []
