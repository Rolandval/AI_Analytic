from services.batteries.parsers.ai_txt_parse import ai_parser
from services.batteries.parsers.ai_batteries_filter import ai_filter


async def parse_ai_reports(data: str):
    ai_data = await ai_parser(data)
    result = ai_filter(ai_data)
    return result