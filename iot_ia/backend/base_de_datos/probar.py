import requests
import pandas as pd
from sqlalchemy import create_engine
import logging

# --- CONFIGURACIÓN ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

API_URL = "http://127.0.0.1:8000"
CANTIDAD_A_GENERAR = 50000

DB_USER = "postgres"
DB_PASSWORD = "124875369"
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "Cafeteria_DB"

DB_CONNECTION_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

CSV_FILENAME = "reseñas_generadas.csv"
TABLE_NAME = "Resenas" 

def poblar_resenas():

    endpoint = f"{API_URL}/generar_resenas/{CANTIDAD_A_GENERAR}"
    logging.info(f"Llamando a la API en {endpoint} para generar {CANTIDAD_A_GENERAR} reseñas...")
    
    try:
        response = requests.get(endpoint, timeout=120) 
        response.raise_for_status()  
        datos_generados = response.json()
        if not datos_generados or "error" in datos_generados:
            logging.error(f"La API devolvió un error: {datos_generados.get('error', 'Respuesta vacía')}")
            return
        logging.info(f"Se recibieron {len(datos_generados)} reseñas de la API.")
    except requests.exceptions.RequestException as e:
        logging.error(f"No se pudo conectar con la API en {API_URL}. Asegúrate de que FastAPI está en ejecución.")
        logging.error(f"Detalle del error: {e}")
        return


    df = pd.DataFrame(datos_generados)

    try:
        df.rename(columns={
            'id_resena': 'Id_resena',           
            'Comentario': 'comentario',         
            'Puntuacion': 'puntuacion',         
            'Fecha_Resena': 'Fech_resena',      
            'Id_Cliente': 'Cliente_id',         
            'Id_Producto': 'Producto_id'        
        }, inplace=True)
        
        logging.info("Columnas renombradas para coincidir con la base de datos.")

    except KeyError as e:
        logging.error(f"Error al renombrar. Una columna esperada de la API no se encontró: {e}")
        logging.info(f"Columnas recibidas de la API: {df.columns.tolist()}")
        return
    

    logging.info(f"Guardando {len(df)} registros en el archivo CSV: '{CSV_FILENAME}'...")
    try:
        df.to_csv(CSV_FILENAME, index=False, encoding='utf-8-sig')
        logging.info("Archivo CSV guardado con éxito.")
    except Exception as e:
        logging.error(f"Ocurrió un error al guardar el archivo CSV: {e}")


    logging.info(f"Conectando a la base de datos '{DB_NAME}' en {DB_HOST}...")
    try:
        engine = create_engine(DB_CONNECTION_URL)
        
        logging.info(f"Insertando {len(df)} registros en la tabla '{TABLE_NAME}'...")
        
        df.to_sql(
            TABLE_NAME,
            con=engine,
            if_exists='append',
            index=False,      
            method='multi'   
        )
        
        logging.info("¡Inserción completada con éxito!")

    except Exception as e:
        logging.error(f"Ocurrió un error durante la inserción en la base de datos: {e}")

if __name__ == "__main__":
    poblar_resenas()