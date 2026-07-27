import pypdf

def get_pdf_text(path):
    try:
        reader = pypdf.PdfReader(path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        return f"Error: {e}"

text1 = get_pdf_text(r"c:\Users\Hp\Documents\Saniya Hakim resume 1.1.pdf")
text2 = get_pdf_text(r"c:\Users\Hp\Documents\Saniya Hakim New Resume.pdf")

print("Length of resume 1.1:", len(text1))
print("Length of New Resume:", len(text2))
print("Are they identical?", text1 == text2)
