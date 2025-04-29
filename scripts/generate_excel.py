#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import yaml
import pandas as pd
from pathlib import Path

# Ruta de tu carpeta de contenido y de la plantilla Excel
CONTENT_DIR = Path('categorias')    # o 'content' si ese es el nombre real
TEMPLATE_XLSX = Path('categorias_productos_template.xlsx')
OUTPUT_XLSX   = Path('categorias_productos_filled.xlsx')

# Columnas deben coincidir con las de la plantilla
categories_cols = pd.read_excel(TEMPLATE_XLSX, sheet_name='Categorias', nrows=0).columns.tolist()
products_cols   = pd.read_excel(TEMPLATE_XLSX, sheet_name='Productos'  , nrows=0).columns.tolist()

# Prepara listas para filas
categories_data = []
products_data   = []

def parse_front_matter(path: Path) -> dict:
    """Lee el YAML front-matter del principio de un .md y devuelve un dict."""
    text = path.read_text(encoding='utf-8')
    if text.startswith('---'):
        _, fm, _ = text.split('---', 2)
        return yaml.safe_load(fm) or {}
    return {}

for md_file in CONTENT_DIR.rglob('*.md'):
    meta = parse_front_matter(md_file)
    # Asegúrate de que exista el campo type
    tipo = meta.get('type')
    row = {}
    # Normaliza FAQs (hasta 5)
    faqs = meta.get('faqs', [])
    for i in range(1, 6):
        if i <= len(faqs):
            row[f'faq{i}_question'] = faqs[i-1].get('question', '')
            row[f'faq{i}_answer']   = faqs[i-1].get('answer', '')
        else:
            row[f'faq{i}_question'] = ''
            row[f'faq{i}_answer']   = ''
    if tipo == 'categoria':
        # Rellena sólo las columnas de categorías que existan en meta
        for col in categories_cols:
            if col in row: 
                continue
            row[col] = meta.get(col, '')
        # Slug y path deducidos de la ruta
        slug = md_file.stem  # normalmente 'index' en carpeta slug, pero meta['slug'] lo define
        row['slug'] = meta.get('slug', slug)
        row['path'] = meta.get('path', f"/categorias/{row['slug']}")
        categories_data.append(row)

    elif tipo == 'producto':
        for col in products_cols:
            if col in row: 
                continue
            # Productos usan category_slug en lugar de category
            if col == 'category_slug':
                # carpeta padre
                row[col] = md_file.parent.name
            else:
                row[col] = meta.get(col, '')
        slug = md_file.stem
        row['slug'] = meta.get('slug', slug)
        row['path'] = meta.get('path', f"/categorias/{row['category_slug']}/{row['slug']}")
        products_data.append(row)

    else:
        # Ignora otros tipos
        continue

# Crea DataFrames
df_cats = pd.DataFrame(categories_data, columns=categories_cols)
df_prods = pd.DataFrame(products_data, columns=products_cols)

# Escribe nuevo Excel
with pd.ExcelWriter(OUTPUT_XLSX, engine='xlsxwriter') as writer:
    df_cats.to_excel(writer, sheet_name='Categorias', index=False)
    df_prods.to_excel(writer, sheet_name='Productos' , index=False)

print(f"✅ Generadas hojas en {OUTPUT_XLSX}")
