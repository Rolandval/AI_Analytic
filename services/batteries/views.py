from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
import tempfile, os
from helpers.csv_export import convert_to_csv

from services.batteries.controllers import process_batteries_import, process_batteries_import_parser, me_parser
from parsers.async_versions.avto_apteka import parse_avto_apteka_xlsx
from parsers.async_versions.fop_ruslan import parse_fop_ruslan_xls
from parsers.async_versions.avto_alians import parse_avto_alians_doc
from parsers.async_versions.a_mega_auto import parse_a_mega_auto_xlsx
from parsers.ai_head import parse_ai_reports

from parsers.competitors.avto_zvuk import parse_batteries_avto_zvuk as parse_avto_zvuk
from parsers.competitors.aku_lviv import parse_batteries_aku_lviv as parse_aku_lviv
from parsers.competitors.makb import parse_batteries_makb as parse_makb
from helpers.competitors import get_competitors_name

from parsers.me_parser import parse_batteries_me as parse_me

router = APIRouter(prefix="/upload_batteries", tags=["uploads/exports"])

# @router.post("/upload/avto-apteka", summary="Загрузка з Авто Аптека xlsx")
# async def upload_batteries_file(
#     xlsx_file: UploadFile = File(...),
# ):
#     supplier_name = "Авто Аптека"
#     if not xlsx_file.filename.lower().endswith(('.xlsx', '.xls')):
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type")
#     # Save to temp file
#     suffix = os.path.splitext(xlsx_file.filename)[1]
#     tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
#     try:
#         content = await xlsx_file.read()
#         tmp.write(content)
#         tmp.close()
#         # Process import
#         await process_batteries_import(tmp.name, parse_avto_apteka_xlsx, supplier_name)
#     except Exception as e:
#         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
#     finally:
#         os.unlink(tmp.name)
#     return {"detail": "Import completed"}

# @router.post("/upload/fop-ruslan", summary="Загрузка з ФОП Руслан xls")
# async def upload_batteries_file(
#     xls_file: UploadFile = File(...),
# ):
#     supplier_name = "ФОП Руслан"
#     if not xls_file.filename.lower().endswith(('.xlsx', '.xls')):
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type")
#     # Save to temp file
#     suffix = os.path.splitext(xls_file.filename)[1]
#     tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
#     try:
#         content = await xls_file.read()
#         tmp.write(content)
#         tmp.close()
#         # Process import
#         await process_batteries_import(tmp.name, parse_fop_ruslan_xls, supplier_name)
#     except Exception as e:
#         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
#     finally:
#         os.unlink(tmp.name)
#     return {"detail": "Import completed"}

# @router.post("/upload/avto-alians", summary="Загрузка з Авто Альянс doc")
# async def upload_batteries_file(
#     doc_file: UploadFile = File(...),
# ):
#     supplier_name = "АвтоАльянс"
#     if not doc_file.filename.lower().endswith('.doc'):
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type")
#     # Save to temp file
#     suffix = os.path.splitext(doc_file.filename)[1]
#     tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
#     try:
#         content = await doc_file.read()
#         tmp.write(content)
#         tmp.close()
#         # Process import
#         await process_batteries_import(tmp.name, parse_avto_alians_doc, supplier_name)
#     except Exception as e:
#         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
#     finally:
#         os.unlink(tmp.name)
#     return {"detail": "Import completed"}

# @router.post("/upload/a-mega-avto", summary="Загрузка з А-мега Авто xlsx")
# async def upload_batteries_file(
#     doc_file: UploadFile = File(...),
# ):
#     supplier_name = "А-мегаАвто"
#     if not doc_file.filename.lower().endswith('.xlsx'):
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type")
#     # Save to temp file
#     suffix = os.path.splitext(doc_file.filename)[1]
#     tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
#     try:
#         content = await doc_file.read() 
#         tmp.write(content)
#         tmp.close()
#         # Process import
#         await process_batteries_import(tmp.name, parse_a_mega_auto_xlsx, supplier_name)
#     except Exception as e:
#         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
#     finally:
#         os.unlink(tmp.name)
#     return {"detail": "Import completed"}

@router.post("/ai_upload/convert_to_csv")
async def upload_batteries_file(
    doc_file: UploadFile = File(...),
):
    # Визначаємо розширення файлу
    file_name = doc_file.filename
    suffix = os.path.splitext(file_name)[1]
    
    # Створюємо тимчасовий файл
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp_path = tmp.name
    csv_path = None
    
    try:
        # Записуємо вміст файлу
        content = await doc_file.read() 
        tmp.write(content)
        tmp.close()  # Закриваємо файл перед подальшою обробкою
        
        # Конвертуємо файл у CSV
        csv_path = convert_to_csv(tmp_path)
        
         # Виводимо вміст CSV файлу
        print("\n--- Вміст CSV файлу ---")
        with open(csv_path, 'r', encoding='utf-8') as f:
            csv_content = f.read()
            print(csv_content)
        print("--- Кінець вмісту CSV файлу ---\n")
        
        return {"detail": "Conversion completed", "csv_file": csv_path}
    except Exception as e:
        # Логуємо помилку для діагностики
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    finally:
        # Видаляємо тимчасовий файл, якщо він існує
        try:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
        except Exception as e:
            # Якщо не вдалося видалити файл, просто логуємо помилку
            print(f"Не вдалося видалити тимчасовий файл: {str(e)}")

@router.post("/ai_upload/upload_reports")
async def upload_batteries_file(
    doc_file: UploadFile = File(...),
    supplier_name = str
):
    # Визначаємо розширення файлу
    file_name = doc_file.filename
    suffix = os.path.splitext(file_name)[1]
    
    # Створюємо тимчасовий файл
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp_path = tmp.name
    csv_path = None
    
    try:
        # Записуємо вміст файлу
        content = await doc_file.read() 
        tmp.write(content)
        tmp.close()  # Закриваємо файл перед подальшою обробкою

        await process_batteries_import(tmp.name, parse_ai_reports, supplier_name)
        return {"detail": "Conversion completed", "csv_file": csv_path}
    except Exception as e:
        # Логуємо помилку для діагностики
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    finally:
        # Видаляємо тимчасовий файл, якщо він існує
        try:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
        except Exception as e:
            # Якщо не вдалося видалити файл, просто логуємо помилку
            print(f"Не вдалося видалити тимчасовий файл: {str(e)}")

@router.post("/ai_upload/parse_competitor")
async def upload_batteries_file():
    func_list =[]
    func_list.append(parse_makb)
    func_list.append(parse_avto_zvuk)
    func_list.append(parse_aku_lviv)
    for func in func_list:
        supplier_name = await get_competitors_name(func)
        await process_batteries_import_parser(func, supplier_name)
    return {"detail": "Import completed"}

@router.post("/ai_upload/parse_me")
async def upload_batteries_from_me():
    supplier_name = "Акумулятор центр"
    await me_parser(parse_me, supplier_name)
    return {"detail": "Import completed"}
