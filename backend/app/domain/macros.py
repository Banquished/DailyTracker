from decimal import Decimal


def compute_macros_from_portion(
    calories_per_100g: Decimal,
    protein_per_100g: Decimal,
    carbs_per_100g: Decimal,
    fat_per_100g: Decimal,
    grams: Decimal,
) -> dict:
    """Compute actual macros for a given number of grams."""
    factor = grams / Decimal("100")
    return {
        "calories": float(calories_per_100g * factor),
        "protein_g": float(protein_per_100g * factor),
        "carbs_g": float(carbs_per_100g * factor),
        "fat_g": float(fat_per_100g * factor),
    }


def sum_macros(entries: list[dict]) -> dict:
    """Sum a list of macro dicts."""
    return {
        "calories": sum(e["calories"] for e in entries),
        "protein_g": sum(e["protein_g"] for e in entries),
        "carbs_g": sum(e["carbs_g"] for e in entries),
        "fat_g": sum(e["fat_g"] for e in entries),
    }
