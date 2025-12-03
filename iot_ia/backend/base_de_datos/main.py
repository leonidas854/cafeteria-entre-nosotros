from fastapi import FastAPI, HTTPException, Query
from sqlalchemy import create_engine, text
import pandas as pd
import numpy as np
from joblib import dump, load
import nltk
from nltk.corpus import stopwords
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)


nltk.download('stopwords', quiet=True)
stopwords_es = stopwords.words("spanish")


DB_URL = "postgresql://postgres:124875369@localhost:5432/Cafeteria_DB"
engine = create_engine(DB_URL)

MODEL_FILE = "modelo_final.joblib"


@app.post("/entrenar")
def entrenar_modelo():
    try:
        print("📥 Cargando datos desde PostgreSQL...")
        
        
        query = text("""
            SELECT 
                r.comentario, 
                r.puntuacion,
                p."Tipo" as tipo,
                p."Categoria" as categoria,
                p."Sub_categoria" as sub_categoria,
                p."Estado" as estado_bool,
                p."Sabores" as sabores,
                p."Precio" as precio
            FROM "Resenas" r
            JOIN "Producto" p ON r."Producto_id" = p."Id_producto"
        """)
        
        with engine.connect() as conn:
            df = pd.read_sql(query, conn)

        if df.empty:
            return {"mensaje": "No hay suficientes datos en la BD para entrenar. Agrega reseñas primero."}

        
        df = df.fillna({
            'comentario': '',
            'sabores': '',
            'tipo': 'Desconocido',
            'categoria': 'General',
            'sub_categoria': 'General',
            'precio': 0
        })

        
        df['estado'] = df['estado_bool'].apply(lambda x: 'Activo' if x else 'Inactivo')

        
        df['comentario_largo'] = (df['comentario'].str.len() > 50).astype(int)
        df['estado_activo'] = (df['estado'] == 'Activo').astype(int)
        
        
        df['latitud'] = 0 
        df['longitud'] = 0

        
        text_cols = "comentario"
        sabores_col = "sabores"
        num_cols = ["precio", "latitud", "longitud"]
        cat_cols = ["tipo", "categoria", "sub_categoria", "estado"]
        bin_cols = ["comentario_largo", "estado_activo"]

        X = df
        y = df["puntuacion"]

        
        preprocesamiento = ColumnTransformer(
            transformers=[
                ("tfidf_comentario", TfidfVectorizer(max_features=2000, stop_words=stopwords_es), text_cols),
                ("tfidf_sabores", TfidfVectorizer(max_features=500, stop_words=stopwords_es), sabores_col),
                ("onehot", OneHotEncoder(handle_unknown="ignore"), cat_cols),
                ("passthrough", "passthrough", num_cols + bin_cols)
            ],
            remainder="drop"
        )

        modelo_rf = RandomForestClassifier(
            n_estimators=300,       
            max_depth=20,           
            min_samples_leaf=2,     
            class_weight='balanced',
            n_jobs=-1,              
            random_state=42
        )

        pipeline = Pipeline([
            ("preprocesador", preprocesamiento),
            ("clf", modelo_rf) 
        ])

        print("🧠 Entrenando modelo...")
        pipeline.fit(X, y)

        dump(pipeline, MODEL_FILE)
        print("💾 Modelo guardado.")

        return {
            "mensaje": "Modelo entrenado exitosamente usando lógica TF-IDF + RandomForest",
            "registros_usados": len(df),
            "score_training": round(pipeline.score(X, y), 4)
        }

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/recomendaciones")
def obtener_recomendaciones():
    if not os.path.exists(MODEL_FILE):
        return {"error": "El modelo no existe. Ejecuta POST /entrenar primero."}
    
    try:
        pipeline = load(MODEL_FILE)

        
        query = text("""
            SELECT 
                "Id_producto" as id,
                "Nombre" as nombre,
                "Tipo" as tipo,
                "Categoria" as categoria,
                "Sub_categoria" as sub_categoria,
                "Sabores" as sabores,
                "Precio" as precio,
                "Image_url" as image_url
            FROM "Producto"
            WHERE "Estado" = true
        """)
        
        with engine.connect() as conn:
            df_prod = pd.read_sql(query, conn)

        if df_prod.empty:
            return {"mensaje": "No hay productos activos."}

        
        df_prod['comentario'] = df_prod['nombre'] 
        df_prod['estado'] = 'Activo'
        
        
        df_prod['latitud'] = 0
        df_prod['longitud'] = 0
        df_prod = df_prod.fillna({'sabores': '', 'tipo': 'General', 'categoria': 'General', 'sub_categoria': 'General'})
        
        
        df_prod['comentario_largo'] = (df_prod['comentario'].str.len() > 50).astype(int)
        df_prod['estado_activo'] = 1

        
        probs = pipeline.predict_proba(df_prod) 
        clases = pipeline.classes_ 
        
        
        scores = np.dot(probs, clases)
        
        df_prod['score_predicho'] = scores

        top_productos = df_prod.sort_values(by='score_predicho', ascending=False).head(15)

        recomendaciones = []
        for _, row in top_productos.iterrows():
            recomendaciones.append({
                "id_producto": int(row['id']),
                "nombre": row['nombre'],
                "categoria": row['categoria'],
                "precio": float(row['precio']),
                "imagen": row['image_url'],
                "score_ia": round(float(row['score_predicho']), 2)
            })

        return {
            "mensaje": "Top productos recomendados (Tokenización aplicada)",
            "productos": recomendaciones
        }

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    

def obtener_predicciones_base_ia():
    if not os.path.exists(MODEL_FILE):
        raise HTTPException(
            status_code=404, 
            detail="Modelo no encontrado (modelo_final.joblib). Por favor, entrena el modelo primero usando el endpoint /entrenar."
        )
    
    pipeline = load(MODEL_FILE)
    
    query = text("""
        SELECT 
            "Id_producto" as id, "Nombre" as nombre, "Tipo" as tipo, "Categoria" as categoria,
            "Sub_categoria" as sub_categoria, "Sabores" as sabores, "Precio" as precio, "Image_url" as image_url
        FROM "Producto" WHERE "Estado" = true
    """)
    
    with engine.connect() as conn:
        df_prod = pd.read_sql(query, conn)

    if df_prod.empty:
        raise HTTPException(status_code=404, detail="No se encontraron productos activos en la base de datos.")

    df_pred = df_prod.copy()

    
    df_pred['comentario'] = df_pred['nombre'] + " " + df_pred['categoria']
    

    df_pred['estado'] = 'Activo'
    df_pred['estado_activo'] = 1  
    df_pred['comentario_largo'] = (df_pred['comentario'].str.len() > 50).astype(int) 
    df_pred['latitud'] = 0  
    df_pred['longitud'] = 0 


    df_pred = df_pred.fillna({
        'sabores': '', 
        'tipo': 'General', 
        'categoria': 'General', 
        'sub_categoria': 'General', 
        'precio': 0
    })

    probabilidades = pipeline.predict_proba(df_pred)
    score_esperado = np.dot(probabilidades, pipeline.classes_)
    
    df_prod['score_ia'] = score_esperado
    
    return df_prod


@app.get("/recomendaciones/clima", tags=["Recomendaciones"])
def obtener_recomendaciones_por_clima(
    temperatura: float = Query(..., description="Temperatura actual en grados Celsius (°C). Ejemplo: 28.5"),
    humedad: float = Query(..., description="Humedad relativa actual en porcentaje (%). Ejemplo: 65")
):
    try:
      
        df_recomendaciones = obtener_predicciones_base_ia()


        def calcular_ajuste_climatico(producto):
            categoria = str(producto['categoria']).lower()
            ajuste = 0.0
            

            if temperatura > 25:  
                if any(keyword in categoria for keyword in ["frias", "fríos", "frutas", "tes fríos"]):
                    ajuste += 1.5  
                elif "calientes" in categoria:
                    ajuste -= 1.0  
            
            elif temperatura < 15: 
                if "calientes" in categoria:
                    ajuste += 1.5  
                elif any(keyword in categoria for keyword in ["frias", "fríos", "frutas"]):
                    ajuste -= 1.0  
            
            if humedad > 80 and "reposteria" in categoria:
                ajuste -= 0.3  

            return ajuste

        df_recomendaciones['ajuste_clima'] = df_recomendaciones.apply(calcular_ajuste_climatico, axis=1)
        

        df_recomendaciones['score_final'] = df_recomendaciones['score_ia'] + df_recomendaciones['ajuste_clima']
        
        top_10_productos = df_recomendaciones.sort_values(by='score_final', ascending=False).head(10)
        
        resultado_final = []
        for _, producto in top_10_productos.iterrows():
             resultado_final.append({
                "id_producto": int(producto['id']),
                "nombre": producto['nombre'],
                "categoria": producto['categoria'],
                "precio": float(producto['precio']),
                "imagen": producto['image_url'],
                "score_final_ajustado": round(float(producto['score_final']), 2),
                "detalle_puntuacion": {
                    "score_base_ia": round(float(producto['score_ia']), 2),
                    "ajuste_por_clima": round(float(producto['ajuste_clima']), 2)
                }
            })

        return {
            "mensaje": f"Top 10 recomendaciones para {temperatura}°C y {humedad}% de humedad.",
            "productos": resultado_final
        }
        
    except HTTPException as e:

        raise e
    except Exception as e:
 
        print(f"ERROR INESPERADO: {e}")
        raise HTTPException(status_code=500, detail="Ocurrió un error interno en el servidor.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)