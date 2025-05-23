import re
import os
import logging
import xlrd
import tempfile
import shutil
from typing import List, Dict, Any

# Настраиваем логирование
logger = logging.getLogger(__name__)

def parse_fop_ruslan_xls(file_path: str) -> List[Dict[str, Any]]:
    """
    Парсит XLS файл от FOP Ruslan и извлекает информацию об аккумуляторах.
    
    Args:
        file_path (str): Путь к XLS файлу
        
    Returns:
        List[Dict[str, Any]]: Список словарей с информацией об аккумуляторах
    """
    logger.info(f"Начинаем парсинг файла: {file_path}")
    
    # Создаем временную копию файла, чтобы избежать проблем с доступом
    temp_file = None
    try:
        # Создаем временный файл
        fd, temp_file = tempfile.mkstemp(suffix='.xls')
        os.close(fd)
        
        # Копируем исходный файл во временный
        shutil.copy2(file_path, temp_file)
        logger.info(f"Файл скопирован во временный: {temp_file}")
        
        # Открываем файл с помощью xlrd
        workbook = xlrd.open_workbook(temp_file)
        logger.info(f"Файл успешно открыт с помощью xlrd")
        
        # Получаем список листов
        sheet_names = workbook.sheet_names()
        logger.info(f"Листы в файле: {sheet_names}")
        
        # Выбираем первый лист
        sheet = workbook.sheet_by_index(0)
        logger.info(f"Выбран лист: {sheet.name}, строк: {sheet.nrows}, столбцов: {sheet.ncols}")
        
        # Логируем первые 10 строк для анализа структуры
        logger.info("Анализ структуры файла (первые 10 строк):")
        start_row = min(7, sheet.nrows)
        end_row = min(start_row + 10, sheet.nrows)
        for i in range(start_row, end_row):
            row_values = []
            for j in range(min(5, sheet.ncols)):
                try:
                    row_values.append(str(sheet.cell_value(i, j)))
                except:
                    row_values.append("")
            logger.info(f"Строка {i+1}: {' | '.join(row_values)}")
        
        # Проходим по строкам начиная с 8-й (индекс 7)
        logger.info("Начинаем обработку строк...")
        
        # Сразу устанавливаем флаг в true, так как акумуляторы идут с начала файла
        in_battery_section = True
        
        results = []
        
        for row_idx in range(7, sheet.nrows):
            # Получаем значение ячейки A (индекс 0)
            cell_a_value = sheet.cell_value(row_idx, 0)
            # Получаем значение ячейки B (индекс 1)
            cell_b_value = ""
            try:
                cell_b_value = sheet.cell_value(row_idx, 1)
            except:
                pass
            
            # Проверяем, заканчивается ли секция аккумуляторов (проверяем обе колонки)
            if (isinstance(cell_a_value, str) and "02. Автономні джерела живлення" in cell_a_value) or \
               (isinstance(cell_b_value, str) and "02. Автономні джерела живлення" in cell_b_value) or \
               (isinstance(cell_a_value, str) and "02." in cell_a_value and "втоном" in cell_a_value.lower()) or \
               (isinstance(cell_b_value, str) and "02." in cell_b_value and "втоном" in cell_b_value.lower()):
                logger.info(f"Конец секции аккумуляторов в строке {row_idx+1}: A='{cell_a_value}', B='{cell_b_value}'")
                in_battery_section = False
                continue
            
            # Если мы в секции аккумуляторов
            if in_battery_section:
                # Пропускаем пустые строки или заголовки
                if not isinstance(cell_b_value, str) or not cell_b_value.strip():
                    continue
                
                # Получаем цену из ячейки D (индекс 3)
                try:
                    price = float(sheet.cell_value(row_idx, 3))
                    logger.info(f"Строка {row_idx+1}, ячейка B: {cell_b_value}, цена: {price}")
                except (ValueError, TypeError):
                    # Если цена не числовая, это не товар, пропускаем строку
                    continue
                
                # Полное название из ячейки B
                full_name = cell_b_value.strip()
                
                # Разбиваем полное название на слова
                words = full_name.split()
                if not words:
                    continue
                
                # Первое слово - это бренд
                brand = words[0]
                
                # Ищем объем (число перед Ah)
                volume = None
                vol_idx = None
                
                # Паттерн 1: число + Ah
                for idx, word in enumerate(words):
                    if idx < len(words) - 1:
                        if word.replace('.', '', 1).isdigit() and re.search(r'[Aa][Hh]', words[idx + 1]):
                            volume = word
                            vol_idx = idx
                            logger.info(f"Найден объем (паттерн 1): {volume}, индекс: {vol_idx}")
                            break
                
                # Паттерн 2: числоAh
                if volume is None:
                    for idx, word in enumerate(words):
                        match = re.search(r'(\d+(?:\.\d+)?)[Aa][Hh]', word)
                        if match:
                            volume = match.group(1)
                            vol_idx = idx
                            logger.info(f"Найден объем (паттерн 2): {volume}, индекс: {vol_idx}")
                            break
                if volume is None:
                        for idx, word in enumerate(words):
                            if word.isdigit() and idx+1 < len(words) and re.match(r'[Aa][Hh]', words[idx+1]):
                                volume = word
                                vol_idx = idx
                                break
                if volume is None:
                    for idx, word in enumerate(words):
                        match = re.search(r'(\d+(?:\.\d+)?)[Аа][Hh]', word)
                        if match:
                            volume = match.group(1)
                            vol_idx = idx
                            logger.info(f"Найден объем (паттерн 2): {volume}, индекс: {vol_idx}")
                            break

                if volume is None:
                    volume = "0"
                                
                
                c_amps = None

                if c_amps is None:
                    for idx, word in enumerate(words):
                        match = re.search(r'(\d+(?:\.\d+)?)[Aa]', word)
                        if match:
                            if int(float(match.group(1))) != int(volume):
                                c_amps = int(float(match.group(1)))
                                logger.info(f"Найден c_amps (паттерн 4): {c_amps}, индекс: {idx}")
                                break

                if c_amps is None:
                    for idx, word in enumerate(words):
                        if idx < len(words) - 1:
                            if word.replace('.', '', 1).isdigit() and re.search(r'A', words[idx + 1]):
                                if int(word) != int(volume):
                                    c_amps = int(word)
                                    break

                if c_amps is None:
                    c_amps = 0
                
                
                # Извлекаем название (слова между брендом и объемом)
                name = ""
                if vol_idx and vol_idx > 1:
                    name = " ".join(words[1:vol_idx])
                
                # Если имя пустое или состоит только из пробелов, используем бренд
                if not name or name.strip() == "":
                    name = brand

                region = "EUROPE"
                description_cell = full_name
                if description_cell and isinstance(description_cell, str) and "ASIA" in description_cell.upper():
                    region = "ASIA"

                polarity = "R+"
                if description_cell and isinstance(description_cell, str) and "L+" in description_cell.upper():
                    polarity = "L+"

                electrolyte = "LAB"
                if description_cell and isinstance(description_cell, str) and "GEL" in description_cell.upper():
                    electrolyte = "GEL"
                if description_cell and isinstance(description_cell, str) and re.search(r'\bAGM\w*', description_cell.upper()):
                    electrolyte = "AGM"
                if description_cell and isinstance(description_cell, str) and "EFB" in description_cell.upper():
                    electrolyte = "EFB"

                
                
                # Добавляем информацию в результаты
                battery_info = {
                    "brand": brand,
                    "name": name,
                    "volume": volume,
                    "full_name": full_name,
                    "price": price,
                    "c_amps": c_amps,
                    "region": region,
                    "polarity": polarity,
                    "electrolyte": electrolyte
                }
                
                logger.info(f"Добавляем аккумулятор: {battery_info}")
                results.append(battery_info)
        
        logger.info(f"Всего обработано записей: {len(results)}")
        print(f"Всего обработано записей: {len(results)}")
        return results
    
    except Exception as e:
        logger.error(f"Ошибка при парсинге файла: {str(e)}")
        raise
    
    finally:
        # Удаляем временный файл
        if temp_file and os.path.exists(temp_file):
            os.remove(temp_file)
            logger.info(f"Временный файл удален: {temp_file}")