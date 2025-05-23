from services.sollar_panels.parsers.ai_txt_parser import ai_parser
from services.sollar_panels.parsers.ai_sollar_filter import ai_filter


async def parse_ai_reports(data: str):
    ai_data = await ai_parser(data)
    result = ai_filter(ai_data)
    return result