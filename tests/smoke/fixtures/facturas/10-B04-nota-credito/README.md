# Fixture 10 — B04 Nota Crédito

Nota crédito devolución parcial de la factura original B0100012345 (ferretería). Math correcto: 300 * 0.18 = 54. Total 354.
ncf_modifica indica factura referenciada → validateNotaCredito NO debe disparar nota_credito_sin_referencia.

Espera: valid=true, needs_review=false, sin warnings ni errors.
