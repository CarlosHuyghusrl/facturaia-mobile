# Fixture 01 — JUMBO Puerto Plata (mixto)

Caso real Carlos 12-may-2026 device piloto.
- NCF E120046718576 (tipo E12 NO existe en DGII spec — debe disparar `ncf_unknown_type` warning).
- Total RD$ 1,477.04, productos mixtos (gravados 18% + exentos).
- Backend v2.46.0 sugiere E32 como tipo probable (factura consumo electrónica).

Espera: backend devuelve `valid=true, needs_review=true` (warning unknown_type + skip mixto).
