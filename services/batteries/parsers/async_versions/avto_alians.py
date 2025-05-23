import re
import os
import logging
import tempfile
from typing import List, Dict, Any

# Настраиваем логирование
logger = logging.getLogger(__name__)

def parse_avto_alians_doc(file_path: str) -> List[Dict[str, Any]]:
    """
    Парсит DOC файл от Авто Альянс и извлекает информацию об аккумуляторах.
    
    Args:
        file_path (str): Путь к DOC файлу
        
    Returns:
        List[Dict[str, Any]]: Список словарей с информацией об аккумуляторах
    """
    print(f"Начинаем парсинг файла: {file_path}")
    logger.info(f"Начинаем парсинг файла: {file_path}")
    
    try:
        # Читаем файл как бинарный
        with open(file_path, 'rb') as f:
            binary_data = f.read()
        
        # Преобразуем бинарные данные в текст, игнорируя ошибки
        content = binary_data.decode('utf-8', errors='ignore')
        print(f"Текст успешно извлечен, длина: {len(content)} символов")
        logger.info(f"Текст успешно извлечен, длина: {len(content)} символов")
        
        # Список для хранения результатов
        results = []
        
        # Разбиваем содержимое на строки
        lines = content.split('\n')
        print(f"Количество строк в тексте: {len(lines)}")
        logger.info(f"Количество строк в тексте: {len(lines)}")
        
        # Текущий бренд (заголовок секции)
        current_brand = ""
        
        # Проходим по всем строкам
        for line_idx, line in enumerate(lines):
            # Логируем каждую 100-ю строку для отладки
            if line_idx % 100 == 0:
                print(f"Обрабатываем строку {line_idx}")
                logger.info(f"Обрабатываем строку {line_idx}")
            
            # Проверяем, является ли строка заголовком секции с брендом
            # Ищем известные бренды аккумуляторов
            if any(brand in line.upper() for brand in ["VARTA", "BOSCH", "EXIDE", "FIAMM", "CENTRA", "BANNER", "WESTA", "ISTA", "MUTLU", "TOPLA", "OPTIMA"]):
                current_brand = next((brand for brand in ["VARTA", "BOSCH", "EXIDE", "FIAMM", "CENTRA", "BANNER", "WESTA", "ISTA", "MUTLU", "TOPLA", "OPTIMA"] if brand in line.upper()), "")
                print(f"Найден заголовок секции с брендом: {current_brand}")
                logger.info(f"Найден заголовок секции с брендом: {current_brand}")
                continue
            
            # Ищем строки с аккумуляторами
            # Ищем строки, которые содержат числовые данные и потенциальные цены
            if re.search(r'\d+\s+\d+\s+\d+', line) and re.search(r'\d{3,}', line):
                print(f"Найдена строка с числами: {line}")
                logger.info(f"Найдена строка с числами: {line}")
                
                try:
                    # Разбиваем строку на поля
                    fields = re.split(r'\s+', line.strip())
                    
                    # Пропускаем строки с малым количеством полей
                    if len(fields) < 4:
                        continue
                    
                    # Извлекаем название (первое поле)
                    name = fields[0]
                    
                    # Если название пустое или слишком короткое, пропускаем строку
                    if not name or len(name) < 2:
                        continue
                    
                    # Используем текущий бренд или извлекаем из названия
                    brand = current_brand
                    if not brand:
                        # Проверяем, есть ли в названии известный бренд
                        for known_brand in ["VARTA", "BOSCH", "EXIDE", "FIAMM", "CENTRA", "BANNER", "WESTA", "ISTA", "MUTLU", "TOPLA", "OPTIMA"]:
                            if known_brand in name.upper():
                                brand = known_brand
                                break
                        
                        # Если бренд не найден, извлекаем первое слово из названия
                        if not brand:
                            brand_match = re.match(r'^([A-Za-zА-Яа-я0-9]+)', name)
                            if brand_match:
                                brand = brand_match.group(1)
                            else:
                                brand = "Unknown"
                    
                    # Ищем объем (обычно число, за которым следует "А" или "Ah")
                    volume = "0"
                    # Ищем число, за которым следует "А" или "Ah"
                    volume_match = re.search(r'(\d+)\s*(?:А|Ah|A)', line)
                    if volume_match:
                        volume = volume_match.group(1)
                    elif len(fields) > 1 and re.match(r'^\d+$', fields[1]):
                        volume = fields[1]
                    
                    # Ищем цены (числа больше 100)
                    prices = []
                    for field in fields:
                        try:
                            # Удаляем все нечисловые символы, кроме точки
                            field_clean = re.sub(r'[^\d.]', '', field)
                            if field_clean:
                                field_price = float(field_clean)
                                if field_price > 100:  # Предполагаем, что цена больше 100
                                    prices.append(field_price)
                        except (ValueError, TypeError):
                            continue
                    
                    # Если не нашли ни одной цены, пропускаем строку
                    if not prices:
                        continue
                    
                    # Берем самую низкую цену (оптовую)
                    price = min(prices)
                    
                    # Добавляем информацию в результаты
                    battery_info = {
                        "brand": brand,
                        "name": name,
                        "volume": volume,
                        "full_name": f"{brand} {name}",
                        "price": price
                    }
                    
                    print(f"Добавляем аккумулятор: {battery_info}")
                    logger.info(f"Добавляем аккумулятор: {battery_info}")
                    results.append(battery_info)
                
                except Exception as e:
                    print(f"Ошибка при обработке строки {line_idx+1}: {str(e)}")
                    logger.error(f"Ошибка при обработке строки {line_idx+1}: {str(e)}")
                    continue
        
        print(f"Всего обработано записей: {len(results)}")
        logger.info(f"Всего обработано записей: {len(results)}")
        return results
    
    except Exception as e:
        print(f"Ошибка при парсинге файла: {str(e)}")
        logger.error(f"Ошибка при парсинге файла: {str(e)}")
        return []
