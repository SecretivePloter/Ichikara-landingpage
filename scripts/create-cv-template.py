"""Create a fillable copy of the Ichikara CV source without altering the source file."""
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile
import copy
import shutil
import xml.etree.ElementTree as ET

SOURCE = Path(r"C:\Users\andik\Downloads\Template CV Ichikara.docx")
OUTPUT = Path("templates/cv-ichikara-template.docx")
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
XML_SPACE = "{http://www.w3.org/XML/1998/namespace}space"
ET.register_namespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

def cell_text(cell, text):
    # Docxtemplater memakai delimiter satu kurung kurawal secara default.
    text = text.replace("{{", "{").replace("}}", "}")
    paragraphs = cell.findall(f"{W}p")
    if not paragraphs:
        paragraph = ET.SubElement(cell, f"{W}p")
    else:
        paragraph = paragraphs[0]
        for extra in paragraphs[1:]:
            cell.remove(extra)
    for child in list(paragraph):
        if child.tag != f"{W}pPr":
            paragraph.remove(child)
    run = ET.SubElement(paragraph, f"{W}r")
    node = ET.SubElement(run, f"{W}t")
    node.set(XML_SPACE, "preserve")
    node.text = text

def main():
    if not SOURCE.exists():
        raise FileNotFoundError(SOURCE)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(SOURCE) as source:
        package = {name: source.read(name) for name in source.namelist()}
    root = ET.fromstring(package["word/document.xml"])
    tables = root.findall(f".//{W}tbl")
    if len(tables) < 3:
        raise RuntimeError("Struktur tabel Template CV Ichikara berubah.")
    def get_cell(table, row, col):
        return table.findall(f"{W}tr")[row].findall(f"{W}tc")[col]

    identity = tables[0]
    cell_text(get_cell(identity, 0, 0), "{{asOfDate}} 現在")
    cell_text(get_cell(identity, 1, 0), "氏名 {{nameKatakana}}  Name {{fullName}}")
    cell_text(get_cell(identity, 2, 1), "{{birthDate}} ({{age}}歳)")
    cell_text(get_cell(identity, 2, 2), "{{gender}}")
    cell_text(get_cell(identity, 3, 1), "{{phone}}")
    cell_text(get_cell(identity, 3, 3), "{{email}}")
    cell_text(get_cell(identity, 4, 0), "現住所 〒 {{address}}")

    history = tables[1]
    for index, row in enumerate(range(2, 10), 1):
        cell_text(get_cell(history, row, 0), "{{education%dYear}}" % index)
        cell_text(get_cell(history, row, 1), "{{education%dMonth}}" % index)
        cell_text(get_cell(history, row, 2), "{{education%dDetail}}" % index)
    for index, row in enumerate(range(12, 42), 1):
        cell_text(get_cell(history, row, 0), "{{experience%dYear}}" % index)
        cell_text(get_cell(history, row, 1), "{{experience%dMonth}}" % index)
        cell_text(get_cell(history, row, 2), "{{experience%dDetail}}" % index)
    cell_text(get_cell(history, 43, 0), "{{qualificationYear}}")
    cell_text(get_cell(history, 43, 2), "日本語能力試験 {{jlptLevel}} 合格 {{certificates}}")

    skill = tables[2]
    cell_text(get_cell(skill, 1, 0), "{{skills}}")

    package["word/document.xml"] = ET.tostring(root, encoding="utf-8", xml_declaration=True)
    with ZipFile(OUTPUT, "w", ZIP_DEFLATED) as target:
        for name, data in package.items():
            target.writestr(name, data)
    print(OUTPUT)

if __name__ == "__main__":
    main()
