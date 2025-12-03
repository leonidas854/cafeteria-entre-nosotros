from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
import paho.mqtt.client as mqtt
import json
import time
import threading
import random  

app = FastAPI(
    title="MQTT API",
    description="API para enviar comandos a ESP32 vía MQTT",
    version="1.0"
)


BROKER = "192.168.1.17"
PORT = 1883
TOPIC_VALVULA = "esp32/valvula"
TOPIC_SENSOR = "esp32/sensor"  

mqtt_client = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    print("Conectado MQTT:", rc)

mqtt_client.on_connect = on_connect
mqtt_client.connect(BROKER, PORT, 60)
mqtt_client.loop_start()


class Valvula(BaseModel):
    valvula_id: int
    ml: int

@app.post("/enviar")
#async def enviar(valvula: Valvula):
 #   mensaje = {
  #      "valvula_id": valvula.valvula_id,
   #     "ml": valvula.ml
    #}
    #mqtt_client.publish(TOPIC_VALVULA, json.dumps(mensaje))
    #return mensaje


def publicar_sensores():
    while True:
        mensaje = {
            "Temperatura": random.randint(20, 35),
            "Humedad": random.randint(40, 100)
        }
        mqtt_client.publish(TOPIC_SENSOR, json.dumps(mensaje))
        print("Publicado en", TOPIC_SENSOR, ":", mensaje)
        time.sleep(15)

threading.Thread(target=publicar_sensores, daemon=True).start()
