from django.apps import AppConfig






class SensoresConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.sensores'

    
    def ready(self):
        print("--- App 'sensores' está lista ---")

        from .mqtt_service import mqtt_service
        mqtt_service.start()