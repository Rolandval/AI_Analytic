from parsers.ai_competitors_parser import ai_parser
from helpers.ai_filter import ai_filter


async def parse_ai_reports(acync_parse_func):
    data = await acync_parse_func()
    ai_data = await ai_parser(data)
    result = ai_filter(ai_data)
    return result
