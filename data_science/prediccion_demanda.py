import sys
import io
import os
import json
import warnings
from datetime import datetime

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

warnings.filterwarnings('ignore')

import logging
logging.disable(logging.CRITICAL)

script_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(script_dir, '..', '.env')

from dotenv import load_dotenv
load_dotenv(dotenv_path=dotenv_path)

import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score


def main():
    filtro_id = None
    if len(sys.argv) > 1:
        try:
            filtro_id = int(sys.argv[1])
        except ValueError:
            pass

    db_name = os.getenv('DB_NAME', 'gadgetdrop_db')
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', '')
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')

    connection_string = f'postgresql+psycopg2://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'

    try:
        engine = create_engine(connection_string)
        query = '''
            SELECT
              DATE_TRUNC('month', p."createdAt") as mes,
              dp."productoId",
              pr.nombre,
              pr.stock,
              pr.categoria,
              SUM(dp.cantidad) as unidades_vendidas
            FROM detalle_pedidos dp
            JOIN pedidos p ON dp."pedidoId" = p.id
            JOIN productos pr ON dp."productoId" = pr.id
            WHERE p.estado IN (\'entregado\', \'enviado\')
            GROUP BY mes, dp."productoId", pr.nombre, pr.stock, pr.categoria
            ORDER BY dp."productoId", mes
        '''
        df = pd.read_sql(query, engine)
        engine.dispose()
    except Exception as e:
        print(json.dumps({"error": f"Error de conexión a la base de datos: {str(e)}"}))
        sys.exit(1)

    now = datetime.now()
    month_names_es = {
        1: 'ene', 2: 'feb', 3: 'mar', 4: 'abr', 5: 'may', 6: 'jun',
        7: 'jul', 8: 'ago', 9: 'sep', 10: 'oct', 11: 'nov', 12: 'dic'
    }
    meses_predichos = []
    for i in range(1, 4):
        month = (now.month - 1 + i) % 12 + 1
        year = now.year + (now.month - 1 + i) // 12
        meses_predichos.append(f"{month_names_es[month]} {year}")

    if df.empty:
        print(json.dumps({
            "generado_en": now.isoformat(),
            "meses_predichos": meses_predichos,
            "predicciones": []
        }, ensure_ascii=False))
        return

    predicciones = []
    productos_ids = df['productoId'].unique()

    if filtro_id is not None:
        productos_ids = [pid for pid in productos_ids if pid == filtro_id]

    for prod_id in productos_ids:
        prod_df = df[df['productoId'] == prod_id].sort_values('mes').reset_index(drop=True)

        if len(prod_df) < 3:
            continue

        nombre = str(prod_df.iloc[0]['nombre'])
        stock = int(prod_df.iloc[0]['stock'])
        categoria = str(prod_df.iloc[0]['categoria']) if prod_df.iloc[0]['categoria'] else None

        X = np.array(range(1, len(prod_df) + 1)).reshape(-1, 1)
        y = prod_df['unidades_vendidas'].values.astype(float)

        model = LinearRegression()
        model.fit(X, y)

        y_pred_train = model.predict(X)
        r2 = float(r2_score(y, y_pred_train))

        n = len(prod_df)
        x_future = np.array([[n + 1], [n + 2], [n + 3]])
        preds_raw = model.predict(x_future)
        preds = [max(0, round(float(p))) for p in preds_raw]

        promedio_mensual = round(float(y.mean()), 1)
        total_predicho = sum(preds)
        alerta_restock = bool(stock < total_predicho)

        dias_restock = round((stock / promedio_mensual) * 30) if promedio_mensual > 0 else 0

        if stock < preds[0]:
            nivel_alerta = "critico"
        elif stock < total_predicho:
            nivel_alerta = "advertencia"
        else:
            nivel_alerta = "ok"

        predicciones.append({
            "productoId": int(prod_id),
            "nombre": nombre,
            "categoria": categoria,
            "stock_actual": stock,
            "historico_meses": len(prod_df),
            "promedio_mensual": promedio_mensual,
            "r2_score": round(r2, 4),
            "prediccion_mes1": preds[0],
            "prediccion_mes2": preds[1],
            "prediccion_mes3": preds[2],
            "total_predicho_3m": total_predicho,
            "alerta_restock": alerta_restock,
            "nivel_alerta": nivel_alerta,
            "dias_restock": dias_restock
        })

    print(json.dumps({
        "generado_en": now.isoformat(),
        "meses_predichos": meses_predichos,
        "predicciones": predicciones
    }, ensure_ascii=False))


if __name__ == '__main__':
    main()
