import torch
import torch.nn as nn
from torchvision import models
# --- Configuración de Parámetros ---
# Reconocimiento de Emociones: Se asume un estándar de 7 emociones (e.g., Happy, Sad, Angry, etc.)
NUM_CLASSES_EMOTIONS = 7 
INPUT_SIZE = 224

class PyTorchFaceEmotionRecognizer(nn.Module):
    """
    Modelo para Reconocimiento de Emociones Faciales usando Transfer Learning con ResNet50.
    """
    def __init__(self, num_classes=NUM_CLASSES_EMOTIONS):
        super(PyTorchFaceEmotionRecognizer, self).__init__()
        
        self.num_classes = num_classes
        
        # 1. Cargar el modelo base pre-entrenado
        # Esta es la forma estándar de cargar pesos de ImageNet compatibles con PyTorch.
        self.base_model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
        
        print("Modelo ResNet50 pre-entrenado cargado con pesos de ImageNet.")

        # 2. Congelar los parámetros (Transfer Learning)
        # El conocimiento de ImageNet (detección de bordes, texturas) se mantiene intacto.
        for param in self.base_model.parameters():
            param.requires_grad = False
            
        # 3. Obtener el número de características de la capa densa original
        num_ftrs = self.base_model.fc.in_features
        
        # 4. Reemplazar la capa Fully Connected (fc) para la nueva tarea: Clasificación de Emociones
        self.base_model.fc = nn.Sequential(
            nn.Linear(num_ftrs, 512), 
            nn.ReLU(),
            nn.Dropout(0.5),           
            # La capa de salida debe tener 'NUM_CLASSES_EMOTIONS' neuronas
            nn.Linear(512, self.num_classes) 
        )

    def forward(self, x):
        """
        Define el pase hacia adelante (forward pass) del modelo.
        """
        return self.base_model(x)

# ----------------------------------------------------
## USO DE LA CLASE
# ----------------------------------------------------

# Inicializar el modelo con el número de clases de emociones
emotion_model_pt = PyTorchFaceEmotionRecognizer(num_classes=NUM_CLASSES_EMOTIONS)

# Mover el modelo a la GPU si está disponible
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
emotion_model_pt.to(device)

print(f"\nModelo movido a: {device}")

print("\n--- Arquitectura del Modelo Final ---")
# Solo mostramos las últimas capas para ver la modificación
print(emotion_model_pt.base_model.fc)