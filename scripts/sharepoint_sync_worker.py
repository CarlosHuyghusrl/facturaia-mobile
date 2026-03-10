#!/usr/bin/env python3
"""
SharePoint Sync Worker para FacturaIA
Descarga imágenes de MinIO y las sube a SharePoint.

Ruta destino: {ubicacion}/{carpeta_cliente}/FacturaIA/{YYYY-MM}/{archivo}

Uso: python3 sharepoint_sync_worker.py
Cron: */2 * * * * cd ~/eas-builds/FacturaScannerApp && python3 scripts/sharepoint_sync_worker.py >> logs/sharepoint-sync.log 2>&1
"""

import os
import sys
import json
import logging
from datetime import datetime, timedelta, timezone
from io import BytesIO

import psycopg2
from minio import Minio

# Add o365-sync to path for SharePoint functions
O365_PATH = os.path.expanduser("~/o365-sync")
sys.path.insert(0, O365_PATH)

from sharepoint_service import (
    subir_archivo,
    crear_carpeta,
    obtener_carpeta_por_rnc,
    UBICACIONES_PATH,
)

# Config
DB_URL = "host=localhost port=5433 dbname=postgres user=postgres password=fBuTN2JZxjhJqxXCkacsMSPug9xgeb"
MINIO_ENDPOINT = "localhost:9000"
MINIO_ACCESS_KEY = "gestoria_minio"
MINIO_SECRET_KEY = "mMG3F4M42vgcGggEpAhAQuZ349jBkl"
MINIO_BUCKET = "facturas"
BATCH_SIZE = 10
MAX_ATTEMPTS = 5

# Backoff schedule (minutes): 1, 5, 15, 30, 60
BACKOFF_MINUTES = [1, 5, 15, 30, 60]

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [SharePoint-Sync] %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)


def get_minio_client():
    """Create MinIO client"""
    return Minio(
        MINIO_ENDPOINT,
        access_key=MINIO_ACCESS_KEY,
        secret_key=MINIO_SECRET_KEY,
        secure=False,
    )


def get_pending_items(conn):
    """Get batch of items ready for sync"""
    cur = conn.cursor()
    cur.execute("""
        SELECT id, factura_id, rnc_cliente, fecha_factura, archivo_url, archivo_nombre, attempts
        FROM sharepoint_sync_queue
        WHERE (status = 'pending' OR (status = 'failed' AND attempts < max_attempts AND next_retry_at <= NOW()))
        ORDER BY created_at ASC
        LIMIT %s
    """, (BATCH_SIZE,))
    items = cur.fetchall()
    cur.close()
    return items


def mark_processing(conn, item_id):
    """Mark item as processing"""
    cur = conn.cursor()
    cur.execute("UPDATE sharepoint_sync_queue SET status = 'processing' WHERE id = %s", (item_id,))
    conn.commit()
    cur.close()


def mark_synced(conn, item_id, sp_path, sp_file_id=None):
    """Mark item as synced"""
    cur = conn.cursor()
    cur.execute("""
        UPDATE sharepoint_sync_queue
        SET status = 'synced', sharepoint_path = %s, sharepoint_file_id = %s, synced_at = NOW()
        WHERE id = %s
    """, (sp_path, sp_file_id, item_id))
    conn.commit()
    cur.close()


def mark_failed(conn, item_id, error_msg, attempts):
    """Mark item as failed with backoff"""
    backoff_idx = min(attempts, len(BACKOFF_MINUTES) - 1)
    next_retry = datetime.now(timezone.utc) + timedelta(minutes=BACKOFF_MINUTES[backoff_idx])

    new_status = "failed"
    if attempts + 1 >= MAX_ATTEMPTS:
        new_status = "failed"  # stays failed, but won't be picked up again due to attempts >= max_attempts

    cur = conn.cursor()
    cur.execute("""
        UPDATE sharepoint_sync_queue
        SET status = %s, last_error = %s, attempts = %s, next_retry_at = %s
        WHERE id = %s
    """, (new_status, error_msg[:500], attempts + 1, next_retry, item_id))
    conn.commit()
    cur.close()


def mark_skipped(conn, item_id, reason):
    """Mark item as skipped (client not in SharePoint mapping)"""
    cur = conn.cursor()
    cur.execute("""
        UPDATE sharepoint_sync_queue
        SET status = 'skipped', last_error = %s
        WHERE id = %s
    """, (reason, item_id))
    conn.commit()
    cur.close()


def download_from_minio(minio_client, archivo_url):
    """Download image from MinIO. archivo_url is the object key in the bucket."""
    # archivo_url could be full URL or just the object key
    object_key = archivo_url
    if "/" in archivo_url and archivo_url.startswith("http"):
        # Extract object key from URL
        parts = archivo_url.split(MINIO_BUCKET + "/")
        if len(parts) > 1:
            object_key = parts[1]

    response = minio_client.get_object(MINIO_BUCKET, object_key)
    data = response.read()
    response.close()
    response.release_conn()
    return data


def build_sharepoint_path(rnc, fecha_factura, archivo_nombre):
    """Build SharePoint destination path: {ubicacion}/{carpeta}/FacturaIA/{YYYY-MM}/{file}"""
    info = obtener_carpeta_por_rnc(rnc)
    if not info:
        return None, f"RNC {rnc} no encontrado en sharepoint_clientes_mapeo"

    nombre_carpeta = info["nombre_carpeta"]
    ubicacion = info.get("ubicacion", "activos")
    ubicacion_path = UBICACIONES_PATH.get(ubicacion, UBICACIONES_PATH["activos"])

    # Fecha formato YYYY-MM
    if fecha_factura:
        year_month = fecha_factura.strftime("%Y-%m")
    else:
        year_month = datetime.now().strftime("%Y-%m")

    folder_path = f"{ubicacion_path}/{nombre_carpeta}/FacturaIA/{year_month}"
    return folder_path, None


def detect_content_type(filename):
    """Detect MIME type from filename"""
    if not filename:
        return "image/jpeg"
    lower = filename.lower()
    if lower.endswith(".png"):
        return "image/png"
    elif lower.endswith(".pdf"):
        return "application/pdf"
    elif lower.endswith(".webp"):
        return "image/webp"
    return "image/jpeg"


def sync_item(conn, minio_client, item):
    """Sync a single item from MinIO to SharePoint"""
    item_id, factura_id, rnc, fecha_factura, archivo_url, archivo_nombre, attempts = item

    log.info(f"Processing item {item_id}: factura={factura_id}, rnc={rnc}")
    mark_processing(conn, item_id)

    try:
        # 1. Build SharePoint path
        folder_path, error = build_sharepoint_path(rnc, fecha_factura, archivo_nombre)
        if error:
            log.warning(f"Skipping item {item_id}: {error}")
            mark_skipped(conn, item_id, error)
            return

        # 2. Download from MinIO
        log.info(f"Downloading from MinIO: {archivo_url}")
        image_data = download_from_minio(minio_client, archivo_url)
        log.info(f"Downloaded {len(image_data)} bytes")

        # 3. Create folder in SharePoint if needed
        log.info(f"Ensuring folder: {folder_path}")
        crear_carpeta(folder_path)

        # 4. Upload to SharePoint
        filename = archivo_nombre or f"factura-{factura_id}.jpg"
        content_type = detect_content_type(filename)

        log.info(f"Uploading to SharePoint: {folder_path}/{filename}")
        result = subir_archivo(folder_path, filename, image_data, content_type)

        if result.get("success"):
            sp_file_id = result.get("file_id", "")
            full_path = f"{folder_path}/{filename}"
            mark_synced(conn, item_id, full_path, sp_file_id)
            log.info(f"SUCCESS: Item {item_id} synced to {full_path}")
        else:
            error_msg = result.get("error", "Unknown SharePoint error")
            mark_failed(conn, item_id, error_msg, attempts)
            log.error(f"FAILED: Item {item_id}: {error_msg}")

    except Exception as e:
        error_msg = str(e)
        mark_failed(conn, item_id, error_msg, attempts)
        log.error(f"ERROR: Item {item_id}: {error_msg}")


def main():
    log.info("=== SharePoint Sync Worker started ===")

    try:
        conn = psycopg2.connect(DB_URL)
    except Exception as e:
        log.error(f"Cannot connect to database: {e}")
        sys.exit(1)

    try:
        minio_client = get_minio_client()
    except Exception as e:
        log.error(f"Cannot connect to MinIO: {e}")
        conn.close()
        sys.exit(1)

    items = get_pending_items(conn)

    if not items:
        log.info("No pending items. Exiting.")
        conn.close()
        return

    log.info(f"Found {len(items)} items to sync")

    synced = 0
    failed = 0
    skipped = 0

    for item in items:
        try:
            sync_item(conn, minio_client, item)
            # Check final status
            cur = conn.cursor()
            cur.execute("SELECT status FROM sharepoint_sync_queue WHERE id = %s", (item[0],))
            status = cur.fetchone()[0]
            cur.close()
            if status == "synced":
                synced += 1
            elif status == "skipped":
                skipped += 1
            else:
                failed += 1
        except Exception as e:
            log.error(f"Unexpected error processing item {item[0]}: {e}")
            failed += 1

    log.info(f"=== Done: {synced} synced, {failed} failed, {skipped} skipped ===")
    conn.close()


if __name__ == "__main__":
    main()
