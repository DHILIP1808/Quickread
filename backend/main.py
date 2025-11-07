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
    print("✓ FastAPI LLM Document Assistant started (In-Memory Processing)")
    yield
    print("✗ Application shutdown")

app = FastAPI(
    title="LLM Document Assistant API",
    description="Upload documents and query them using LLM (In-Memory Processing)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "LLM Document Assistant API",
        "version": "1.0.0",
        "security": "In-memory processing - no local file storage",
        "endpoints": {
            "upload": "POST /upload",
            "query": "POST /query",
            "documents": "GET /documents",
            "delete": "DELETE /document/{document_id}"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """Upload a document and extract its content (in-memory, no file storage)"""
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        file_extension = get_file_extension(file.filename)
        if not is_allowed_file(file.filename):
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed: {ALLOWED_EXTENSIONS}"
            )
        
        # Read file content into memory
        file_content = await file.read()
        file_size = len(file_content)
        
        # Check file size
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Max size: {MAX_FILE_SIZE} bytes"
            )
        
        # Generate document ID
        document_id = generate_document_id()
        
        # Process document directly from bytes (NO FILE STORAGE)
        result = DocumentProcessor.process_document(file_content, file_extension)
        
        # Save only metadata and extracted content (not the original file)
        save_document_metadata(document_id, file.filename, file_size)
        save_document_content(document_id, result)
        
        return UploadResponse(
            document_id=document_id,
            filename=file.filename,
            status="success",
            message="Document processed successfully (in-memory, no file stored)"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/query", response_model=QueryResponse)
async def query_document(request: QueryRequest):
    """Query a document with a question"""
    try:
        # Load document content
        content_data = load_document_content(request.document_id)
        if not content_data:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Get the text content
        if content_data.get("format") == "zip":
            # For ZIP files, combine all contents
            document_text = "\n\n".join(
                [f"--- {filename} ---\n{content}" 
                 for filename, content in content_data.get("content", {}).items()]
            )
        else:
            document_text = content_data.get("content", "")
        
        if not document_text:
            raise HTTPException(status_code=400, detail="Document has no extractable content")
        
        # Query LLM
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
        print(f"Error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")

@app.get("/documents", response_model=ListDocumentsResponse)
async def list_documents():
    """List all uploaded documents"""
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
        raise HTTPException(status_code=500, detail=f"Failed to list documents: {str(e)}")

@app.delete("/document/{document_id}")
async def delete_doc(document_id: str):
    """Delete a document"""
    try:
        metadata = load_document_metadata(document_id)
        if not metadata:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Delete only metadata and content JSON files
        delete_document(document_id)
        
        return {"message": "Document deleted successfully", "document_id": document_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)