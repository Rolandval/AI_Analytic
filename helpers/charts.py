import matplotlib.pyplot as plt
from datetime import datetime
import io
import base64


def plot_combined_price_chart(datasets: list[dict], normalize: bool = False):
    """
    datasets — список словників з даними від постачальників
        [
            {"name": "Supplier A", "data": [{"name": "Battery X", "date": "2024-01-01", "price": 100}, ...]},
            {"name": "Supplier B", "data": [{"name": "Battery X", "date": "2024-01-01", "price": 110}, ...]},
        ]
    normalize — чи показувати темп росту (True) замість абсолютної ціни (False)
    """
    plt.figure(figsize=(12, 6))
    
    # Зберігаємо оригінальні ціни для відображення на осі Y
    all_prices = []
    all_normalized = []
    
    # Спочатку збираємо всі дані для правильного налаштування осей
    supplier_data = []
    
    for supplier in datasets:
        supplier_name = supplier["name"]
        entries = supplier["data"]

        # Фільтруємо лише одну модель (наприклад, першу в списку)
        # Можна адаптувати, якщо треба більше
        battery_name = entries[0]["name"]
        records = [
            (datetime.strptime(entry["date"], "%Y-%m-%d"), entry["price"])
            for entry in entries
            if entry["name"] == battery_name
        ]
        records.sort(key=lambda x: x[0])
        
        if records:  # Перевіряємо, що є дані
            dates, prices = zip(*records)
            
            # Зберігаємо оригінальні ціни
            all_prices.extend(prices)
            
            if normalize:
                base_price = prices[0] if prices[0] > 0 else 1  # Уникаємо ділення на нуль
                normalized = [(p / base_price) for p in prices]
                all_normalized.extend(normalized)
            
            supplier_data.append((supplier_name, dates, prices))
    
    # Налаштовуємо основну вісь Y для відображення абсолютних цін
    ax1 = plt.gca()
    ax1.set_ylabel("Price (UAH)", fontweight='bold', fontsize=12)
    
    # Встановлюємо діапазон для основної осі Y
    if all_prices:
        min_price = min(all_prices)
        max_price = max(all_prices)
        price_range = max_price - min_price
        ax1.set_ylim(min_price - price_range * 0.1, max_price + price_range * 0.1)
    
    # Тепер малюємо графіки
    for supplier_name, dates, prices in supplier_data:
        ax1.plot(dates, prices, marker='o', label=supplier_name)
    
    # Якщо потрібно показувати нормалізовані дані, додаємо другу вісь
    if normalize and all_normalized:
        ax2 = ax1.twinx()
        ax2.set_ylabel("Growth (x)", color='gray')
        ax2.tick_params(axis='y', labelcolor='gray')
        
        # Встановлюємо діапазон для другої осі
        min_norm = min(all_normalized)
        max_norm = max(all_normalized)
        norm_range = max_norm - min_norm
        ax2.set_ylim(min_norm - norm_range * 0.1, max_norm + norm_range * 0.1)

    plt.title(f"{'Price Growth Rate' if normalize else 'Battery Price'} Comparison: {battery_name}")
    plt.xlabel("Date")
    plt.legend()
    plt.grid(True)
    plt.tight_layout()

    # Зберігаємо в памʼять
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    image_base64 = base64.b64encode(buf.read()).decode('utf-8')
    buf.close()
    plt.close()

    return image_base64
