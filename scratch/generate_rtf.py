import re

def escape_rtf(text):
    # Escape backslash, open brace, close brace
    t = text.replace('\\', '\\\\').replace('{', '\\{').replace('}', '\\}')
    # Replace smart quotes or non-ASCII characters if any
    # Since we are keeping it ASCII, we can just replace common unicode dashes
    t = t.replace('\u2013', '-').replace('\u2014', '-').replace('\u2018', "'").replace('\u2019', "'").replace('\u201c', '"').replace('\u201d', '"')
    return t

def make_rtf():
    header = r"""{\rtf1\ansi\ansicpg1252\deff0\deflang1033
{\fonttbl{\f0\fnil\fcharset0 Arial;}}
{\colortbl ;\red26\green54\blue93;\red45\green55\blue72;\red113\green128\blue150;}
\paperw12240\paperh15840\margl1440\margr1440\margt1440\margb1440
"""

    # Title / Name
    content = r"\pard\plain\f0\fs36\b\qc\cf1 Saniya Hakim\par"
    
    # Contact Info
    content += r"\pard\plain\f0\fs20\qc\cf2 Phone: +91 9588427751  |  Email: saniyahakim22@gmail.com  |  Location: Pune, Maharashtra\par"
    content += r"\pard\plain\f0\fs20\qc\cf2 LinkedIn: linkedin.com/in/saniya-hakim  |  GitHub: github.com/Saniya2229\par"
    
    # Divider helper
    def divider():
        return r"\pard\plain\f0\fs2\cf1\brdrb\brdrs\brdrw15\brsp60\sa80\par"
        
    def section_title(title):
        return rf"\pard\plain\f0\fs22\b\cf1\sb140\sa40 {escape_rtf(title)}\par" + divider()

    # Section: Professional Summary
    content += section_title("Professional Summary")
    summary = (
        "Frontend and Full Stack Web Developer with a strong foundation in Artificial Intelligence and Data Science. "
        "Experienced in React, Angular, Node.js, Express.js, JavaScript, Java, MongoDB and REST APIs. Passionate about "
        "building scalable applications, intuitive UI/UX, clean code and continuously learning modern technologies. "
        "Experienced in frontend-backend integration, REST API development, and collaborative software development. "
        "Strong problem-solving abilities with a commitment to writing maintainable, efficient code and delivering high-quality "
        "user experiences."
    )
    content += rf"\pard\plain\f0\fs20\cf2\sa100\sl220\slmult1 {escape_rtf(summary)}\par"

    # Section: Technical Skills
    content += section_title("Technical Skills")
    skills = [
        ("Programming Languages", "Java, JavaScript, Python, SQL"),
        ("Frontend", "React.js, Angular, HTML5, CSS3, Tailwind CSS, Bootstrap"),
        ("Backend", "Node.js, Express.js, REST APIs, Authentication"),
        ("Databases", "MongoDB, MySQL"),
        ("AI & Data Science", "NumPy, Pandas, Scikit-learn"),
        ("Core CS", "Data Structures & Algorithms, OOP, DBMS, Problem Solving"),
        ("Tools", "Git, GitHub, Postman, npm, Vite")
    ]
    for category, items in skills:
        content += rf"\pard\plain\f0\fs20\cf2\sb30\sa30\sl220\slmult1\b {escape_rtf(category)}: \b0 {escape_rtf(items)}\par"

    # Section: Professional Experience
    content += section_title("Professional Experience")
    
    # Exp 1
    content += r"\pard\plain\f0\fs20\cf2\sb60\tqr\tx9360\b AI/ML Intern \cf3 | NeuAI Labs LLP\tab\cf3\b0 Dec 2024 - Jan 2025\par"
    content += r"\pard\plain\f0\fs18\cf3\sa40 Pune, India\par"
    exp1_bullets = [
        "Trained predictive regression models using Scikit-learn and NumPy, achieving 87% accuracy on real-world datasets.",
        "Optimized data pipelines with Pandas, reducing model training time by 15%.",
        "Improved forecasting precision by 12% using regression analysis.",
        "Ensured 90% code coverage by implementing unit tests."
    ]
    for bullet in exp1_bullets:
        content += rf"\pard\plain\f0\fs20\cf2\li360\fi-360\sb20\sa20\sl220\slmult1\bullet\tab {escape_rtf(bullet)}\par"
        
    # Exp 2
    content += r"\pard\plain\f0\fs20\cf2\sb100\tqr\tx9360\b Web Developer Intern \cf3 | Amdox Technologies\tab\cf3\b0 Dec 2025 - Feb 2026\par"
    content += r"\pard\plain\f0\fs18\cf3\sa40 Pune, Maharashtra\par"
    exp2_bullets = [
        "Worked on full stack applications including Job Listing Portal and Certificate Verification System.",
        "Developed frontend interfaces using React and backend APIs using Node.js and Express.js.",
        "Integrated MongoDB for secure data handling and authentication workflows."
    ]
    for bullet in exp2_bullets:
        content += rf"\pard\plain\f0\fs20\cf2\li360\fi-360\sb20\sa20\sl220\slmult1\bullet\tab {escape_rtf(bullet)}\par"

    # Exp 3
    content += r"\pard\plain\f0\fs20\cf2\sb100\tqr\tx9360\b Frontend Developer Intern \cf3 | Midbrains Technologies\tab\cf3\b0 Aug 2023\par"
    content += r"\pard\plain\f0\fs18\cf3\sa40 Maharashtra\par"
    exp3_bullets = [
        "Built responsive business websites and user-friendly layouts.",
        "Strengthened frontend skills through real client-based projects."
    ]
    for bullet in exp3_bullets:
        content += rf"\pard\plain\f0\fs20\cf2\li360\fi-360\sb20\sa20\sl220\slmult1\bullet\tab {escape_rtf(bullet)}\par"

    # Section: Projects
    content += section_title("Projects")
    
    # Project 1
    content += r"\pard\plain\f0\fs20\cf2\sb60\tqr\tx9360\b Job Listing Portal (HireHive)\tab\cf3\b0 Dec 2025 - Feb 2026\par"
    content += r"\pard\plain\f0\fs18\cf3\sa40 Technologies: React.js, Node.js, Express.js, MongoDB, JavaScript, REST APIs, Axios\par"
    proj1_bullets = [
        "Developed a full stack recruitment platform with secure authentication and role-based dashboards.",
        "Built REST APIs for job posting, application management, and user authentication.",
        "Designed responsive React interfaces with reusable components and intuitive UI/UX.",
        "Integrated MongoDB for scalable data management and optimized backend workflows."
    ]
    for bullet in proj1_bullets:
        content += rf"\pard\plain\f0\fs20\cf2\li360\fi-360\sb20\sa20\sl220\slmult1\bullet\tab {escape_rtf(bullet)}\par"

    # Project 2
    content += r"\pard\plain\f0\fs20\cf2\sb100\tqr\tx9360\b Certificate Verification System (ProofPetal)\tab\cf3\b0 Dec 2025 - Feb 2026\par"
    content += r"\pard\plain\f0\fs18\cf3\sa40 Technologies: React.js, Node.js, Express.js, MongoDB, JavaScript, JWT Authentication\par"
    proj2_bullets = [
        "Developed a secure certificate management system with role-based authentication.",
        "Implemented Excel bulk upload, certificate validation, and PDF download features.",
        "Built backend APIs using Express.js and integrated MongoDB for secure storage.",
        "Improved validation logic and application reliability through efficient backend design."
    ]
    for bullet in proj2_bullets:
        content += rf"\pard\plain\f0\fs20\cf2\li360\fi-360\sb20\sa20\sl220\slmult1\bullet\tab {escape_rtf(bullet)}\par"

    # Project 3
    content += r"\pard\plain\f0\fs20\cf2\sb100\tqr\tx9360\b FeedingHope\tab\cf3\b0 Jun 2022 - Mar 2023\par"
    content += r"\pard\plain\f0\fs18\cf3\sa40 Technologies: PHP, MySQL, HTML5, CSS3, JavaScript, Bootstrap, PHPMailer, Apache (XAMPP)\par"
    proj3_bullets = [
        "Built a food donation platform connecting restaurants with NGOs.",
        "Designed responsive interfaces for food donors and NGOs.",
        "Implemented streamlined food request and donation workflows.",
        "Improved accessibility and user experience through intuitive UI design."
    ]
    for bullet in proj3_bullets:
        content += rf"\pard\plain\f0\fs20\cf2\li360\fi-360\sb20\sa20\sl220\slmult1\bullet\tab {escape_rtf(bullet)}\par"

    # Project 4
    content += r"\pard\plain\f0\fs20\cf2\sb100\tqr\tx9360\b Luna FinTech Dashboard\tab\cf3\b0 Apr 2026\par"
    content += r"\pard\plain\f0\fs18\cf3\sa40 Technologies: React.js, JavaScript, Tailwind CSS, Zustand, Recharts, Framer Motion, Sonner, Lucide React\par"
    proj4_bullets = [
        "Developed a modern fintech dashboard with reusable UI components and responsive layouts.",
        "Created interactive analytics screens with clean, intuitive user experience.",
        "Focused on component-based architecture and frontend performance optimization."
    ]
    for bullet in proj4_bullets:
        content += rf"\pard\plain\f0\fs20\cf2\li360\fi-360\sb20\sa20\sl220\slmult1\bullet\tab {escape_rtf(bullet)}\par"

    # Section: Certificates
    content += section_title("Certificates")
    certs = [
        "Web Designer Intern - Midbrains Technologies",
        "Artificial Intelligence & Machine Learning - NeuAI Labs LLP",
        "Web Development - Amdox Technologies"
    ]
    for cert in certs:
        content += rf"\pard\plain\f0\fs20\cf2\li360\fi-360\sb20\sa20\sl220\slmult1\bullet\tab {escape_rtf(cert)}\par"

    # Section: Education
    content += section_title("Education")
    
    # Edu 1
    content += r"\pard\plain\f0\fs20\cf2\sb60\tqr\tx9360\b B.Tech in Artificial Intelligence & Data Science\tab\cf3\b0 2023 - 2026\par"
    content += r"\pard\plain\f0\fs18\cf3\sa40 Genba Sopanrao Moze College of Engineering, Pune | SGPA: 9.15/10.0\par"
    
    # Edu 2
    content += r"\pard\plain\f0\fs20\cf2\sb100\tqr\tx9360\b Diploma in Computer Engineering\tab\cf3\b0 2021 - 2023\par"
    content += r"\pard\plain\f0\fs18\cf3\sa40 JSPM Rajarshi Shahu College of Engineering | 82.57%\par"

    # End
    footer = "}"
    
    return header + content + footer

rtf_output = make_rtf()

# Write to both target locations to be absolutely helpful
paths = [
    r"c:\Users\Hp\Documents\Saniya Hakim resume 1.1.rtf",
    r"c:\Users\Hp\Documents\Saniya Hakim New Resume.rtf"
]

for p in paths:
    with open(p, "w", encoding="ascii", errors="ignore") as f:
        f.write(rtf_output)
    print(f"Written RTF to: {p}")
