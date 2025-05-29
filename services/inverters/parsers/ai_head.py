from services.inverters.parsers.ai_parser import ai_parser
from helpers.csv_export import convert_to_csv
from services.inverters.parsers.ai_inverters_filter import ai_filter


def parse_ai_reports(file_path: str | None = None, docs_link: str | None = None):
    csv_report = ""
    if file_path and docs_link is None:
        csv_report = convert_to_csv(file_path)
    elif file_path is None and docs_link:
        csv_report = convert_to_csv(docs_link)
    else:
        raise ValueError("Невідомий формат файлу")
    ai_data = ai_parser(csv_report)
    result = ai_filter(ai_data)
    return result