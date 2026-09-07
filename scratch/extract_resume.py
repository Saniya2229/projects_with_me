import pypdf

reader = pypdf.PdfReader(r"c:\Users\Hp\Documents\Saniya Hakim resume 1.1.pdf")
text = ""
for page in reader.pages:
    text += page.extract_text() + "\n"

with open(r"C:\Users\Hp\.gemini\antigravity-ide\scratch\resume_text.txt", "w", encoding="utf-8") as f:
    f.write(text)

print(f"Extracted {len(text)} characters.")
