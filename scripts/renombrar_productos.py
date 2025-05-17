import os
import shutil
from pathlib import Path

# Ruta base al directorio content/categorias
BASE_DIR = Path("content/categorias")

for categoria in BASE_DIR.iterdir():
    if categoria.is_dir():
        for producto in categoria.iterdir():
            if producto.is_dir():
                index_md = producto / "index.md"
                if index_md.exists():
                    nuevo_nombre = producto.name + ".md"
                    nuevo_destino = categoria / nuevo_nombre

                    print(f"Moviendo: {index_md} → {nuevo_destino}")
                    shutil.move(str(index_md), str(nuevo_destino))
                    shutil.rmtree(producto)  # Elimina carpeta del producto
