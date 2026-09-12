# Basic RTF test script
rtf_content = r"""{\rtf1\ansi\ansicpg1252\deff0\deflang1033
{\fonttbl{\f0\fnil\fcharset0 Calibri;}{\f1\fnil\fcharset0 Calibri-Bold;}}
{\colortbl ;\red0\green51\blue153;\red51\green51\blue51;\red128\green128\blue128;\red0\green0\blue0;}
\paperw12240\paperh15840\margl1440\margr1440\margt1440\margb1440
\pard\plain\f0\fs36\b\qc\cf1 Saniya Hakim\par
\pard\plain\f0\fs20\qc\cf2 Phone: +91 9588427751 | Pune, Maharashtra | saniyahakim22@gmail.com\par
\pard\plain\f0\fs20\qc\cf2 LinkedIn: linkedin.com/in/saniya-hakim | GitHub: github.com/Saniya2229\par
\pard\plain\f0\fs2\brdrb\brdrs\brdrw15\brsp60\sa120\par
\pard\plain\f0\fs24\b\cf1 Professional Summary\par
\pard\plain\f0\fs22\cf2 Frontend and Full Stack Web Developer with a strong foundation...\par
}"""

with open(r"c:\Users\Hp\Documents\test_resume.rtf", "w", encoding="ascii", errors="ignore") as f:
    f.write(rtf_content)

print("RTF test written.")
