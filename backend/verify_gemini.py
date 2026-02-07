import fitz
import io
from app.services.ocr_service import OCRService
import os


def test_gemini_extraction():
    # Create a simple PDF with some text using fitz
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text(
        (50, 50), "Hello Gemini 2.0 Flash (File API), this is a test PDF.", fontsize=20
    )

    # Save to bytes
    pdf_bytes = doc.tobytes()

    print("Testing extraction...")
    try:
        text = OCRService.extract_text(pdf_bytes, "pdf")
        print("\n--- Extracted Text ---")
        print(text)
        print("----------------------\n")

        if "Hello Gemini" in text or "test PDF" in text:
            print("SUCCESS: Text found in output")
        else:
            print(
                "WARNING: Text not found (Check if API Key is set or Fallback worked)"
            )

    except Exception as e:
        print(f"FAILED: {e}")


if __name__ == "__main__":
    test_gemini_extraction()
