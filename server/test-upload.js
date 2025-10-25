const fs = require('fs');
const http = require('http');
const https = require('https');
const FormData = require('form-data');

// Configurar datos de login
const loginPayload = JSON.stringify({
    numero_colegiado: "12345",
    dpi: "1234567890132",
    fecha_nacimiento: "2000-01-01",
    password: "Q12345678!"
});

// Hacer login primero
const loginOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginPayload)
    }
};

const loginReq = http.request(loginOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const loginRes = JSON.parse(data);
            const token = loginRes.token;
            console.log('✅ Login exitoso');
            console.log(`Token: ${token.substring(0, 50)}...`);

            // Ahora subir la imagen
            const imagePath = process.env.TEMP ? `${process.env.TEMP}\\test.png` : '/tmp/test.png';
            console.log(`Buscando imagen en: ${imagePath}`);
            
            if (!fs.existsSync(imagePath)) {
                console.error('❌ Archivo de imagen no encontrado');
                process.exit(1);
            }

            const form = new FormData();
            form.append('avatar', fs.createReadStream(imagePath));

            const uploadOptions = {
                hostname: 'localhost',
                port: 5000,
                path: '/api/profiles/me/avatar',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...form.getHeaders()
                }
            };

            const uploadReq = http.request(uploadOptions, (res) => {
                let uploadData = '';
                res.on('data', (chunk) => { uploadData += chunk; });
                res.on('end', () => {
                    console.log(`\n📤 Response Status: ${res.statusCode}`);
                    console.log('📋 Response:', uploadData);
                    process.exit(0);
                });
            });

            uploadReq.on('error', (e) => {
                console.error('❌ Upload Error:', e);
                process.exit(1);
            });

            form.pipe(uploadReq);
        } catch (e) {
            console.error('❌ Login Error:', e.message);
            process.exit(1);
        }
    });
});

loginReq.on('error', (e) => {
    console.error('❌ Login Request Error:', e);
    process.exit(1);
});

loginReq.write(loginPayload);
loginReq.end();
