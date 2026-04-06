# Análisis: Soluciones para cuando la IA falla en FacturaIA
Fecha: 06-Abr-2026

## El problema real

Cuando Gemini/CLIProxy está caído:
- La app muestra error
- La factura se pierde — no se guarda nada
- El contador no puede trabajar

Esto pasa HOY. No es hipotético.

---

## SOLUCIÓN A — Fallback en cadena + cola offline
*(No requiere instalar nada nuevo)*

### Qué es
Modificar el backend Go (facturaia-ocr) para que:
1. Intente Claude Opus → si falla, intenta Gemini Flash → si falla, intenta Haiku
2. Si todos los modelos fallan → guarda la imagen + texto extraído con estado `revision_manual`
3. App guarda facturas offline si no hay internet → sube automático cuando vuelve conexión

### Lo que garantiza
- ✅ La factura NUNCA se pierde
- ✅ El contador ve "pendiente de revisión" en vez de un error
- ✅ Cuando vuelve la IA, procesa automático las pendientes
- ✅ No depende de ningún modelo nuevo

### Lo que NO resuelve
- ❌ Si todos los modelos de CLIProxy están caídos, alguien tiene que revisar manualmente
- ❌ No reduce el costo de IA (cada factura sigue usando API)

### Tiempo estimado: 2-3 días
### Riesgo: BAJO — son cambios al backend existente que ya funciona
### Certeza de que funciona: ALTA — es lógica de retry, no IA nueva

---

## SOLUCIÓN B — Modelo de visión local (Ollama)
*(Requiere descargar e integrar un modelo nuevo)*

### Qué es
Instalar un modelo de visión (ej: Qwen2-VL 7B o MiniCPM-V) en el Ollama
que ya está en el servidor (mirofish-ollama, localhost:11434) para procesar
facturas sin llamar APIs externas.

### Lo que garantizaría (en teoría)
- ✅ OCR funciona sin internet ni APIs externas
- ✅ Costo $0 por factura (modelo local)
- ✅ Velocidad potencialmente mejor (~1-2 seg)

### Lo que NO puedo garantizar
- ❓ Que el modelo entienda el formato DGII correctamente — no hay pruebas
- ❓ Que extraiga los campos fiscales (NCF, ITBIS, propina, RNC) con precisión
- ❓ Que funcione con la variedad de facturas dominicanas (cada impresora diferente)
- ❌ El modelo es general — no fue entrenado con facturas DGII específicamente

### Problema de RAM
- Servidor tiene 4.5GB disponibles (swap 100% lleno hoy por el build)
- Qwen2-VL 7B necesita 8GB → requiere matar otros servicios
- MiniCPM-V 3B necesita 4GB → posible pero ajustado

### Tiempo estimado: 1 semana (instalación + pruebas + ajustes)
### Riesgo: MEDIO-ALTO — no sabemos qué tan bien funciona hasta probarlo
### Certeza de que funciona: DESCONOCIDA — hay que probarlo con facturas reales

---

## SOLUCIONES QUE YO RECOMIENDO

### Recomendación inmediata (para Play Store): SOLUCIÓN A
**Por qué:** Resuelve el problema que tienen HOY. La factura ya no se pierde.
El código es predecible. No hay sorpresas. Listo en 3 días.

### Recomendación a futuro: SOLUCIÓN B como complemento
**Pero solo después de:** probar el modelo con 50+ facturas dominicanas reales
y confirmar que extrae NCF, RNC, ITBIS correctamente con >85% de precisión.
Si no pasa esa prueba, no vale la pena integrarlo.

### Lo que NO recomiendo
Instalar Solución B como reemplazo de la IA antes de probarla.
Un modelo que falla extrayendo el ITBIS o el NCF es peor que no tener OCR.

---

## Decisión

| | Solución A | Solución B |
|---|---|---|
| Resuelve problema HOY | ✅ | ❌ |
| Certeza de que funciona | Alta | Desconocida |
| Costo de implementación | 2-3 días | 1+ semana |
| Reduce costo de IA | No | Sí (si funciona) |
| Para Play Store | ✅ | No necesario |
| Riesgo | Bajo | Medio-Alto |

**Conclusión:** Solución A primero. Solución B cuando haya tiempo y facturas reales para probar.

