# 🎨 Sistema de Diseño - Proyecto Votaciones SIA

## 📋 Descripción General

Sistema de diseño profesional y moderno basado en los colores corporativos del SIA (Colegio de Ingenieros de Guatemala). Implementado con SCSS/SASS para máxima personalización y mantenibilidad.

---

## 🎯 Paleta de Colores

### Colores Primarios
- **Azul Oscuro (Primary Dark)**: `#001a4d` - Fondo principal, headings, textos importantes
- **Azul Marino (Primary Navy)**: `#002b7a` - Variación más oscura para gradientes
- **Dorado/Naranja (Primary Gold)**: `#F4A500` - Acentos, CTA, highlights
- **Dorado Claro**: `#FFB700` - Hover states, variaciones
- **Dorado Oscuro**: `#D48800` - Estados activos

### Colores Secundarios
- **Azul Profesional**: `#1f3a93` - Elementos secundarios
- **Azul Muy Claro**: `#e8f0ff` - Backgrounds suaves
- **Azul para Bordes**: `#d0dff0` - Divisiones, bordes

### Colores de Estado
- **Éxito (Verde)**: `#27ae60` - Confirmaciones, acciones exitosas
- **Advertencia (Naranja)**: `#f39c12` - Alertas, estados pendientes
- **Peligro (Rojo)**: `#e74c3c` - Errores, confirmaciones críticas
- **Información (Azul)**: `#3498db` - Información general

### Escala de Grises
- **Blanco**: `#ffffff`
- **Gris Muy Claro**: `#f8f9fa` - Backgrounds alternativos
- **Gris Claro**: `#ecf0f1` - Bordes, divisiones
- **Gris**: `#7f8c8d` - Textos secundarios
- **Gris Oscuro**: `#34495e` - Textos terciarios
- **Negro**: `#2c3e50` - Textos principales

---

## 📐 Tipografía

### Familia de Fuentes
- **Base**: `Segoe UI, Tahoma, Geneva, Verdana, sans-serif`
- **Headings**: `Segoe UI, Tahoma, Geneva, Verdana, sans-serif` (misma familia)

### Tamaños
```scss
$fs-xs: 0.75rem;    // 12px - Labels pequeños
$fs-sm: 0.875rem;   // 14px - Textos secundarios
$fs-base: 1rem;     // 16px - Texto principal
$fs-lg: 1.125rem;   // 18px - Subtítulos
$fs-xl: 1.25rem;    // 20px - Headings pequeños
$fs-2xl: 1.5rem;    // 24px - Headings medianos
$fs-3xl: 1.875rem;  // 30px - Headings grandes
$fs-4xl: 2.25rem;   // 36px - Headings principales
```

### Pesos
- **Light**: `300` - Textos decorativos
- **Regular**: `400` - Textos normales
- **Medium**: `500` - Énfasis suave
- **Semibold**: `600` - Énfasis moderado
- **Bold**: `700` - Énfasis fuerte

### Alturas de Línea
- **Tight**: `1.2` - Headings, títulos
- **Normal**: `1.5` - Textos normales
- **Relaxed**: `1.75` - Textos largos, párrafos

---

## 🎁 Espaciado

Sistema de espaciado basado en unidades de 8px:

```scss
$xs: 4px
$sm: 8px
$md: 12px
$lg: 16px
$xl: 20px
$spacing-2xl: 24px
$spacing-3xl: 32px
$spacing-4xl: 40px
```

---

## 🔲 Border Radius

```scss
$radius-sm: 4px      // Elementos pequeños
$radius-md: 8px      // Elementos medianos
$radius-lg: 12px     // Cards, modales
$radius-xl: 16px     // Componentes grandes
$radius-full: 50%    // Círculos, avatares
```

---

## 🌩️ Sombras

```scss
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)       // Sutil
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1)        // Normal
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1)      // Pronunciada
$shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15)     // Elevada
$shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25)    // Máxima
```

---

## ⚡ Transiciones

```scss
$transition-fast: 150ms ease-in-out   // Micro-interacciones
$transition-base: 250ms ease-in-out   // Interacciones normales
$transition-slow: 350ms ease-in-out   // Transiciones complejas
```

---

## 📦 Componentes

### Botones

#### Primario (Azul Oscuro)
```html
<button class="btn btn-primary">Acción Principal</button>
```
- Gradiente azul oscuro a azul marino
- Hover: Efecto lift + sombra aumentada
- Ideal para CTAs principales

#### Gold/Dorado
```html
<button class="btn btn-gold">Acción Secundaria</button>
```
- Gradiente dorado
- Hover: Efecto lift
- Ideal para acciones importantes

#### Outline
```html
<button class="btn btn-outline">Acción Terciaria</button>
```
- Fondo transparente con borde
- Hover: Fondo se llena
- Ideal para acciones opcionales

### Cards

```html
<div class="card">
  <div class="card-header">
    <h3>Título del Card</h3>
  </div>
  <div class="card-body">
    <!-- Contenido -->
  </div>
  <div class="card-footer">
    <!-- Pie de página -->
  </div>
</div>
```

### Formularios

```html
<div class="form-group">
  <label for="input">Nombre del Campo</label>
  <input type="text" id="input" placeholder="Placeholder...">
</div>
```

Características:
- Border azul claro por defecto
- Focus: Border dorado + sombra suave
- Estados disabled disponibles
- Validación visual

### Alertas

```html
<div class="alert alert-success">✓ Operación exitosa</div>
<div class="alert alert-danger">✕ Error en la operación</div>
<div class="alert alert-warning">⚠ Advertencia</div>
<div class="alert alert-info">ℹ Información</div>
```

### Tablas

```html
<table class="data-table">
  <thead>
    <tr>
      <th>Columna 1</th>
      <th>Columna 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Dato 1</td>
      <td>Dato 2</td>
    </tr>
  </tbody>
</table>
```

---

## 📱 Responsive Breakpoints

```scss
$breakpoint-xs: 0        // Extra pequeño (mobile)
$breakpoint-sm: 576px    // Pequeño (tablet)
$breakpoint-md: 768px    // Mediano (tablet horizontal)
$breakpoint-lg: 992px    // Grande (laptop)
$breakpoint-xl: 1200px   // Extra grande (desktop)
$breakpoint-2xl: 1400px  // Ultra grande (4K)
```

---

## 🎬 Animaciones

### Slide In (Entrada deslizante)
```scss
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Fade In (Devanecimiento)
```scss
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Pulse (Pulso)
```scss
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

### Float (Flotación)
```scss
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(20px); }
}
```

---

## 🏗️ Estructura de Archivos

```
client/src/
├── styles/
│   ├── _variables.scss          # Variables globales
│   ├── pages/
│   │   ├── LoginPage.scss       # Estilos de login
│   │   └── RegisterPage.scss    # Estilos de registro
│   └── components/              # Estilos por componente
├── index.scss                   # Estilos globales
├── App.scss                     # Estilos de aplicación
└── index.tsx                    # Importación de estilos
```

---

## 📝 Guía de Uso

### Importar variables en un componente

```scss
@import '../styles/variables';

.mi-componente {
  color: $primary-dark;
  padding: $lg;
  border-radius: $radius-md;
  transition: all $transition-base;
}
```

### Usar media queries

```scss
@media (max-width: $breakpoint-md) {
  .mi-componente {
    padding: $md;
    font-size: $fs-sm;
  }
}
```

### Crear un componente con Bootstrap

```tsx
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/myComponent.scss';

export const MyComponent = () => {
  return (
    <div className="btn btn-primary">
      Click me
    </div>
  );
};
```

---

## 🎯 Principios de Diseño

1. **Consistencia**: Usar siempre variables, nunca hardcodear valores
2. **Accesibilidad**: Contraste suficiente, focus states claros
3. **Performance**: Minimizar sombras y animaciones complejas
4. **Responsividad**: Mobile-first, escalable a todos los dispositivos
5. **Profesionalismo**: Diseño corporativo adecuado para el SIA

---

## 🔄 Colores en Gradientes

Gradiente primario (Azul oscuro a azul marino):
```scss
background: linear-gradient(135deg, $primary-dark 0%, $primary-navy 100%);
```

Gradiente dorado:
```scss
background: linear-gradient(135deg, $primary-gold 0%, $primary-gold-dark 100%);
```

---

## ✅ Checklist de Implementación

- [x] Variables de color definidas
- [x] Tipografía configurada
- [x] Sistema de espaciado completo
- [x] Componentes base (botones, cards, forms)
- [x] Alertas y estados
- [x] Animaciones suaves
- [x] Responsive completo
- [x] Documentación
- [ ] Temas (light/dark mode opcional)
- [ ] Componentes avanzados

---

**Última actualización**: 24 de octubre de 2025
**Versión**: 1.0.0
