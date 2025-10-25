#!/bin/bash

# ========================================
# GUÍA DE IMPLEMENTACIÓN DE ESTILOS SCSS
# ========================================

# Este archivo documenta cómo aplicar los estilos SCSS
# a los componentes React existentes

echo "========================================
GUÍA DE IMPLEMENTACIÓN DE ESTILOS
========================================"

# ========================================
# 1. COMPONENTS QUE NECESITAN ESTILOS
# ========================================

cat << 'EOF'

📋 COMPONENTES POR ACTUALIZAR

1. Navbar.tsx
   └─ Archivo de estilos: Navbar.scss
   └─ Clases: .navbar-custom, .nav-link, .brand-logo

2. LoginPage.tsx
   └─ Archivo de estilos: LoginPage.scss (YA CREADO)
   └─ Clases: .login-container, .login-card, .login-form

3. RegisterPage.tsx
   └─ Archivo de estilos: RegisterPage.scss (YA CREADO)
   └─ Clases: .register-container, .register-card

4. AdminPanel.tsx
   └─ Archivo de estilos: AdminPanel.scss
   └─ Clases: .admin-dashboard, .admin-header, .admin-content

5. VoterDashboard.tsx
   └─ Archivo de estilos: VoterDashboard.scss
   └─ Clases: .voter-dashboard, .campaigns-section

6. ProfilePage.tsx
   └─ Archivo de estilos: ProfilePage.scss
   └─ Clases: .profile-container, .profile-form

7. CampaignDetailPage.tsx
   └─ Archivo de estilos: CampaignDetailPage.scss
   └─ Clases: .campaign-detail, .voting-section

8. CreateAdminPage.tsx
   └─ Archivo de estilos: CreateAdminPage.scss
   └─ Clases: .create-admin-container

EOF

# ========================================
# 2. ESTRUCTURA DE ARCHIVOS
# ========================================

cat << 'EOF'

📁 ESTRUCTURA RECOMENDADA

client/src/
├── styles/
│   ├── _variables.scss              ✓ Creado
│   ├── pages/
│   │   ├── LoginPage.scss           ✓ Creado
│   │   ├── RegisterPage.scss        ✓ Creado
│   │   ├── AdminPanel.scss          ⏳ Por crear
│   │   ├── VoterDashboard.scss      ⏳ Por crear
│   │   ├── ProfilePage.scss         ⏳ Por crear
│   │   └── CampaignDetailPage.scss  ⏳ Por crear
│   ├── components/
│   │   ├── Navbar.scss              ⏳ Por crear
│   │   ├── CreateAdminPage.scss     ⏳ Por crear
│   │   └── ...
│   ├── index.scss                   ✓ Creado
│   └── DESIGN_SYSTEM.md             ✓ Creado
├── components/
│   ├── Navbar.tsx
│   └── ...
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── AdminPanel.tsx
│   ├── VoterDashboard.tsx
│   ├── ProfilePage.tsx
│   ├── CampaignDetailPage.tsx
│   └── CreateAdminPage.tsx
├── index.scss                       ✓ Creado
├── App.scss                         ✓ Creado
└── index.tsx                        ✓ Actualizado

EOF

# ========================================
# 3. EJEMPLO: CÓMO USAR EN UN COMPONENTE
# ========================================

cat << 'EOF'

💡 EJEMPLO DE IMPLEMENTACIÓN

Archivo: client/src/pages/LoginPage.tsx

import React, { useState } from 'react';
import '../styles/pages/LoginPage.scss';  // ← Importar estilos

export const LoginPage = () => {
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Iniciar Sesión</h1>
        </div>
        <div className="login-body">
          <form className="login-form">
            <div className="form-group">
              <label>Usuario</label>
              <input type="text" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

EOF

# ========================================
# 4. CLASES DISPONIBLES
# ========================================

cat << 'EOF'

🎨 CLASES DISPONIBLES DEL SISTEMA

BOTONES:
  .btn .btn-primary     → Botón azul oscuro
  .btn .btn-gold        → Botón dorado
  .btn .btn-outline     → Botón contorno

CARDS:
  .card                 → Card base
  .card-header          → Header con gradiente
  .card-body            → Contenido
  .card-footer          → Pie de página

FORMULARIOS:
  .form-group           → Contenedor de campo
  input/textarea        → Inputs estilizados
  .form-hint            → Texto de ayuda
  .form-error           → Error message

ESTADÍSTICAS:
  .dashboard-grid       → Grid responsive
  .stats-card           → Card de estadística
  .stat-label           → Label
  .stat-value           → Valor grande
  .stat-detail          → Detalle

SECCIONES:
  .section-header       → Header con gradiente
  .form-section         → Sección de formulario
  .profile-header       → Header de perfil

TABLAS:
  .data-table           → Tabla profesional
  .status-badge         → Badge de estado

ALERTAS:
  .alert                → Base
  .alert-success        → Verde
  .alert-danger         → Rojo
  .alert-warning        → Naranja
  .alert-info           → Azul

UTILIDADES:
  .text-primary         → Texto azul oscuro
  .text-gold            → Texto dorado
  .text-success         → Texto verde
  .text-danger          → Texto rojo
  .bg-primary           → Fondo azul
  .bg-light             → Fondo gris claro
  .shadow               → Sombra media
  .shadow-lg            → Sombra grande

EOF

# ========================================
# 5. COLORES DISPONIBLES VIA SCSS
# ========================================

cat << 'EOF'

🎨 VARIABLES DE COLOR (SCSS)

PRIMARIOS:
  $primary-dark         → #001a4d (Azul principal)
  $primary-navy         → #002b7a (Azul marino)
  $primary-gold         → #F4A500 (Dorado)
  $primary-gold-light   → #FFB700 (Dorado claro)
  $primary-gold-dark    → #D48800 (Dorado oscuro)

SECUNDARIOS:
  $secondary-blue       → #1f3a93
  $secondary-light      → #e8f0ff
  $secondary-border     → #d0dff0

ESTADOS:
  $success              → #27ae60 (Verde)
  $warning              → #f39c12 (Naranja)
  $danger               → #e74c3c (Rojo)
  $info                 → #3498db (Azul info)

NEUTROS:
  $white                → #ffffff
  $light-gray           → #f8f9fa
  $gray                 → #7f8c8d
  $dark-gray            → #34495e
  $black                → #2c3e50

EOF

# ========================================
# 6. PROCESO DE MIGRACIÓN
# ========================================

cat << 'EOF'

📋 PROCESO RECOMENDADO

1. VERIFICAR IMPORTS
   ✓ Asegurar que index.tsx importa:
     - 'bootstrap/dist/css/bootstrap.min.css'
     - './index.scss'
     - './App.scss'

2. POR CADA COMPONENTE:
   a) Crear archivo .scss correspondiente
   b) Importar en el componente TSX
   c) Reemplazar clases Bootstrap con clases personalizadas
   d) Probar responsive en diferentes tamaños
   e) Validar colores y espaciado

3. TESTING
   - Verificar en desktop (1920px)
   - Verificar en tablet (768px)
   - Verificar en mobile (375px)
   - Probar hover/focus states
   - Validar colores y contraste

4. DEPLOYMENT
   - Compilar SCSS a CSS
   - Minificar
   - Optimizar fuentes
   - Comprimir imágenes

EOF

# ========================================
# 7. BREAKPOINTS
# ========================================

cat << 'EOF'

📱 MEDIA QUERIES

Usar en SCSS:

@media (max-width: $breakpoint-sm) {   // ≤ 576px
  // Estilos mobile
}

@media (max-width: $breakpoint-md) {   // ≤ 768px
  // Estilos tablet
}

@media (max-width: $breakpoint-lg) {   // ≤ 992px
  // Estilos laptop pequeña
}

@media (min-width: $breakpoint-lg) {   // ≥ 992px
  // Estilos desktop
}

EOF

# ========================================
# 8. GRADIENTES LISTOS
# ========================================

cat << 'EOF'

🎨 GRADIENTES PREDEFINIDOS

Usar en SCSS:

// Gradiente primario (Azul)
background: linear-gradient(135deg, $primary-dark 0%, $primary-navy 100%);

// Gradiente dorado
background: linear-gradient(135deg, $primary-gold 0%, $primary-gold-dark 100%);

// Gradiente claro
background: linear-gradient(135deg, $secondary-light 0%, $white 100%);

EOF

echo "
========================================
✅ SISTEMA LISTO PARA USAR
========================================"
