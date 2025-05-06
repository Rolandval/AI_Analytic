import re
from typing import List, Dict, Any
import os
import tempfile
import shutil
from zipfile import ZipFile
import xml.etree.ElementTree as ET

def parse_avto_apteka_xlsx(file_path: str) -> List[Dict[str, Any]]:
    """
    Парсер XLSX файлов для извлечения информации об аккумуляторах.
    
    Извлекает из колонки B информацию о бренде, названии, объеме аккумулятора.
    Колонка C содержит цену.
    Обрабатывает только строки, где текст в колонке B начинается с 'Акумулятор'.
    
    Args:
        file_path: Путь к XLSX файлу
        
    Returns:
        Список словарей с информацией об аккумуляторах
    """
    try:
        # Создаем временную копию файла
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
            shutil.copy2(file_path, tmp.name)
            tmp_path = tmp.name
            print(f"Создана временная копия: {tmp_path}")
        
        try:
            # Прямой парсинг XLSX как ZIP-архива
            results = []
            
            with ZipFile(tmp_path) as zf:
                # Выводим содержимое архива
                file_list = zf.namelist()
                print(f"Содержимое архива: {', '.join(file_list)}")
                
                # Проверяем наличие файла worksheet
                if 'xl/worksheets/sheet1.xml' not in file_list:
                    print("Не найден файл sheet1.xml")
                    return []
                
                # Читаем shared strings (с учетом регистра)
                shared_strings = []
                shared_strings_path = None
                
                if 'xl/SharedStrings.xml' in file_list:
                    shared_strings_path = 'xl/SharedStrings.xml'
                elif 'xl/sharedStrings.xml' in file_list:
                    shared_strings_path = 'xl/sharedStrings.xml'
                
                if shared_strings_path:
                    print(f"Чтение shared strings из {shared_strings_path}")
                    ss_xml = zf.read(shared_strings_path)
                    ss_root = ET.fromstring(ss_xml)
                    
                    # Ищем все элементы si и t
                    for si in ss_root.findall('.//{*}si'):
                        texts = []
                        for t in si.findall('.//{*}t'):
                            if t.text:
                                texts.append(t.text)
                        shared_strings.append(''.join(texts))
                    
                    print(f"Прочитано {len(shared_strings)} shared strings")
                    if shared_strings:
                        print(f"Примеры: {', '.join(shared_strings[:5])}")
                
                # Читаем worksheet
                ws_xml = zf.read('xl/worksheets/sheet1.xml')
                ws_root = ET.fromstring(ws_xml)
                
                # Находим все строки
                rows = ws_root.findall('.//{*}row')
                print(f"Найдено {len(rows)} строк")
                
                # Обрабатываем строки начиная с 11-й (r="11")
                for row in rows:
                    row_num = int(row.get('r', '0'))
                    if row_num < 11:  # Начинаем с 11-й строки
                        continue
                    
                    # Ищем ячейки B и C
                    full_name = None
                    price = None
                    
                    for cell in row.findall('.//{*}c'):
                        cell_ref = cell.get('r', '')
                        if not cell_ref or len(cell_ref) < 2:
                            continue
                        
                        col = cell_ref[0]  # Первый символ - буква колонки
                        
                        # Получаем значение
                        v_elem = cell.find('.//{*}v')
                        if v_elem is None or v_elem.text is None:
                            continue
                        
                        cell_value = v_elem.text
                        cell_type = cell.get('t', '')
                        
                        # Если тип s - это индекс в shared strings
                        if cell_type == 's' and shared_strings:
                            try:
                                idx = int(cell_value)
                                if idx < len(shared_strings):
                                    cell_value = shared_strings[idx]
                                else:
                                    cell_value = ""
                            except (ValueError, IndexError):
                                cell_value = ""
                        
                        # Колонка B - полное название
                        if col == 'B':
                            full_name = cell_value
                        # Колонка C - цена
                        elif col == 'C':
                            try:
                                # Удаляем "грн" и заменяем запятую на точку
                                if isinstance(cell_value, str):
                                    price_str = cell_value.replace(' грн', '').replace(',', '.')
                                    price = float(price_str)
                                else:
                                    price = float(cell_value)
                            except (ValueError, TypeError):
                                price = None
                    
                    # Пропускаем строки без данных
                    if not full_name or not isinstance(full_name, str):
                        continue
                    
                    # Обрабатываем только строки, начинающиеся с "Акумулятор"
                    if not full_name.startswith("Акумулятор"):
                        continue
                    
                    print(f"Обработка: {full_name} | Цена: {price}")
                    
                    # Извлекаем информацию из полного названия
                    text = full_name[len("Акумулятор"):].strip()
                    
                    # Разбиваем на слова
                    words = text.split()
                    if not words:
                        continue
                    
                    # Первое слово - это бренд
                    brand = words[0]
                    
                    # Ищем объем аккумулятора (число + "Ah" в разных вариантах)
                    volume = None
                    vol_idx = None
                    
                    for idx, word in enumerate(words):
                        # Ищем паттерн: число + "Ah" (в разных вариантах)
                        match = re.search(r'(\d+)\s*[Aa][Hh]', word)
                        if match:
                            volume = match.group(1)  # Извлекаем число
                            vol_idx = idx
                            break
                    
                    # Если не нашли объем, пробуем другой паттерн
                    if volume is None:
                        for idx, word in enumerate(words):
                            if word.isdigit() and idx+1 < len(words) and re.match(r'[Aa][Hh]', words[idx+1]):
                                volume = word
                                vol_idx = idx
                                break

                    c_amps = None
                    c_idx = None
                    
                    for idx, word in enumerate(words):
                        # Ищем паттерн: число + "Ah" (в разных вариантах)
                        match = re.search(r'(\d+)\s*[Ee][Nn]', word)
                        s_match = re.search(r'(\d+)\s*[Cc][Cc][Aa]', word)
                        if match:
                            c_amps = int(match.group(1))  # Извлекаем число
                            c_idx = idx
                            break
                        if s_match:
                            c_amps = int(s_match.group(1))  # Извлекаем число
                            c_idx = idx
                            break
                    
                    # Если не нашли объем, пробуем другой паттерн
                    if c_amps is None:
                        for idx, word in enumerate(words):
                            if word.isdigit() and idx+1 < len(words) and re.match(r'[Ee][Nn]', words[idx+1]):
                                c_amps = int(word)
                                c_idx = idx
                                break
                            elif word.isdigit() and idx+1 < len(words) and re.match(r'[Cc][Cc][Aa]', words[idx+1]):
                                c_amps = int(word)
                                c_idx = idx
                                break
                    
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
                    if description_cell and isinstance(description_cell, str) and "(+/-)" in description_cell.upper():
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
                    
                    results.append(battery_info)
            
            print(f"Всего обработано записей: {len(results)}")
            return results
            
        finally:
            # Удаляем временный файл
            try:
                os.unlink(tmp_path)
            except:
                pass
                
    except Exception as e:
        print(f"Ошибка при парсинге файла: {e}")
        import traceback
        traceback.print_exc()
        return []