import sys
import io
import os
import json
import warnings

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

warnings.filterwarnings('ignore')

import logging
logging.disable(logging.CRITICAL)

script_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(script_dir, '..', '.env')

from dotenv import load_dotenv
load_dotenv(dotenv_path=dotenv_path)

import pandas as pd
from sqlalchemy import create_engine
from sklearn.metrics.pairwise import cosine_similarity


def main():
    try:
        producto_id = int(sys.argv[1])
    except (IndexError, ValueError):
        print(json.dumps({"error": "productoId inválido o no proporcionado", "productoId": None}))
        sys.exit(1)

    db_name = os.getenv('DB_NAME', 'gadgetdrop_db')
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', '')
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')

    connection_string = f'postgresql+psycopg2://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'

    try:
        engine = create_engine(connection_string)

        query_detalles = '''
            SELECT dp."pedidoId", dp."productoId", dp.cantidad
            FROM detalle_pedidos dp
            JOIN pedidos p ON dp."pedidoId" = p.id
            WHERE p.estado IN (\'entregado\', \'enviado\')
        '''

        query_productos = '''
            SELECT id, nombre, categoria, precio FROM productos
        '''

        detalles_df = pd.read_sql(query_detalles, engine)
        productos_df = pd.read_sql(query_productos, engine)
        engine.dispose()

    except Exception as e:
        print(json.dumps({"error": f"Error de conexión a la base de datos: {str(e)}", "productoId": producto_id}))
        sys.exit(1)

    if productos_df.empty:
        print(json.dumps({"error": "No hay productos en la base de datos", "productoId": producto_id}))
        sys.exit(1)

    producto_row = productos_df[productos_df['id'] == producto_id]
    if producto_row.empty:
        print(json.dumps({"error": f"Producto con id {producto_id} no encontrado", "productoId": producto_id}))
        sys.exit(1)

    nombre_producto = producto_row.iloc[0]['nombre']

    if detalles_df.empty:
        print(json.dumps({"error": "No hay datos de ventas suficientes para generar recomendaciones", "productoId": producto_id}))
        sys.exit(1)

    usuario_producto = (
        detalles_df
        .groupby(['pedidoId', 'productoId'])['cantidad']
        .sum()
        .unstack(fill_value=0)
    )

    if producto_id not in usuario_producto.columns:
        print(json.dumps({"error": f"El producto {producto_id} no tiene suficientes datos de ventas", "productoId": producto_id}))
        sys.exit(1)

    producto_usuario = usuario_producto.T
    similitud = cosine_similarity(producto_usuario)

    ids = list(producto_usuario.index)
    similitud_df = pd.DataFrame(similitud, index=ids, columns=ids)

    scores_raw = (
        similitud_df[producto_id]
        .drop(labels=[producto_id])
        .sort_values(ascending=False)
        .head(5)
    )

    MIN_SIMILITUD = 0.15
    scores = scores_raw[scores_raw >= MIN_SIMILITUD]
    pocas_recomendaciones = len(scores) < 3

    id_a_nombre = dict(zip(productos_df['id'], productos_df['nombre']))
    id_a_cat = dict(zip(productos_df['id'], productos_df['categoria']))
    id_a_precio = dict(zip(productos_df['id'], productos_df['precio']))

    recomendaciones = []
    for rec_id, score in scores.items():
        recomendaciones.append({
            "productoId": int(rec_id),
            "nombre": id_a_nombre.get(rec_id, str(rec_id)),
            "categoria": id_a_cat.get(rec_id),
            "precio": float(id_a_precio.get(rec_id, 0)),
            "similitud": round(float(score), 4)
        })

    result = {
        "productoId": producto_id,
        "nombreProducto": nombre_producto,
        "recomendaciones": recomendaciones,
    }
    if pocas_recomendaciones:
        result["advertencia"] = "Pocas recomendaciones con alta confianza para este producto"

    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
