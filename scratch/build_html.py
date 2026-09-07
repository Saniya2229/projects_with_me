import os

def main():
    with open("tmp1_b64.txt", "r") as f:
        b1 = f.read().strip()
    with open("tmp2_b64.txt", "r") as f:
        b2 = f.read().strip()
    with open("tmp3_b64.txt", "r") as f:
        b3 = f.read().strip()

    with open("template.html", "r", encoding="utf-8") as f:
        html = f.read()

    html = html.replace("{{IMAGE1_BASE64}}", b1)
    html = html.replace("{{IMAGE2_BASE64}}", b2)
    html = html.replace("{{IMAGE3_BASE64}}", b3)

    target_path = r"c:\Users\Hp\Downloads\blackbox-output-code-TGLSPTUGM4.html"
    with open(target_path, "w", encoding="utf-8") as f:
        f.write(html)
    
    print(f"Successfully generated {target_path}")

if __name__ == "__main__":
    main()
