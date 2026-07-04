import asyncio
import os
import sys

# Add current directory to path
sys.path.append(os.getcwd())

from utils.pdf_generator_reportlab import generate_simulation_report

def verify_report():
    print("--- Factual PDF Report Verification ---")
    mock_data = {
        "region": "Mumbai",
        "shock_params": {
            "rate_change_bps": 50,
            "inflation_change_pct": 2.5,
            "gdp_shock_pct": -1.0
        },
        "p50": 6850000.0,
        "prob_loss": 0.45, # Should trigger CRITICAL rating
        "factual_metrics": {
            "overall_score": 74,
            "price_income": 12.5,
            "price_rent": 18.2,
            "residex": 145.8,
            "last_updated": "2026-04-09"
        },
        "narrative": "Mumbai demonstrates strong price support but high affordability stress."
    }

    try:
        pdf_bytes = generate_simulation_report(mock_data)
        with open("verification_report.pdf", "wb") as f:
            f.write(pdf_bytes)
        print("Success: verification_report.pdf generated with factual metrics.")
        print(f"File size: {len(pdf_bytes)} bytes")
    except Exception as e:
        print(f"Error during verification: {str(e)}")

if __name__ == "__main__":
    verify_report()
