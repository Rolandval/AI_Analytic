from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
import tempfile, os
from helpers.competitors import get_competitors_name
from services.inverters.controllers import process_inverters_import, process_inverters_import_parser, parse_txt
from services.inverters.parsers.ai_head import parse_ai_reports
from services.inverters.parsers.competitors.deye_ukraine import parse_inverters_deye_ukraine

router = APIRouter(prefix="/upload_inverters", tags=["inverters uploads/exports"])

@router.post("/ai_upload/upload_reports")
async def upload_inverters_file(
    doc_file: UploadFile | None = None,
    supplier_name: str = "",
    docs_link: str | None = None,
):
    # Визначаємо розширення файлу
    if doc_file:
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

            await process_inverters_import(tmp.name, parse_ai_reports, supplier_name)
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
    else:
        print(docs_link)
        await process_sollar_panels_import(docs_link, parse_ai_reports, supplier_name)
        return {"detail": "Conversion completed"}


@router.post("/ai_upload/upload_reports_text")
async def upload_sollar_panels_text(
    supplier_name: str,
    text: str
):
    await parse_txt(text=text, supplier_name=supplier_name)
    return {"detail": "Import completed"}



@router.post("/ai_upload/parse_competitor")
async def upload_sollar_panels_competitor():
    func_list =[]
    func_list.append(parse_inverters_deye_ukraine)
    for func in func_list:
        supplier_name = await get_competitors_name(func)
        print(supplier_name)
        await process_inverters_import_parser(func, supplier_name)
    return {"detail": "Import completed"}