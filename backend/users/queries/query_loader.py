import os
from pathlib import Path
from typing import Optional


def load_query(query_name: str) -> str:
    try:
        current_dir = Path(__file__).parent
        query_path = current_dir / f"{query_name}.sql"
        
        if not query_path.exists():
            raise FileNotFoundError(f"Query file not found: {query_path}")
        
        with open(query_path, "r", encoding="utf-8") as f:
            query = f.read().strip()
        
        return query
    except Exception as e:
        error_message = str(e) if isinstance(e, (FileNotFoundError, IOError)) else str(e)
        raise IOError(f"Failed to load query {query_name}: {error_message}") from e


