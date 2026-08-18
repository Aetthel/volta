# Plan Estratégico y Guía de Crecimiento para Volta 🚀

> **Proyecto:** Volta (Sistema de Gestión de Citas y Automatización de WhatsApp)  
> **Target:** Negocios locales (Peluquerías, Centros de Estética, Fisioterapia, Yoga, etc.)  
> **Modelo de Precios:** Básico (18€/mes) | Pro (25€/mes)

---

## 🎯 1. Estrategia de Venta Local y Captación (Sin parecer un comercial)

### El Enfoque "Informático del Pueblo":
* **No vendas "Software o CRM":** Háblales de su dolor nº1: **Las citas perdidas** (clientes que no aparecen y hacen perder dinero).
* **Guion de acercamiento en persona:**
  > *"Hola, soy [Tu Nombre], informático de la zona. Estoy desarrollando una app súper sencilla para que los negocios del pueblo envíen recordatorios por WhatsApp y reduzcan las citas perdidas. No vengo a venderte nada hoy, estoy pidiendo la opinión de negocios locales para mejorarla. ¿Tienes 3 minutos para enseñártela en el móvil?"*

### Estrategia de Verano:
* **Prueba gratis hasta Septiembre:** Configúrasela gratis en 5 minutos en verano para que en Septiembre (vuelta al cole / temporada alta) la tengan lista.
* **Onboarding "Guante Blanco":** Llévate la tablet y añade los 5 primeros clientes tú mismo en 3 minutos.

---

## ⚠️ 2. Diagnóstico de 5 Puntos Críticos a Mejorar en Volta

### 1️⃣ Vinculación de WhatsApp en Pantalla Móvil
* **Problema:** Si el usuario usa Volta en el móvil, no puede escanear con la cámara del mismo móvil el QR en pantalla.
* **Solución:** Añadir aviso visual: *"Si estás en el móvil, entra desde un ordenador o tablet para escanear el QR"*.

### 2️⃣ Fluidez LOPD (Consentimiento de Clientes)
* **Problema:** Los clientes en estado `lopdStatus: "Pendiente"` bloquean los recordatorios automáticos. Si un cliente reserva por teléfono para mañana y no abre el link LOPD a tiempo, no recibe WhatsApp.
* **Solución:** Añadir casilla `[x] Autorización verbal/presencial aceptada` al crear la cita o cliente para pasarlo a `Aceptado` al instante.

### 3️⃣ Ajuste de Propuesta de Valor en Plan Básico (18€ vs 25€)
* **Problema:** El plan de 18€ cruza *"Sin WhatsApp"*. Al no tener la función principal, el usuario sentirá que paga 18€ por un simple calendario y se dará de baja.
* **Solución:** Incluir WhatsApp en el plan Básico con límite (ej. 50 mensajes/mes). El plan Pro (25€) se mantiene con WhatsApp ilimitado.

### 4️⃣ Simplificación del Registro (Onboarding)
* **Problema:** El registro actual tiene 4 pasos (Sector ➔ Detalles ➔ Cuenta ➔ Listo). Puede generar abandono por pereza.
* **Solución:** Reducir a 1 paso inicial (Nombre + Email + Contraseña). Pedir el sector y detalles dentro del panel de forma progresiva.

### 5️⃣ Recordatorio Diario al Dueño (Feedback Invisible)
* **Problema:** El Sentinel envía los mensajes de noche o de madrugada. El dueño no "ve" el trabajo que hace Volta.
* **Solución:** Enviar una notificación/WhatsApp diario al dueño a las 9:00 AM:  
  > *"¡Buenos días! Hoy Volta ha enviado 6 recordatorios de WhatsApp para tus citas de mañana."*

---

## 🌐 3. Estructura Recomendada para la Web / Landing Page

* **Titular Principal:** *"Di adiós a los clientes que no aparecen. La agenda de citas por WhatsApp fácil para tu negocio."*
* **Subtítulo:** *"Pensado para peluquerías, estética, fisioterapia y negocios locales. Configúralo en 5 minutos."*
* **Prueba de confianza:** Sección "Quién soy" con tu foto, enlace a LinkedIn y botón directo a tu WhatsApp personal.
* **Transparencia en precios:** Plan Básico (18€) y Plan Pro (25€), sin permanencia y con 14 o 30 días de prueba sin tarjeta.

---

## 🛠️ Próximos Pasos Recomendados (Prioridad de Trabajo)

1. **Paso 1:** Añadir casilla de consentimiento presencial LOPD al crear citas.
2. **Paso 2:** Añadir aviso de vinculación QR para móviles en los ajustes de WhatsApp.
3. **Paso 3:** Visitar los 3 primeros negocios locales de confianza usando la función "Ver Demo".
