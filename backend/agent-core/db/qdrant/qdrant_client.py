import logging
from qdrant_client.models import PointStruct, Filter, FilterSelector, FieldCondition, MatchValue
from uuid import uuid4

from .connectDB import client
from db.supabase.connectDB import get_db_session, engine
from db.supabase.crud import upsert_user_source, delete_user_source as delete_supabase_source
from db.supabase.models.model import UserSource

logger = logging.getLogger(__name__)

collection_name = "OmniAgent"


def upsert_embedding(user_id: str, source_id: str, source_title: str, chunks: list, embeddings: list, source_type: str):
    file_exist = check_if_file_exists(user_id, source_id)
    if file_exist:
        scroll_result = client.scroll(
            collection_name=collection_name,
            scroll_filter=Filter(
                must=[
                    FieldCondition(
                        key="source_id",
                        match=MatchValue(value=source_id)
                    )
                ]
            ),
            limit=1000,
        )
        points = scroll_result[0] if scroll_result else []

        if engine is not None:
            try:
                with get_db_session() as db:
                    upsert_user_source(db, user_id, source_id, source_title, source_type)
            except Exception as e:
                logger.exception("File already exists but failed to update metadata in Supabase")
                return {
                    "status": "error",
                    "message": "file already exists but failed to update metadata",
                    "supabase_status": "failed",
                    "supabase_error": str(e)
                }

        return {
            "status": "success",
            "message": "file already exists",
            "user_id": user_id,
            "collection": collection_name,
            "source_id": source_id,
            "points_upserted": len(points),
            "file_replaced": False,
            "operation_id": None,
            "existing_points": len(points),
            "supabase_status": "updated" if engine is not None else "not_configured"
        }

    try:
        if len(chunks) != len(embeddings):
            raise ValueError("mismatch in the chunks and embeddings")

        supabase_user_source = None
        supabase_is_new = False

        if engine is not None:
            try:
                with get_db_session() as db:
                    supabase_user_source, supabase_is_new = upsert_user_source(
                        db, user_id, source_id, source_title, source_type
                    )
                logger.info(
                    "%s user_source in Supabase: %s",
                    "Created" if supabase_is_new else "Updated",
                    supabase_user_source,
                )
            except Exception as supabase_error:
                logger.exception("Supabase upsert failed")
                return {
                    "status": "error",
                    "message": "Failed to upsert metadata to Supabase",
                    "supabase_status": "failed",
                    "supabase_error": str(supabase_error)
                }

        points = []
        for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            point_id = str(uuid4())
            point = PointStruct(
                id=point_id,
                vector=embedding,
                payload={
                    "user_id": user_id,
                    "source_id": source_id,
                    "chunk_index": idx,
                    "text": chunk,
                    "chunk_length": len(chunk)
                }
            )
            points.append(point)

        try:
            operation_info = client.upsert(
                collection_name=collection_name,
                points=points,
                wait=True
            )
            logger.info("Upserted %s points to collection '%s'", len(points), collection_name)

            return {
                "status": "success",
                "user_id": user_id,
                "collection": collection_name,
                "source_id": source_id,
                "points_upserted": len(points),
                "file_replaced": file_exist,
                "operation_id": operation_info.operation_id if hasattr(operation_info, "operation_id") else None,
                "supabase_status": ("created" if supabase_is_new else "updated") if engine is not None else "not_configured",
                "supabase_record_id": supabase_user_source.id if supabase_user_source else None
            }

        except Exception as qdrant_error:
            logger.exception("Qdrant upsert failed")

            if engine is not None and supabase_user_source and supabase_is_new:
                try:
                    with get_db_session() as db:
                        delete_supabase_source(db, user_id, source_id, source_title)
                    logger.info("Rolled back Supabase record for user=%s, source=%s", user_id, source_id)
                except Exception as rollback_error:
                    logger.warning("Failed to rollback Supabase: %s", rollback_error)

            return {
                "status": "error",
                "message": f"Failed to upsert embeddings to Qdrant: {str(qdrant_error)}",
                "qdrant_status": "failed",
                "qdrant_error": str(qdrant_error),
                "supabase_status": "rolled_back" if (engine is not None and supabase_is_new) else "not_affected"
            }

    except Exception as e:
        logger.exception("Error upserting embeddings")
        return {
            "status": "error",
            "message": str(e)
        }


def ensure_payload_indexes():
    try:
        client.create_payload_index(collection_name, "user_id", field_schema="keyword")
    except Exception:
        pass
    try:
        client.create_payload_index(collection_name, "source_id", field_schema="keyword")
    except Exception:
        pass


def check_if_file_exists(user_id: str, source_id: str):
    try:
        collections = client.get_collections().collections
        collection_names = [col.name for col in collections]

        if collection_name not in collection_names:
            return False

        ensure_payload_indexes()
        results = client.scroll(
            collection_name=collection_name,
            scroll_filter=Filter(
                must=[
                    FieldCondition(key="user_id", match=MatchValue(value=user_id)),
                    FieldCondition(key="source_id", match=MatchValue(value=source_id))
                ]
            ),
            limit=1
        )
        return len(results[0]) > 0
    except Exception as e:
        logger.exception("Error checking file existence")
        return False


def delete_user_file(user_id: str, source_title: str):
    source_id = get_source_id_by_title(user_id, source_title)

    if not source_id:
        return {
            "status": "error",
            "message": "file not found"
        }

    try:
        client.delete(
            collection_name=collection_name,
            points_selector=FilterSelector(
                filter=Filter(
                    must=[
                        FieldCondition(key="user_id", match=MatchValue(value=user_id)),
                        FieldCondition(key="source_id", match=MatchValue(value=source_id)),
                    ]
                )
            ),
        )

        if engine is not None:
            try:
                with get_db_session() as db:
                    deleted = delete_supabase_source(db, user_id, source_id, source_title)
                    if deleted:
                        logger.info("Deleted user_source from Supabase: user=%s, source=%s", user_id, source_id)
            except Exception as e:
                logger.warning("Qdrant delete succeeded but Supabase delete failed: %s", e)

        return {
            "status": "success",
            "message": f"Deleted file {source_id} for user {user_id}"
        }
    except Exception as e:
        logger.exception("Error deleting user file")
        return {
            "status": "error",
            "message": str(e)
        }


def get_user_all_sources(user_id: str):
    if engine is None:
        return []
    try:
        with get_db_session() as db:
            sources = db.query(UserSource).filter(UserSource.user_id == user_id).all()
            return [source.source_id for source in sources]
    except Exception as e:
        logger.exception("Error getting user all sources")
        return []


def get_source_id_by_title(user_id: str, source_title: str):
    if engine is None:
        return None
    try:
        with get_db_session() as db:
            result = (
                db.query(UserSource)
                .filter(
                    UserSource.user_id == user_id,
                    UserSource.source_title == source_title
                )
                .first()
            )
            return result.source_id if result else None
    except Exception as e:
        logger.exception("Error getting source_id by title")
        return None
