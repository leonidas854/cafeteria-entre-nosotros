from fastapi import FastAPI
from faker import Faker
import random
from datetime import datetime, timedelta
import pandas as pd
from sqlalchemy import create_engine, text
import logging

# --- Configuración de Logging ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
fake = Faker("es_ES")

# --- 1. CONEXIÓN A LA BASE DE DATOS Y CARGA DE DATOS ---


DB_URL = "postgresql://postgres:124875369@localhost:5432/Cafeteria_DB"
engine = create_engine(DB_URL)

# Variable global para almacenar los datos de los productos
productos_df = pd.DataFrame()
clientes_df = pd.DataFrame()
product_weights = []
POPULARITY_FACTOR = 0.8 
client_ids = []

@app.on_event("startup")
def cargar_datos_desde_db():
    """
    Función ÚNICA que se ejecuta al iniciar la API.
    Carga tanto los productos como los clientes. No se pueden tener dos decoradores 'startup'.
    """
    global productos_df, clientes_df,product_weights,client_ids
    
    # Cargar Productos
    try:
        logger.info("Cargando productos desde la base de datos...")
        query_prod = text('SELECT "Id_producto", "Nombre", "Categoria", "Sub_categoria" FROM "Producto"')
        with engine.connect() as connection:
            productos_df = pd.read_sql(query_prod, connection)
        
        if not productos_df.empty:
            productos_df.rename(columns={"Id_producto": "id_producto", "Nombre": "nombre", "Categoria": "categoria", "Sub_categoria": "sub_categoria"}, inplace=True)
            logger.info(f"Carga exitosa. Se encontraron {len(productos_df)} productos.")

            logger.info("Calculando distribución de popularidad de productos...")
            num_productos = len(productos_df)
            raw_weights = [1 / (i ** POPULARITY_FACTOR) for i in range(1, num_productos + 1)]
            random.shuffle(raw_weights)
            product_weights = raw_weights
            logger.info("Distribución de popularidad asignada.")

        else:
            logger.warning("No se encontraron productos en la base de datos.")
    except Exception as e:
        logger.error(f"Error fatal al cargar productos: {e}")

    # Cargar Clientes
    try:
        logger.info("Cargando clientes desde la base de datos...")
        query_cli = text('SELECT "Id_user" FROM "Cliente"')
        with engine.connect() as connection:
            clientes_df = pd.read_sql(query_cli, connection)

        if not clientes_df.empty:
            client_ids = clientes_df['Id_user'].tolist()
            logger.info(f"Carga exitosa. Se encontraron {len(client_ids)} IDs de clientes.")
        else:
            logger.warning("No se encontraron clientes en la base de datos.")
    except Exception as e:
        logger.error(f"Error fatal al cargar clientes: {e}")

# --- 2. DICCIONARIO DE CONTEXTO AVANZADO (AJUSTADO A TUS CATEGORÍAS) ---

ATRIBUTOS_POR_CATEGORIA = {
    "Café en grano": {
        "sustantivos": ["aroma", "cuerpo", "acidez", "tueste", "sabor residual", "origen"],
        "positivos": ["intenso", "equilibrado", "delicado", "complejo", "suave", "perfecto"],
        "negativos": ["quemado", "débil", "demasiado amargo", "plano", "agrio", "rancio"]
    },
    "Bebidas calientes con café": {
        "sustantivos": ["temperatura", "cremosidad", "equilibrio", "presentación", "intensidad del café"],
        "positivos": ["reconfortante", "ideal", "cremosa", "deliciosa", "perfecta"],
        "negativos": ["tibia", "aguada", "sin sabor a café", "descuidada", "fría"]
    },
    "Bebidas calientes sin café": {
        "sustantivos": ["temperatura", "dulzura", "textura", "presentación", "sabor"],
        "positivos": ["reconfortante", "ideal", "suave", "deliciosa", "perfecta"],
        "negativos": ["tibia", "empalagosa", "simple", "insípida", "fría"]
    },
    "Bebidas Frias con Café": {
        "sustantivos": ["frescura", "sabor", "equilibrio café-dulce", "presentación", "cantidad de hielo"],
        "positivos": ["refrescante", "delicioso", "sorprendente", "bien balanceado", "ideal"],
        "negativos": ["aguado", "demasiado dulce", "casi no sabía a café", "mal presentado", "puro hielo"]
    },
    "Tes Fríos": {
        "sustantivos": ["sabor", "frescura", "nivel de dulzor", "fragancia"],
        "positivos": ["muy refrescante", "natural", "ligero", "delicioso"],
        "negativos": ["artificial", "demasiado dulce", "insípido", "sin aroma"]
    },
    "Bebidas Con Frutas": {
        "sustantivos": ["frescura de la fruta", "sabor", "textura", "color", "dulzor"],
        "positivos": ["natural", "refrescante", "trozos de fruta real", "vibrante"],
        "negativos": ["sabor artificial", "demasiado procesado", "aguado", "muy ácido"]
    },
    "Reposteria": {
        "sustantivos": ["textura", "sabor", "frescura", "dulzura", "relleno", "presentación"],
        "positivos": ["esponjosa", "crujiente", "recién hecha", "deliciosa", "balanceada", "exquisita"],
        "negativos": ["seca", "dura", "parecía de ayer", "empalagosa", "escaso", "decepcionante"]
    },
    "Desayunos": {
        "sustantivos": ["porción", "sabor", "presentación", "temperatura", "acompañamiento"],
        "positivos": ["abundante", "casero", "delicioso", "caliente", "perfecto"],
        "negativos": ["pequeña", "sin sazón", "frío", "incompleto", "grasoso"]
    },
    "default": {
        "sustantivos": ["calidad", "precio", "experiencia", "presentación", "sabor"],
        "positivos": ["excelente", "buena", "justo", "increíble", "adecuada"],
        "negativos": ["mala", "decepcionante", "caro", "pobre", "mejorable"]
    }
}

positivos_gen = ["excelente", "delicioso", "maravilloso", "agradable", "increíble", "espectacular"]
negativos_gen = ["terrible", "decepcionante", "malo", "insípido", "horrible", "pésimo"]

def generar_comentario_avanzado(producto, puntuacion):
    nombre_prod = producto['nombre']
    categoria = producto['categoria']
    contexto = ATRIBUTOS_POR_CATEGORIA.get(categoria, ATRIBUTOS_POR_CATEGORIA["default"])

    if random.random() < 0.15: 
        if puntuacion >= 4:
            return random.choice(["Excelente.", "Muy bueno!", "Delicioso.", f"El mejor {nombre_prod} que he probado.", "10/10 lo recomiendo."])
        elif puntuacion == 3:
            return random.choice(["Normal.", "Aceptable.", "Estuvo bien.", "Ni mal ni bien."])
        else:
            return random.choice(["Malo.", "No me gustó.", "Decepcionante.", "No lo volvería a pedir."])

    partes_comentario = []

    sustantivo1 = random.choice(contexto["sustantivos"])
    if puntuacion >= 4:
        adjetivo1 = random.choice(contexto["positivos"])
        partes_comentario.append(f"El {sustantivo1} del {nombre_prod} estuvo {adjetivo1}.")
    elif puntuacion == 3:
        if random.random() < 0.5:
            partes_comentario.append(f"El {sustantivo1} del {nombre_prod} fue aceptable, pero esperaba más.")
        else:
            partes_comentario.append(f"En general, la experiencia con el {nombre_prod} fue normal.")
    else:
        adjetivo1 = random.choice(contexto["negativos"])
        partes_comentario.append(f"La verdad, el {sustantivo1} del {nombre_prod} me pareció bastante {adjetivo1}.")

    if random.random() < 0.7: 
        sustantivo2 = random.choice([s for s in contexto["sustantivos"] if s != sustantivo1] or [sustantivo1])
        
        if puntuacion == 5: 
            adjetivo2 = random.choice(contexto["positivos"])
            frase = f"Además, su {sustantivo2} era especialmente {adjetivo2}."
            partes_comentario.append(frase)

        elif puntuacion == 4: 
            if random.random() < 0.4: 
                adjetivo_neg = random.choice(contexto["negativos"])
                frase = f"Lo único malo fue que el {sustantivo2} estaba un poco {adjetivo_neg}, pero por lo demás, todo bien."
                partes_comentario.append(frase)

        elif puntuacion == 2:
             if random.random() < 0.4: 
                adjetivo_pos = random.choice(contexto["positivos"])
                frase = f"Aunque hay que admitir que la {sustantivo2} era {adjetivo_pos}, no fue suficiente para salvar la experiencia."
                partes_comentario.append(frase)
        
        elif puntuacion == 1: 
            adjetivo2 = random.choice(contexto["negativos"])
            frase = f"Para colmo, el {sustantivo2} estaba {adjetivo2}. Una decepción total."
            partes_comentario.append(frase)

    if random.random() < 0.6: 
        if puntuacion >= 4:
            partes_comentario.append(random.choice(["Sin duda lo volveré a pedir.", "Totalmente recomendado.", "¡Sigan así!"]))
        elif puntuacion == 3:
            partes_comentario.append(random.choice(["Quizás le dé otra oportunidad en el futuro.", "Una experiencia sin más."]))
        else:
            partes_comentario.append(random.choice(["No creo que vuelva.", "Una lástima.", "No lo recomiendo."]))
    
    return " ".join(partes_comentario)

def distorsionar_texto(texto):
    errores = {"muy ": "mui ", "está ": "esta ", "que ": "q ", "delicioso": "delisioso", "excelente": "exelente"}
    for k, v in errores.items():
        if random.random() < 0.08: texto = texto.replace(k, v)
    return texto


@app.get("/generar_resenas/{cantidad}")
def generar_resenas(cantidad: int):
    if productos_df.empty or clientes_df.empty or not product_weights:
        return {"error": "Las listas de productos o clientes no están cargadas. Revisa los logs de la API."}
    

    reseñas = []
    selected_indices = random.choices(
        population=productos_df.index,
        weights=product_weights,
        k=cantidad
    )
    selected_products_df = productos_df.loc[selected_indices]
    selected_products_list = selected_products_df.to_dict('records')

    num_resen = 1




    for i, producto_seleccionado in enumerate(selected_products_list):
        logger.info(f"{num_resen}/{cantidad}")
        num_resen+=1
        cliente_id_seleccionado = random.choice(client_ids)
        
        # Lógica de generación (sin cambios)
        puntuacion = random.choices([1, 2, 3, 4, 5], weights=[0.05, 0.1, 0.2, 0.35, 0.3])[0]
        comentario_base = generar_comentario_avanzado(producto_seleccionado, puntuacion)
        comentario_final = distorsionar_texto(comentario_base)
        
        reseña = {
            "id_resena": i + 1,
            
            "comentario": comentario_final,
            "puntuacion": puntuacion,
            "Fecha_Resena": (datetime.now() - timedelta(days=random.randint(0, 365))).strftime("%Y-%m-%d %H:%M:%S"),
            "Cliente_id": cliente_id_seleccionado,
            "Id_Producto": producto_seleccionado['id_producto'],
        }
        reseñas.append(reseña)
        
    return reseñas