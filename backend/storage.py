import os
from config import UPLOAD_FOLDER

class StorageManager:
    """Manage file storage operations"""
    
    @staticmethod
    async def save_uploaded_file(file, document_id: str, original_filename: str) -> str:
        """Save uploaded file to storage"""
        try:
            file_extension = os.path.splitext(original_filename)[1]
            file_path = os.path.join(UPLOAD_FOLDER, f"{document_id}{file_extension}")
            
            contents = await file.read()
            with open(file_path, 'wb') as f:
                f.write(contents)
            
            return file_path
        except Exception as e:
            raise Exception(f"Error saving file: {str(e)}")
    
    @staticmethod
    def delete_uploaded_file(file_path: str):
        """Delete uploaded file"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            raise Exception(f"Error deleting file: {str(e)}")
    
    @staticmethod
    def get_file_size(file_path: str) -> int:
        """Get file size in bytes"""
        return os.path.getsize(file_path)