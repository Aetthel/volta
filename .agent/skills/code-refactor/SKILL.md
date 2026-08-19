---
name: code-refactor
description: Refactorización de código, eliminación de código sucio (code smells), aplicación de Clean Code y principios SOLID para mejorar legibilidad, mantenibilidad y calidad profesional.
---

# Code Refactor & Clean Code Skill

Esta skill guía la refactorización de código existente para eliminar código sucio, reducir la complejidad cognitiva y aplicar principios de diseño profesional (Clean Code, SOLID, DRY, KISS) sin alterar el comportamiento observable del sistema.

---

## 1. Principios Clave de Refactorización

### **A. Nombres Reveladores de Intención**
- Variables, funciones, clases y módulos deben reflejar claramente su propósito.
- Evitar nombres genéricos o abreviados (ej: `d`, `temp`, `data2`, `handle`).

### **B. Responsabilidad Única (SRP)**
- Cada función debe realizar una sola tarea bien definida.
- Si una función supera las ~25-30 líneas o maneja múltiples niveles de abstracción, extraer subfunciones especializadas.

### **C. Reducción de Anidamiento (Guard Clauses)**
- Retornar tempranamente (*Early Return*) para evitar bloques `if / else` profundamente anidados.
- Simplificar expresiones booleanas complejas extrayéndolas a variables o funciones descriptivas.

### **D. Eliminación de Código Sucio (Code Smells)**
- **Código Muerto**: Eliminar variables, argumentos, importaciones y funciones no utilizadas.
- **Valores Mágicos**: Sustituir constantes literales dispersas por constantes nombradas u objetos de configuración.
- **Duplicación (DRY)**: Centralizar patrones y lógica repetida.
- **Comentarios Redundantes**: Eliminar comentarios que solo repiten lo que el código expresa claramente. Mantener únicamente explicaciones sobre *por qué* se tomó una decisión no obvia.

---

## 2. Flujo de Trabajo Sistemático

1. **Inspección y Diagnóstico**:
   - Analizar el archivo objetivo completo.
   - Identificar los principales code smells y áreas de mejora.

2. **Verificación de Comportamiento**:
   - Confirmar firmas de funciones y contratos de API existentes para garantizar cero cambios rompientes (*breaking changes*).

3. **Refactorización Incremental**:
   - Aplicar refactorizaciones atómicas (renombrado, extracción de funciones, simplificación de condicionales).

4. **Verificación Runtime / Compilación**:
   - Ejecutar linters, formateadores, tests o comandos de build pertinentes para validar el resultado.
