# Enterprise Solutions - Cyber-Modern Design System

## 🎨 Identidad Visual

### Paleta de Colores

#### Colores Principales
- **Magenta Primary**: `#d946ef` - Color principal para CTAs y elementos destacados
- **Púrpura Secondary**: `#7c3aed` - Color secundario para gradientes y acentos
- **Violeta Accent**: `#8b5cf6` - Color de acento para variaciones

#### Fondo y Superficie
- **Background**: `#0a0118` - Púrpura noche profundo
- **Glass Surface**: `rgba(255, 255, 255, 0.05)` - Superficie con glassmorphism
- **Glass Hover**: `rgba(255, 255, 255, 0.1)` - Superficie en hover

#### Textos
- **Primary Text**: `#ffffff` - Blanco puro para títulos y textos importantes
- **Secondary Text**: `#94a3b8` - Slate-400 para textos secundarios y descriptivos

#### Bordes
- **Border**: `rgba(255, 255, 255, 0.1)` - Borde estándar
- **Border Hover**: `rgba(255, 255, 255, 0.2)` - Borde en hover

## 🔮 Efectos Glassmorphism

### Background Blur
- **Nivel Estándar**: `backdrop-blur(24px)` - Para cards y contenedores
- **Nivel Intenso**: `backdrop-blur(40px)` - Para modals y overlays

### Configuración de Glass
```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-hover:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}
```

## 🌌 Fondo y Grid Pattern

### Grid Infinito
- **Tamaño**: 40px x 40px
- **Color**: `rgba(255, 255, 255, 0.03)`
- **Implementación**: CSS linear-gradient con background-size

```css
background-image:
  linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
  linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
background-size: 40px 40px;
```

## 🎭 Gradientes

### Gradiente Principal (Magenta → Púrpura)
```css
background: linear-gradient(135deg, #d946ef 0%, #7c3aed 100%);
```

**Uso:**
- Botones primarios
- Títulos con gradient-text
- Iconos y badges destacados

### Otros Gradientes

**Éxito (Emerald)**
```css
background: linear-gradient(135deg, #10b981 0%, #059669 100%);
```

**Peligro (Red)**
```css
background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
```

**Info (Cyan)**
```css
background: linear-gradient(135deg, #06b6d4 0%, #0284c7 100%);
```

## 🔤 Tipografía

### Fuente
- **Primary**: Inter (sans-serif moderna)
- **Fallback**: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

### Títulos con Gradiente
```css
h1 {
  font-weight: 800; /* Black */
  letter-spacing: -0.02em; /* Tight */
  background: linear-gradient(135deg, #d946ef 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Jerarquía
- **H1**: 2xl (36px), Black (800), Tracking Tight
- **H2**: xl (24px), Bold (700), Tracking Tight
- **H3**: lg (18px), Semibold (600)
- **H4**: base (16px), Semibold (600)
- **Body**: base (16px), Normal (400)

## 🎯 Componentes

### Botones

#### Primario
```tsx
<Button variant="primary">
  Acción Principal
</Button>
```
- Gradiente de Magenta a Púrpura
- Shadow con glow efecto
- Border radius: 2xl (16px)
- Active scale: 0.95

#### Secundario (Glass)
```tsx
<Button variant="secondary">
  Acción Secundaria
</Button>
```
- Efecto glassmorphism
- Borde fino blanco 10%
- Hover: borde 20%

### Cards

```tsx
<Card title="Título" description="Descripción" hover={true}>
  Contenido
</Card>
```

**Características:**
- Background: glass con blur
- Border radius: 2xl (16px)
- Border: white/10
- Hover: white/20

### Badges

```tsx
<Badge variant="success">Activo</Badge>
<Badge variant="warning">Alerta</Badge>
<Badge variant="danger">Error</Badge>
<Badge variant="primary">Destacado</Badge>
```

**Estilos:**
- Background: color/20 (semi-transparente)
- Border: color/30
- Font: Bold (700)
- Size: xs (12px)

### Search Bar

```tsx
<SearchBar
  value={searchTerm}
  onChange={setSearchTerm}
  placeholder="Buscar..."
/>
```

**Características:**
- Glass background
- Focus ring: Magenta
- Icon transition: Gray → Magenta on focus

## 🎬 Animaciones

### Duración y Timing
- **Transición estándar**: 300ms
- **Timing function**: cubic-bezier(0.4, 0, 0.2, 1)

### Animaciones Disponibles

#### Fade In (Entrada)
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```
**Uso**: Entrada de páginas y modales

#### Scale on Click
```css
active:scale-95
```
**Uso**: Feedback en botones

#### Pulse (Notificaciones)
```css
animate-pulse
```
**Uso**: Badges de notificación, alertas activas

#### Glow Pulse
```css
@keyframes glowPulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(217, 70, 239, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(217, 70, 239, 0.6);
  }
}
```
**Uso**: Elementos destacados con luz pulsante

## 🎨 Navegación

### Sidebar

**Item Activo:**
- Background: `rgba(217, 70, 239, 0.2)`
- Border left: 4px solid Magenta
- Shadow: `0 0 20px rgba(217, 70, 239, 0.2)`
- Dot indicator: pulsante

**Item Normal:**
- Text: Slate-400 (#94a3b8)
- Hover: background white/5, text white
- Icon hover: color Magenta

### Navbar

**Características:**
- Glass con blur intenso
- Border bottom: white/10
- Search bar integrada con focus ring Magenta
- Notificación: dot pulsante con shadow

## 🌟 Sombras y Efectos

### Sombras con Color (Glow)

```css
/* Magenta Glow */
box-shadow: 0 0 30px rgba(217, 70, 239, 0.3);

/* Hover Glow */
box-shadow: 0 0 40px rgba(217, 70, 239, 0.5);

/* Éxito Glow */
box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);

/* Advertencia Glow */
box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
```

### Border Radius

- **sm**: 0.5rem (8px) - Elementos pequeños
- **md**: 1rem (16px) - Cards normales
- **lg**: 1.5rem (24px) - Cards grandes
- **2xl**: 2rem (32px) - Botones y contenedores principales
- **3xl**: 3rem (48px) - Modales y elementos destacados

## 📱 Responsive

### Breakpoints (Tailwind)
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Mobile-First
Todos los componentes están diseñados con enfoque mobile-first, expandiéndose para pantallas más grandes.

## ♿ Accesibilidad

### Contraste
- Text sobre Glass: Ratio mínimo 7:1 (AAA)
- Magenta sobre oscuro: Ratio 4.5:1 (AA)

### Focus States
- Ring visible en todos los elementos interactivos
- Color: Magenta (#d946ef)
- Width: 2px
- Offset: 2px (del background oscuro)

### Estados Hover
- Transiciones suaves (300ms)
- Cambios de color claros
- Scale feedback en botones

## 🔧 Utilidades CSS

### Clases Personalizadas

```css
.glass { /* Glassmorphism base */ }
.glass-hover { /* Glassmorphism con hover */ }
.gradient-text { /* Texto con gradiente Magenta→Púrpura */ }
.animate-fadeIn { /* Animación de entrada */ }
.animate-glowPulse { /* Glow pulsante */ }
```

### Scrollbar Personalizada

```css
::-webkit-scrollbar {
  width: 8px;
  background: rgba(255, 255, 255, 0.05);
}

::-webkit-scrollbar-thumb {
  background: rgba(217, 70, 239, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(217, 70, 239, 0.5);
}
```

## 🎯 Mejores Prácticas

1. **Usar glass en contenedores**: Mantener consistencia con glassmorphism
2. **Gradientes solo en CTAs y títulos**: No abusar de los gradientes
3. **Animaciones sutiles**: 300-500ms máximo
4. **Espaciado generoso**: Mínimo 1.5rem entre secciones
5. **Contraste de texto**: Siempre usar white o slate-400, nunca grises intermedios
6. **Bordes consistentes**: white/10 para normal, white/20 para hover
7. **Shadow con color**: Usar glow en elementos importantes
8. **Border radius**: Mínimo 1rem (16px) para el estilo moderno

---

**Enterprise Solutions** - Powered by Cyber-Modern Design
