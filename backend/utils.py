import os
import uuid
import json
from datetime import datetime
from config import DOCUMENTS_STORAGE_FOLDER, ALLOWED_EXTENSIONS

def generate_document_id():
    """Generate unique document ID"""
    return str(uuid.uuid4())

def get_file_extension(filename: str):
    """Get file extension"""
    return os.path.splitext(filename)[1].lower()

def is_allowed_file(filename: str):
    """Check if file extension is allowed"""
    return get_file_extension(filename) in ALLOWED_EXTENSIONS

def get_metadata_path(document_id: str):
    """Get metadata file path for document"""
    return os.path.join(DOCUMENTS_STORAGE_FOLDER, f"{document_id}_metadata.json")

def get_content_path(document_id: str):
    """Get content file path for document"""
    return os.path.join(DOCUMENTS_STORAGE_FOLDER, f"{document_id}_content.json")

def save_document_metadata(document_id: str, filename: str, file_size: int):
    """Save document metadata"""
    metadata = {
        "document_id": document_id,
        "filename": filename,
        "upload_date": datetime.now().isoformat(),
        "file_size": file_size
    }
    with open(get_metadata_path(document_id), 'w') as f:
        json.dump(metadata, f, indent=2)

def load_document_metadata(document_id: str):
    """Load document metadata"""
    metadata_path = get_metadata_path(document_id)
    if os.path.exists(metadata_path):
        with open(metadata_path, 'r') as f:
            return json.load(f)
    return None

def save_document_content(document_id: str, content: dict):
    """Save extracted document content"""
    with open(get_content_path(document_id), 'w') as f:
        json.dump(content, f, indent=2)

def load_document_content(document_id: str):
    """Load extracted document content"""
    content_path = get_content_path(document_id)
    if os.path.exists(content_path):
        with open(content_path, 'r') as f:
            return json.load(f)
    return None

def list_all_documents():
    """List all uploaded documents"""
    documents = []
    for filename in os.listdir(DOCUMENTS_STORAGE_FOLDER):
        if filename.endswith("_metadata.json"):
            metadata_path = os.path.join(DOCUMENTS_STORAGE_FOLDER, filename)
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
                documents.append(metadata)
    return documents

def delete_document(document_id: str):
    """Delete document and its metadata"""
    metadata_path = get_metadata_path(document_id)
    content_path = get_content_path(document_id)
    
    if os.path.exists(metadata_path):
        os.remove(metadata_path)
    if os.path.exists(content_path):
        os.remove(content_path)