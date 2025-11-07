from pydantic import BaseModel
from typing import Optional, List

class UploadResponse(BaseModel):
    document_id: str
    filename: str
    status: str
    message: str

class QueryRequest(BaseModel):
    document_id: str
    question: str
    temperature: Optional[float] = 0.7

class QueryResponse(BaseModel):
    document_id: str
    question: str
    answer: str
    model: str

class DocumentInfo(BaseModel):
    document_id: str
    filename: str
    upload_date: str
    file_size: int

class ListDocumentsResponse(BaseModel):
    documents: List[DocumentInfo]
    total: int