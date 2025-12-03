import os
import firebase_admin
from firebase_admin import credentials, firestore
from django.conf import settings
from firebase_admin import credentials, firestore, db
# Ruta al archivo JSON que descargaste
FIREBASE_CRED_PATH = os.path.join(settings.BASE_DIR, 'firebase', 'proyectoiot-70272-firebase-adminsdk-fbsvc-169c61e874.json')

# Inicializar Firebase
firestore_db = None
rtdb_ref = None

try:
    cred = credentials.Certificate(FIREBASE_CRED_PATH)
    #firebase_admin.initialize_app(cred)
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://proyectoiot-70272-default-rtdb.firebaseio.com/'
    })
    firestore_db = firestore.client()
    rtdb_ref = db.reference() 
    print("✅ Firebase inicializado correctamente")
    
except Exception as e:
    print(f"❌ Error inicializando Firebase: {e}")
    firestore_db = None
    
def get_user_doc(uid):
    if firestore_db is None:
        raise Exception("Firebase no inicializado. Revisa la ruta del JSON.")
    return firestore_db.collection('usuarios').document(uid)