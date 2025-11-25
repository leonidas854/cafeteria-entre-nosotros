import cv2
import os
import imutils

dataPath = r'C:\Users\foonky\OneDrive\Documentos\Cafeteria\iot_ia\backend\data\test'
emotionName = 'triste'  

# =========================================================
emotionPath = os.path.join(dataPath, emotionName)
if not os.path.exists(emotionPath):
    print('Carpeta de emoción creada: ', emotionPath)
    os.makedirs(emotionPath)

current_files = [f for f in os.listdir(emotionPath) if f.endswith('.jpg')]
count = len(current_files)
initial_count = count

print(f"La carpeta '{emotionName}' ya contiene {count} imágenes. "
      f"Las nuevas imágenes comenzarán a guardarse a partir del índice {count}.")

# =========================================================
cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
faceClassif = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

MAX_SAMPLES = initial_count + 100
print(f"--- Iniciando captura: {emotionName} ---")
print(f"--- El nuevo límite de captura es hasta el índice {MAX_SAMPLES} ---")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = imutils.resize(frame, width=320)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    auxFrame = frame.copy()
    faces = faceClassif.detectMultiScale(gray, 1.3, 5)

    for (x, y, w, h) in faces:
        rostro = auxFrame[y:y+h, x:x+w]
        rostro_resized = cv2.resize(rostro, (224, 224), interpolation=cv2.INTER_CUBIC)

        cv2.imwrite(os.path.join(emotionPath, f'rostro_{emotionName}_{count}.jpg'), rostro_resized)
        count += 1

        cv2.rectangle(frame, (x, y), (x+w, y+h), (0,255,0), 2)
        cv2.putText(frame, f"{emotionName}: {count}/{MAX_SAMPLES}", (10,20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,255,255), 2)

        # --- Este break ahora SÍ funciona ---
        if count >= MAX_SAMPLES:
            break

    cv2.imshow('Captura de Datos', frame)
    if cv2.waitKey(1) == 27:
        break
    if count >= MAX_SAMPLES:
        break

cap.release()
cv2.destroyAllWindows()

print(f"Captura finalizada. Se guardaron {count - initial_count} nuevas imágenes.")
