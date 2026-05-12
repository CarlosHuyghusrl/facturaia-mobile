# Fixture 09 — B11 Proveedor Informal

Proveedor informal sin RNC formal. NO carga ITBIS (es informal). categoria_itbis=general + sector=comercio + ITBIS=0 + monto 450 (>100) → backend emite verificar_si_exento warning (verifica manualmente si es exento real).

Espera: valid=true, needs_review=true, 1 warning (verificar_si_exento).
