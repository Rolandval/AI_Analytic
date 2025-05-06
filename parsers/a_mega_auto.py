from typing import List, Dict, Any
import os
import tempfile
import shutil
import re
import logging
from zipfile import ZipFile
import xml.etree.ElementTree as ET

# Налаштовуємо логування
logger = logging.getLogger(__name__)
# Встановлюємо рівень логування на DEBUG для більш детальної інформації
logger.setLevel(logging.DEBUG)

def parse_a_mega_auto_xlsx(file_path: str) -> List[Dict[str, Any]]:
    """
    Парсить XLSX файл від A-Mega Auto і витягує інформацію про акумулятори.
    
    Args:
        file_path (str): Шлях до XLSX файлу
        
    Returns:
        List[Dict[str, Any]]: Список словників з інформацією про акумулятори
    """
    logger.info(f"Починаємо парсинг файлу: {file_path}")
    print(f"Починаємо парсинг файлу: {file_path}")
    
    try:
        # Создаем временную копию файла
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
            shutil.copy2(file_path, tmp.name)
            tmp_path = tmp.name
            logger.info(f"Создана временная копия: {tmp_path}")
            print(f"Создана временная копия: {tmp_path}")
        
        try:
            # Прямой парсинг XLSX как ZIP-архива
            results = []
            
            with ZipFile(tmp_path) as zf:
                # Виводимо вміст архіву
                file_list = zf.namelist()
                logger.info(f"Вміст архіву: {', '.join(file_list)}")
                print(f"Вміст архіву: {', '.join(file_list)}")
                
                # Знаходимо всі листи (worksheets)
                worksheet_paths = []
                for path in file_list:
                    if path.startswith('xl/worksheets/sheet') and path.endswith('.xml'):
                        worksheet_paths.append(path)
                
                if not worksheet_paths:
                    logger.error("Не знайдено жодного worksheet")
                    print("Не знайдено жодного worksheet")
                    return []
                
                logger.info(f"Знайдено worksheets: {', '.join(worksheet_paths)}")
                print(f"Знайдено worksheets: {', '.join(worksheet_paths)}")
                
                # Читаємо shared strings (з урахуванням регістру)
                shared_strings = []
                shared_strings_path = None
                
                for path in file_list:
                    if path.lower() == 'xl/sharedstrings.xml':
                        shared_strings_path = path
                        break
                
                if shared_strings_path:
                    logger.info(f"Читання shared strings з {shared_strings_path}")
                    print(f"Читання shared strings з {shared_strings_path}")
                    ss_xml = zf.read(shared_strings_path)
                    ss_root = ET.fromstring(ss_xml)
                    
                    # Шукаємо всі елементи si і t
                    for si in ss_root.findall('.//{*}si'):
                        texts = []
                        for t in si.findall('.//{*}t'):
                            if t.text:
                                texts.append(t.text)
                        shared_strings.append(''.join(texts))
                    
                    logger.info(f"Прочитано {len(shared_strings)} shared strings")
                    print(f"Прочитано {len(shared_strings)} shared strings")
                    if shared_strings:
                        logger.info(f"Приклади: {', '.join(shared_strings[:5])}")
                        print(f"Приклади: {', '.join(shared_strings[:5])}")
                else:
                    logger.warning("Не знайдено shared strings")
                    print("Не знайдено shared strings")
                
                # Шукаємо лист з даними акумуляторів
                target_worksheet = None
                
                # Перевіряємо кожен лист
                for worksheet_path in worksheet_paths:
                    logger.info(f"Перевіряємо лист: {worksheet_path}")
                    print(f"Перевіряємо лист: {worksheet_path}")
                    
                # Читаємо worksheet
                ws_xml = zf.read(worksheet_path)
                ws_root = ET.fromstring(ws_xml)
                
                # Знаходимо всі рядки
                rows = ws_root.findall('.//{*}row')
                logger.info(f"Знайдено {len(rows)} рядків")
                print(f"Знайдено {len(rows)} рядків")
                
                # Логуємо перші 20 рядків для аналізу
                for i, row in enumerate(rows[:20]):
                    row_num = row.get('r', 'unknown')
                    cells = row.findall('.//{*}c')
                    logger.info(f"Рядок {row_num}: {len(cells)} комірок")
                    print(f"Рядок {row_num}: {len(cells)} комірок")
                
                current_battery_type = None
                
                # Обробляємо рядки починаючи з 8-ї (r="8")
                for row in rows:
                    row_num = int(row.get('r', '0'))
                    if row_num < 8:  # Починаємо з 8-ї рядки
                        continue
                    
                    # Шукаємо комірки A, B, D, F
                    cell_a_value = None
                    cell_b_value = None
                    cell_d_value = None
                    cell_f_value = None
                    
                    cells_info = []
                    
                    for cell in row.findall('.//{*}c'):
                        cell_ref = cell.get('r', '')
                        if not cell_ref or len(cell_ref) < 2:
                            continue
                        
                        column = cell_ref[0]
                        
                        # Отримуємо значення комірки
                        cell_value = None
                        v_element = cell.find('.//{*}v')
                        
                        if v_element is not None and v_element.text:
                            if cell.get('t') == 's' and shared_strings:
                                # Це посилання на shared string
                                try:
                                    idx = int(v_element.text)
                                    if 0 <= idx < len(shared_strings):
                                        cell_value = shared_strings[idx]
                                except (ValueError, IndexError):
                                    pass
                            else:
                                # Це числове значення
                                try:
                                    cell_value = float(v_element.text)
                                except ValueError:
                                    cell_value = v_element.text
                        
                        cells_info.append(f"{cell_ref}={cell_value}")
                        
                        # Зберігаємо значення відповідної комірки
                        if column == 'A':
                            cell_a_value = cell_value
                        elif column == 'B':
                            cell_b_value = cell_value
                        elif column == 'D':
                            cell_d_value = cell_value
                        elif column == 'F':
                            cell_f_value = cell_value
                    
                    # Логуємо інформацію про комірки в рядку
                    logger.info(f"Рядок {row_num}: {', '.join(cells_info)}")
                    if row_num < 20:  # Обмежуємо виведення для перших 20 рядків
                        print(f"Рядок {row_num}: {', '.join(cells_info)}")
                    
                    # Перевіряємо, чи є це рядок з описом типу акумулятора
                    if (cell_a_value is None or cell_a_value == "") and cell_b_value is not None and isinstance(cell_b_value, str) and "BATTERIES" in cell_b_value.upper():
                        current_battery_type = cell_b_value.strip()
                        logger.info(f"Знайдено опис типу акумулятора: {current_battery_type}")
                        print(f"Знайдено опис типу акумулятора: {current_battery_type}")
                        continue
                    
                    # Перевіряємо, чи є це рядок з даними акумулятора
                    if cell_b_value is not None and cell_d_value is not None and cell_f_value is not None:
                        try:
                            # Перевіряємо, чи містить комірка B модель акумулятора
                            if isinstance(cell_b_value, str) and re.search(r'\d+[A-Z]+\d+', cell_b_value):
                                model = cell_b_value.strip()
                                logger.info(f"Знайдено модель акумулятора: {model}")
                                print(f"Знайдено модель акумулятора: {model}")
                                
                                # Витягуємо ємність з комірки D
                                volume = None
                                if cell_d_value is not None:
                                    try:
                                        volume = str(int(float(str(cell_d_value))))
                                    except:
                                        volume = str(cell_d_value).strip()
                                
                                # Витягуємо оптову ціну з комірки F
                                price = None
                                if cell_f_value is not None:
                                    try:
                                        price = float(str(cell_f_value).replace(' ', ''))
                                    except:
                                        price = 0
                                
                                # Визначаємо полярність
                                polarity = "R+"  # За замовчуванням
                                if current_battery_type and "L+" in current_battery_type:
                                    polarity = "L+"
                                
                                # Визначаємо тип електроліту
                                electrolyte = "LAB"  # За замовчуванням
                                if current_battery_type:
                                    if "AGM" in current_battery_type.upper():
                                        electrolyte = "AGM"
                                    elif "GEL" in current_battery_type.upper():
                                        electrolyte = "GEL"
                                    elif "EFB" in current_battery_type.upper():
                                        electrolyte = "EFB"
                                
                                # Визначаємо регіон
                                region = "EUROPE"  # За замовчуванням
                                if current_battery_type and "ASIA" in current_battery_type.upper():
                                    region = "ASIA"
                                
                                # Визначаємо бренд
                                brand = "A-MEGA"
                                if current_battery_type:
                                    brand_match = re.search(r'(HIGH\s+\w+|A-MEGA)', current_battery_type.upper())
                                    if brand_match:
                                        brand = brand_match.group(1)
                                
                                # Визначаємо струм запуску (c_amps)
                                c_amps = None
                                # Спробуємо знайти струм запуску в описі
                                if current_battery_type:
                                    amp_match = re.search(r'(\d+)\s*[AaАа](?!\w)', current_battery_type)
                                    if amp_match:
                                        c_amps = int(amp_match.group(1))
                                
                                # Якщо c_amps все ще None, встановлюємо значення за замовчуванням
                                if c_amps is None:
                                    # Встановлюємо c_amps на основі volume (приблизне співвідношення)
                                    vol_val = int(float(volume))
                                    c_amps = vol_val * 5  # Приблизне співвідношення
                                    logger.warning(f"c_amps не знайдено, встановлюємо значення за замовчуванням на основі volume: {c_amps}")
                                
                                # Створюємо повну назву
                                full_name = f"{brand} {model} {volume}Ah {polarity}"
                                
                                # Створюємо словник з інформацією про акумулятор
                                battery_info = {
                                    "brand": brand,
                                    "name": model,
                                    "volume": volume,
                                    "full_name": full_name,
                                    "price": price,
                                    "c_amps": c_amps,
                                    "region": region,
                                    "polarity": polarity,
                                    "electrolyte": electrolyte
                                }
                                
                                logger.info(f"Додаємо акумулятор: {battery_info}")
                                print(f"Додаємо акумулятор: {battery_info}")
                                results.append(battery_info)
                        except Exception as e:
                            logger.error(f"Помилка при обробці рядка {row_num}: {str(e)}")
                            print(f"Помилка при обробці рядка {row_num}: {str(e)}")
                            import traceback
                            logger.error(traceback.format_exc())
                            print(traceback.format_exc())
                
                logger.info(f"Всього оброблено записів: {len(results)}")
                print(f"Всього оброблено записів: {len(results)}")
                return results
        
        finally:
            # Удаляем временный файл
            try:
                os.unlink(tmp_path)
                logger.info(f"Тимчасовий файл видалено: {tmp_path}")
            except:
                pass
                
    except Exception as e:
        logger.error(f"Ошибка при парсинге файла: {str(e)}")
        print(f"Ошибка при парсинге файла: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        print(traceback.format_exc())
        raise
