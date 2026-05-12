# Fixture 08 — DGT Gubernamental Electrónico (E45)

Tasa gubernamental (permiso vehicular DGT). E45 Gubernamental Electrónica per DGII spec.
- ITBIS exento (servicios gubernamentales no llevan ITBIS)
- categoria_itbis=exento → itbis_skip_exento warning
- validateGubernamentales NO debe disparar gubernamental_sin_exento (porque ITBISExento>0)

Espera: valid=true, needs_review=true, 1 warning (itbis_skip_exento). NO debe contener gubernamental_sin_exento.
