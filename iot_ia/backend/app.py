import streamlit as st
import cv2
import time
import numpy as np

# =========================================================
# === 1. CONFIGURACIÓN E INICIALIZACIÓN DE SESIÓN ===
# =========================================================

# Configuración inicial de la página
st.set_page_config(
    page_title="Recomendador de Cafetería IA",
    layout="wide"
)

if 'running' not in st.session_state:
    st.session_state.running = False

def start_stop():
    """Alterna el estado de la cámara (encendido/apagado)."""
    st.session_state.running = not st.session_state.running

# --- FUNCIÓN DE SIMULACIÓN ---
def get_mock_prediction(frame):
    """
    Simula la predicción de emociones y la recomendación.
    Genera probabilidades realistas que suman 1.0.
    """
    emotions_map = ['sorpresa', 'tristeza', 'enojado', 'happy', 'desagrado', 'neutral']
    
    # Base de probabilidades (foco en 'happy' como ejemplo)
    base_probs = np.array([0.05, 0.05, 0.05, 0.05, 0.60, 0.10]) 
    
    # Añadimos ruido controlado
    noise = np.random.randn(len(emotions_map)) * 0.03
    probs = np.clip(base_probs + noise, 0, 1)
    probs = probs / probs.sum() # Normalizamos a 1.0 (100%)
    
    emotion_probs = dict(zip(emotions_map, probs))
    
    # Motor de recomendación simple
    dominant_emotion = max(emotion_probs, key=emotion_probs.get)
    dominant_prob = emotion_probs[dominant_emotion]
    
    if dominant_emotion == 'happy' and dominant_prob > 0.5:
        cafe = "Café Puro Irlandés"
        desc = "¡Felicidad detectada! Un sabor robusto para celebrar tu buen ánimo."
    elif dominant_emotion == 'tristeza' or dominant_emotion == 'enojado':
        cafe = "Té de Manzanilla Relajante"
        desc = "Detectamos una emoción intensa. Un té calmante es ideal para equilibrar."
    else:
        cafe = "Café Americano Fuerte"
        desc = "Emoción neutra. Un clásico para mantener la concentración y energía."
        
    return emotion_probs, cafe, desc

# =========================================================
# === 2. CONSTRUCCIÓN DE LA INTERFAZ ESTÁTICA Y PLACEHOLDERS ===
# =========================================================

st.title("☕ Asistente de Recomendación Facial")
st.markdown("---")

col_camara, col_recomendacion = st.columns([2, 1])

# --- Columna 1: Cámara y Control ---
with col_camara:
    st.subheader("Análisis en Tiempo Real")
    video_placeholder = st.empty()
    
    button_label = "Detener Cámara" if st.session_state.running else "Iniciar Cámara"
    st.button(button_label, on_click=start_stop)

# --- Columna 2: Resultados y Recomendación (Placeholders ÚNICOS) ---
with col_recomendacion:
    st.subheader("Resultados del Análisis CNN")
    emotion_columns = st.columns(7) # Para 6 emociones

    emotion_placeholders = {}
    
    emotions_map = ['disgusto', 'enojo', 'feliz', 'neutral', 'sorpresa', 'temor', 'triste']
    emojis = {'disgusto': '🤢', 'enojo': '😠', 'feliz': '😁', 'neutral': '😐', 'sorpresa': '😮', 'temor': '😨', 'triste': '😔'}
    
    # Renderizamos los elementos estáticos (emoji, label) y creamos el placeholder para el %
    for i, emotion in enumerate(emotions_map):
        with emotion_columns[i]:
            emotion_placeholders[emotion] = {
                "percent": st.empty(), # Este placeholder contendrá el cuadro del porcentaje
            }
            # Elementos estáticos de texto/emoji que no cambian en el bucle
            st.markdown(
                f"<p style='text-align: center; font-size: 24px;'>{emojis.get(emotion, '❓')}</p>", 
                unsafe_allow_html=True
            )
            st.caption(
                f"<p style='text-align: center; margin: -10px 0;'>{emotion}</p>", 
                unsafe_allow_html=True
            )
    
    # Placeholders para la recomendación
    st.markdown("---")
    recommendation_title = st.empty()
    recommendation_image = st.empty()
    recommendation_box = st.empty()

# Placeholders para la descripción
st.markdown("---")
st.markdown("### 📝 Detalle de la Recomendación")
description_placeholder = st.empty()


# =========================================================
# === 3. FUNCIÓN DE ACTUALIZACIÓN DEL PANEL DE RESULTADOS ===
# =========================================================

def update_results_panel(emotion_probs, current_cafe, current_desc, is_face_detected):
    """Actualiza todos los placeholders del panel de resultados."""
    
    emotions_map = ['disgusto', 'enojo', 'feliz', 'neutral', 'sorpresa', 'temor', 'triste']
    
    if is_face_detected:
        
        # 3.1. Actualizar Porcentajes
        for emotion in emotions_map:
            prob_value = emotion_probs.get(emotion, 0.0)
            
            # Actualizamos SOLO el contenido del recuadro de porcentaje (SOLUCIÓN AL ERROR DEL %)
            emotion_placeholders[emotion]["percent"].markdown(
                f"""
                <div style='border: 1px solid #000; padding: 5px; margin: 5px 0; text-align: center; background-color: {'#87C15A' if prob_value > 0.5 else '#F0AB3E'}; border-radius: 4px; font-weight: bold;'>
                    {prob_value:.1%}
                </div>
                """, 
                unsafe_allow_html=True
            )

        # 3.2. Actualizar Recomendación
        recommendation_title.markdown("### Recomendación Perfecta:")
        imagen_cafe = "https://placehold.co/300x200/402808/FFFFFF?text=Tu+Recomendaci%C3%B3n"
        recommendation_image.image(imagen_cafe, caption=current_cafe, use_column_width=True)
        recommendation_box.markdown(
            f"""
            <div style='background-color: #FFEEAA; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold; margin-top: -15px;'>
                {current_cafe}
            </div>
            """, 
            unsafe_allow_html=True
        )
        
        # 3.3. Actualizar Descripción Larga
        description_placeholder.markdown(f"""
        **Producto Recomendado:** **{current_cafe}**

        **Análisis:** {current_desc}

        *Detalles de la Predicción (Simulado):* {", ".join([f"{k}: {v:.1%}" for k, v in emotion_probs.items()])}
        """)
        
    else:
        # Estado cuando no se detecta rostro
        for emotion in emotions_map:
            emotion_placeholders[emotion]["percent"].markdown(
                f"""
                <div style='border: 1px solid #000; padding: 5px; margin: 5px 0; text-align: center; background-color: #F6DE36; border-radius: 4px;'>
                    0.0%
                </div>
                """, 
                unsafe_allow_html=True
            )
        recommendation_title.markdown("### Recomendación Perfecta:")
        recommendation_image.image("https://placehold.co/300x200/999999/FFFFFF?text=Esperando+Rostro", caption="Esperando Análisis", use_column_width=True)
        recommendation_box.markdown(
            f"""
            <div style='background-color: #AAAAAA; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold; margin-top: -15px;'>
                Aproxima tu rostro a la cámara
            </div>
            """, 
            unsafe_allow_html=True
        )
        description_placeholder.markdown("No se detecta un rostro. Por favor, acérquese a la cámara para iniciar el análisis.")


# =========================================================
# === 4. BUCLE PRINCIPAL DE CÁMARA ===
# =========================================================

if st.session_state.running:
    
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    # Carga del clasificador de rostros (necesario para la simulación)
    face_detector = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    
    if not cap.isOpened():
        st.error("Error: No se pudo abrir la cámara. Asegúrate de que no esté siendo usada por otra aplicación.")
        st.session_state.running = False
        update_results_panel({}, "", "", False) # Limpiar resultados
    
    while st.session_state.running:
        ret, frame = cap.read()
        if not ret:
            time.sleep(0.1)
            continue
        
        frame = cv2.flip(frame, 1) # Efecto espejo
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_detector.detectMultiScale(gray, 1.1, 4)
        
        emotion_probs = {}
        current_cafe = "Analizando..."
        current_desc = "Esperando la detección de un rostro."
        face_detected = len(faces) > 0
        
        if face_detected:
            # Dibuja un rectángulo alrededor del rostro detectado
            (x, y, w, h) = faces[0]
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            
            # SIMULACIÓN DE LA PREDICCIÓN
            emotion_probs, current_cafe, current_desc = get_mock_prediction(frame)
        
        # Mostrar el frame
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        video_placeholder.image(frame_rgb, channels="RGB", use_column_width=True)

        # Actualizar la Columna de Recomendación
        update_results_panel(emotion_probs, current_cafe, current_desc, face_detected)
        
        time.sleep(0.05) # Pequeña pausa para reducir la carga de CPU

    # Limpieza final al salir del bucle
    cap.release()
    cv2.destroyAllWindows()
    video_placeholder.empty()
    
    # Mostramos el placeholder estático al detener la cámara
    with video_placeholder.container():
        st.markdown(
            """
            <div style="border: 4px solid black; padding: 10px; border-radius: 8px; background-color: #f0f2f6;">
                <p style="text-align: center; color: #555;">[Cámara Detenida]</p>
                <img src="https://placehold.co/700x400/CCCCCC/000000?text=Cámara+Detenida" 
                     alt="Placeholder de Cámara" 
                     style="width: 100%; height: auto; border-radius: 4px;">
            </div>
            """, 
            unsafe_allow_html=True
        )
# Este bloque se ejecuta si la cámara está apagada (estado inicial o detenido)
else:
    # Mostramos el estado inicial de la interfaz
    update_results_panel({}, "", "", False)
    
    with col_camara:
        video_placeholder.markdown(
            """
            <div style="border: 4px solid black; padding: 10px; border-radius: 8px; background-color: #f0f2f6;">
                <p style="text-align: center; color: #555;">[Cámara Desactivada]</p>
                <img src="https://placehold.co/700x400/CCCCCC/000000?text=Presiona+'Iniciar+Cámara'" 
                     alt="Placeholder de Cámara" 
                     style="width: 100%; height: auto; border-radius: 4px;">
            </div>
            """, 
            unsafe_allow_html=True
        )

st.caption("Recuerda ejecutar con el comando correcto: `python -m streamlit run backend/app.py`")