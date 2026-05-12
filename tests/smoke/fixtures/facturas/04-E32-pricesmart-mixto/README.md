# Fixture 04 — PriceSmart mixto (E32)

Supermercado mixto típico: productos gravados 18% + exentos. ITBIS facturado 245.30 sobre subtotal 3200 = 7.66% (NO es 18%, porque hay exentos). categoria_itbis=mixto debe disparar skip silencioso explicado.

Espera: valid=true, needs_review=true, 1 warning (itbis_skip_mixto).
