from services.batteries.parsers.ai_parser import ai_parser
from helpers.csv_export import convert_to_csv
from services.batteries.parsers.ai_batteries_filter import ai_filter


def parse_ai_reports(file_path: str):
    csv_report = convert_to_csv(file_path)
    ai_data = ai_parser(csv_report)
    result = ai_filter(ai_data)
    return result
