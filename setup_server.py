import paramiko
import sys

hostname = "144.91.100.217"
username = "root"
password = r"D1spr0el!CRM#2026$"
domain = "pqrs.disproel.com"
email = "sistemas@disproel.com"

nginx_config = f"""server {{
    listen 80;
    server_name {domain};

    root /var/www/pqrs-disproel/frontend/dist;
    index index.html;

    location / {{
        try_files $uri $uri/ /index.html;
    }}

    location /api/ {{
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }}
}}
"""

try:
    print(f"[*] Conectando a {hostname} para configuración remota...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, username=username, password=password)
    
    def run_cmd(cmd):
        print(f"> {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        exit_status = stdout.channel.recv_exit_status()
        out = stdout.read().decode('utf-8', errors='replace').strip()
        err = stderr.read().decode('utf-8', errors='replace').strip()
        if out: print(out.encode('cp1252', errors='replace').decode('cp1252'))
        if err: print(err.encode('cp1252', errors='replace').decode('cp1252'))
        return exit_status
        
    print("\n[*] Paso 1: Configurando Backend (Node.js & PM2)...")
    run_cmd("cd /var/www/pqrs-disproel/backend && npm install --production")
    run_cmd("npm install -g pm2")
    run_cmd("pm2 delete pqrs-backend || true") # Eliminar si ya existía para evitar conflictos
    run_cmd("cd /var/www/pqrs-disproel/backend && PORT=5001 pm2 start server.js --name 'pqrs-backend'")
    run_cmd("pm2 save")

    print("\n[*] Paso 2: Creando configuración de Nginx...")
    # Escribir archivo nginx remotamente
    sftp = client.open_sftp()
    with sftp.file('/etc/nginx/sites-available/pqrs', 'w') as f:
        f.write(nginx_config)
    sftp.close()
    
    run_cmd("ln -sf /etc/nginx/sites-available/pqrs /etc/nginx/sites-enabled/")
    run_cmd("systemctl restart nginx")
    
    print("\n[*] Paso 3: Instalando y configurando SSL (Certbot)...")
    run_cmd("apt-get update && apt-get install -y python3-certbot-nginx")
    # Certbot interactúa con Nginx y genera el SSL si los DNS ya apuntan aquí
    cert_status = run_cmd(f"certbot --nginx -d {domain} --non-interactive --agree-tos -m {email} --redirect")
    
    if cert_status == 0:
        print("\n[+] ==================================================")
        print(f"[+] ¡ÉXITO! Tu sistema está vivo en: https://{domain}")
        print("[+] ==================================================")
    else:
        print("\n[!] El SSL falló. Posiblemente los DNS de cPanel aún no propagan a la IP.")
        print("[!] De todas formas, tu página ya es accesible por HTTP.")
        
    client.close()
except Exception as e:
    print(f"[!] Error: {e}")
    sys.exit(1)
