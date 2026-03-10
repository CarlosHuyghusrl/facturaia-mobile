#!/bin/bash
# Monitoreo de SharePoint Sync Queue
# Uso: ./scripts/sharepoint_monitor.sh

echo "=== SharePoint Sync Queue Status ==="
echo ""

PGPASSWORD=fBuTN2JZxjhJqxXCkacsMSPug9xgeb psql -h localhost -p 5433 -U postgres -c "
SELECT
    status,
    COUNT(*) as count,
    CASE
        WHEN status = 'failed' THEN MAX(last_error)
        ELSE NULL
    END as last_error
FROM sharepoint_sync_queue
GROUP BY status
ORDER BY status;
"

echo ""
echo "=== Últimos 5 items ==="
PGPASSWORD=fBuTN2JZxjhJqxXCkacsMSPug9xgeb psql -h localhost -p 5433 -U postgres -c "
SELECT
    id,
    LEFT(factura_id::text, 8) as factura,
    rnc_cliente,
    status,
    attempts,
    CASE
        WHEN synced_at IS NOT NULL THEN 'Synced: ' || synced_at::text
        WHEN next_retry_at IS NOT NULL THEN 'Next retry: ' || next_retry_at::text
        ELSE 'Pending'
    END as info
FROM sharepoint_sync_queue
ORDER BY created_at DESC
LIMIT 5;
"

echo ""
echo "=== Log reciente ==="
tail -10 /home/gestoria/eas-builds/FacturaScannerApp/logs/sharepoint-sync.log 2>/dev/null || echo "No hay log aún"
