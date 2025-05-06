from parsers.ai_parser import ai_parser
from helpers.csv_export import convert_to_csv


def parse_ai_reports(file_path: str):
    csv_report = convert_to_csv(file_path)
    result = ai_parser(csv_report)
    return result
