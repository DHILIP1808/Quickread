from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import traceback

from config import MAX_FILE_SIZE, ALLOWED_EXTENSIONS
from schemas import UploadResponse, QueryRequest, QueryResponse, ListDocumentsResponse, DocumentInfo
from utils import (
    generate_document_id, get_file_extension, is_allowed_file,
    save_document_metadata, save_document_content, load_document_content,
    load_document_metadata, list_all_documents, delete_document
)
from document_processor import DocumentProcessor
from llm_handler import LLMHandler

# Initialize
llm_handler = LLMHandler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("✓ FastAPI LLM Document Assistant started")
    print("✓ Security: In-Memory Processing - No local file storage")
    print("✓ Only metadata and extracted text are stored")
    yield
    print("✗ Application shutdown")

app = FastAPI(
    title="LLM Document Assistant API",
    description="Upload documents and query them using LLM (In-Memory Processing - No File Storage)",
    version="2.0.0",
    lifespan=lifespan
)

origins = [
    "http://localhost:5173",
    "https://quickread-renk.onrender.com"
]
# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "LLM Document Assistant API",
        "version": "2.0.0",
        "security": "In-memory processing - original files are never stored",
        "storage": "Only metadata and extracted text content are saved",
        "endpoints": {
            "upload": "POST /upload",
            "query": "POST /query",
            "documents": "GET /documents",
            "delete": "DELETE /document/{document_id}"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "security_mode": "in-memory-processing"
    }

@app.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a document and extract its content.
    
    Security: Files are processed in-memory only. Original files are NEVER stored on disk.
    Only extracted text content and metadata are saved.
    """
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        file_extension = get_file_extension(file.filename)
        if not is_allowed_file(file.filename):
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Read file content into memory (NO FILE STORAGE)
        file_content = await file.read()
        file_size = len(file_content)
        
        # Check file size
        if file_size > MAX_FILE_SIZE:
            max_size_mb = MAX_FILE_SIZE / (1024 * 1024)
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Max size: {max_size_mb:.1f}MB"
            )
        
        # Generate document ID
        document_id = generate_document_id()
        
        # Process document directly from bytes in memory
        # Original file is NEVER saved to disk
        result = DocumentProcessor.process_document(file_content, file_extension)
        
        # Save only metadata and extracted text content
        # Original file bytes are discarded after processing
        save_document_metadata(document_id, file.filename, file_size)
        save_document_content(document_id, result)
        
        return UploadResponse(
            document_id=document_id,
            filename=file.filename,
            status="success",
            message="Document processed successfully (in-memory, original file not stored)"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Upload error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/query", response_model=QueryResponse)
async def query_document(request: QueryRequest):
    """Query a processed document with a question"""
    try:
        # Load document content (extracted text only)
        content_data = load_document_content(request.document_id)
        if not content_data:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Get the text content
        if content_data.get("format") == "zip":
            # For ZIP files, combine all extracted contents
            document_text = "\n\n".join(
                [f"--- {filename} ---\n{content}" 
                 for filename, content in content_data.get("content", {}).items()]
            )
        else:
            document_text = content_data.get("content", "")
        
        if not document_text:
            raise HTTPException(status_code=400, detail="Document has no extractable content")
        
        # Query LLM with extracted text
        answer = await llm_handler.query_document(
            document_content=document_text,
            question=request.question,
            temperature=request.temperature
        )
        
        return QueryResponse(
            document_id=request.document_id,
            question=request.question,
            answer=answer,
            model=llm_handler.model
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Query error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")

@app.get("/documents", response_model=ListDocumentsResponse)
async def list_documents():
    """List all processed documents (metadata only)"""
    try:
        documents = list_all_documents()
        document_list = []
        
        for doc in documents:
            document_list.append(DocumentInfo(
                document_id=doc.get("document_id"),
                filename=doc.get("filename"),
                upload_date=doc.get("upload_date"),
                file_size=doc.get("file_size", 0)
            ))
        
        return ListDocumentsResponse(
            documents=document_list,
            total=len(document_list)
        )
    except Exception as e:
        print(f"List error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to list documents: {str(e)}")

@app.delete("/document/{document_id}")
async def delete_doc(document_id: str):
    """
    Delete a document's metadata and extracted content.
    
    Note: Only metadata and extracted text are stored, so only these are deleted.
    Original files were never stored.
    """
    try:
        metadata = load_document_metadata(document_id)
        if not metadata:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Delete metadata and extracted content JSON files only
        # No original files to delete (they were never stored)
        delete_document(document_id)
        
        return {
            "message": "Document deleted successfully",
            "document_id": document_id,
            "filename": metadata.get("filename")
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Delete error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)