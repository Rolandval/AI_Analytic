from services.inverters.parsers.ai_txt_parser import ai_parser
from services.inverters.parsers.ai_inverters_filter import ai_filter


async def parse_ai_reports(data: str):
    ai_data = await ai_parser(data)
    result = ai_filter(ai_data)
    return result