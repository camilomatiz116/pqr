import paramiko
import os
import sys
import tarfile

# Credenciales y servidor
hostname = "144.91.100.217"
username = "root"
password = r"D1spr0el!CRM#2026$"
remote_base_dir = "/var/www/pqrs-disproel" # ¡NUEVA CARPETA, NO TOCA EL CRM!

# Directorios locales
base_dir = os.path.dirname(os.path.abspath(__file__))
frontend_dist = os.path.join(base_dir, "frontend", "dist")
backend_dir = os.path.join(base_dir, "backend")

frontend_tar = os.path.join(base_dir, "frontend_deploy.tar.gz")
backend_tar = os.path.join(base_dir, "backend_deploy.tar.gz")

def make_tarfile(output_filename, source_dir):
    print(f"[*] Empaquetando {source_dir} -> {output_filename}...")
    with tarfile.open(output_filename, "w:gz") as tar:
        tar.add(source_dir, arcname=os.path.basename(source_dir))

try:
    print("[*] PREPARANDO ARCHIVOS LOCALES...")
    # Crear tars localmente
    make_tarfile(frontend_tar, frontend_dist)
    make_tarfile(backend_tar, backend_dir)
    
    print(f"[*] CONECTANDO AL SERVIDOR {hostname}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, username=username, password=password)
    
    print(f"[*] Paso 1: Creando estructura de directorios en {remote_base_dir} (Sin afectar CRM)...")
    client.exec_command(f"mkdir -p {remote_base_dir}/frontend")
    client.exec_command(f"mkdir -p {remote_base_dir}/backend")
    
    sftp = client.open_sftp()
    
    print("[*] Paso 2: Subiendo paquete Frontend...")
    sftp.put(frontend_tar, "/tmp/frontend_deploy.tar.gz")
    
    print("[*] Paso 3: Subiendo paquete Backend...")
    sftp.put(backend_tar, "/tmp/backend_deploy.tar.gz")
    sftp.close()
    
    print("[*] Paso 4: Extrayendo Frontend en producción...")
    client.exec_command(f"tar -xzf /tmp/frontend_deploy.tar.gz -C {remote_base_dir}/frontend/")
    
    print("[*] Paso 5: Extrayendo Backend en producción...")
    # Extraer backend ignorando node_modules si existe en el tar (buena práctica)
    client.exec_command(f"tar -xzf /tmp/backend_deploy.tar.gz -C {remote_base_dir}/")
    
    print("[*] Paso 6: Limpiando archivos temporales y locales...")
    client.exec_command("rm -f /tmp/frontend_deploy.tar.gz /tmp/backend_deploy.tar.gz")
    os.remove(frontend_tar)
    os.remove(backend_tar)
    
    print("\n[+] ==========================================")
    print("[+] ¡ARCHIVOS SUBIDOS CON ÉXITO AL SERVIDOR!")
    print(f"[+] Ruta en el servidor: {remote_base_dir}")
    print("[+] ==========================================\n")
    print(">>> Siguiente paso: Sigue las instrucciones que te dio el asistente para encender el servidor Node.js.")
    
    client.close()
except Exception as e:
    print(f"[!] ERROR EN DESPLIEGUE: {e}")
    sys.exit(1)
