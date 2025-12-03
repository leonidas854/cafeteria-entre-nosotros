# apps/usuario/mqtt_service.py

import paho.mqtt.client as mqtt
import json
from django.conf import settings
import firebase_admin
from firebase_admin import credentials, firestore, db

from firebase.firebase_init import rtdb_ref


AMBIENTE_TOPIC = "esp32/sensor"

class MQTTService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MQTTService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self.last_temperatura = None
        self.last_humedad = None

        self.BROKER = settings.BROKER_HOST
        self.PORT = int(settings.BROKER_PORT)
        
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("Conectado al Broker MQTT exitosamente.")
            client.unsubscribe(AMBIENTE_TOPIC)
            client.subscribe(AMBIENTE_TOPIC)
            print(f"✅ Suscrito al tópico: {AMBIENTE_TOPIC}")
        else:
            print(f"❌ Fallo al conectar al Broker MQTT, código de error: {rc}")

    def on_message(self, client, userdata, msg):
        print(f"📩 Mensaje recibido en el tópico '{msg.topic}'")
        
        try:
            payload = json.loads(msg.payload.decode('utf-8'))

            temperatura = payload.get("Temperatura")
            humedad = payload.get("Humedad")

            if temperatura is not None:
                if temperatura != self.last_temperatura:
                    print(f"  🌡️ CAMBIO DETECTADO: Temperatura cambió de {self.last_temperatura}°C a {temperatura}°C. Guardando...")
                    self.save_to_rtdb('temperatura', temperatura)
                    self.last_temperatura = temperatura
                else:
                    print(f"  🌡️ Temperatura sin cambios ({temperatura}°C). No se guarda.")

            if humedad is not None:
                if humedad != self.last_humedad:
                    print(f"  💧 CAMBIO DETECTADO: Humedad cambió de {self.last_humedad}% a {humedad}%. Guardando...")
                    self.save_to_rtdb('humedad', humedad)
                    self.last_humedad = humedad
                else:
                    print(f"  💧 Humedad sin cambios ({humedad}%). No se guarda.")
        except Exception as e:
            print(f"  ❌ Ocurrió un error inesperado al procesar el mensaje: {e}")

        except json.JSONDecodeError:
            print(f"  ❌ Error: No se pudo decodificar el payload a JSON. Payload crudo: {msg.payload.decode('utf-8')}")
        except Exception as e:
            print(f"  ❌ Ocurrió un error inesperado al procesar el mensaje: {e}")
           
    def save_to_rtdb(self, sensor_type, value):
        try:
            
            ref = rtdb_ref.child(f'sensores/{sensor_type}')
            ref.push(value)
            print(f"    ✅ Dato de {sensor_type} guardado en RTDB.")
        except Exception as e:
            print(f"    ❌ Error al guardar {sensor_type} en Firebase: {e}")     
    
    
    def start(self):
        print("Iniciando servicio MQTT...")
        try:
            self.client.connect(self.BROKER, self.PORT, 60)
            self.client.loop_start() 
            self._loop_started = True
            print(f"Loop de MQTT iniciado en segundo plano. Conectando a {self.BROKER}:{self.PORT}")
        except Exception as e:
            print(f"❌ No se pudo conectar al Broker MQTT: {e}")

    def publish(self, topic, payload):
        if not self.client.is_connected():
            print("⚠️ Cliente MQTT no conectado. Intentando reconectar...")
            
            try:
                self.client.reconnect()
            except Exception as e:
                print(f"❌ Fallo en la reconexión: {e}")
                return

       
        json_payload = json.dumps(payload)
        result = self.client.publish(topic, json_payload)
      
        if result[0] == 0:
            print(f"✅ Mensaje publicado exitosamente en el tópico '{topic}': {json_payload}")
        else:
            print(f"❌ Fallo al publicar mensaje en el tópico '{topic}'")

mqtt_service = MQTTService()