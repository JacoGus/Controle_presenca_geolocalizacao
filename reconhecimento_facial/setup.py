"""
Script de configuração para o Sistema de Reconhecimento Facial
"""

import subprocess
import sys
import os

def install_requirements():
    """Instala as dependências necessárias"""
    print("Instalando dependências...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependências instaladas com sucesso!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao instalar dependências: {e}")
        return False

def check_webcam():
    """Verifica se a webcam está disponível"""
    try:
        import cv2
        cap = cv2.VideoCapture(0)
        if cap.isOpened():
            print("✅ Webcam detectada e funcionando!")
            cap.release()
            return True
        else:
            print("❌ Webcam não detectada ou não está funcionando")
            return False
    except ImportError:
        print("❌ OpenCV não instalado")
        return False

def create_directories():
    """Cria diretórios necessários"""
    directories = ['training_data']
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"✅ Diretório '{directory}' criado")

def main():
    """Função principal de configuração"""
    print("=== Configuração do Sistema de Reconhecimento Facial ===\n")
    
    # Instalar dependências
    if not install_requirements():
        print("Falha na instalação das dependências. Verifique sua conexão com a internet.")
        return
    
    print()
    
    # Criar diretórios
    create_directories()
    print()
    
    # Verificar webcam
    if check_webcam():
        print("\n🎉 Configuração concluída com sucesso!")
        print("\nPara usar o sistema:")
        print("1. Interface gráfica: python face_recognition_system.py --gui")
        print("2. Linha de comando: python face_recognition_system.py")
    else:
        print("\n⚠️  Configuração concluída, mas webcam não foi detectada.")
        print("Verifique se sua webcam está conectada e funcionando.")

if __name__ == "__main__":
    main()
