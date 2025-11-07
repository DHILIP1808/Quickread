import os
from dotenv import load_dotenv

load_dotenv()

# API Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openrouter/auto")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# File Configuration
# UPLOAD_FOLDER removed - no longer storing uploaded files
DOCUMENTS_STORAGE_FOLDER = os.getenv("DOCUMENTS_STORAGE_FOLDER", "documents_storage")
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", 52428800))  # 50MB default
ALLOWED_EXTENSIONS = {'.pdf', '.txt', '.docx', '.xlsx', '.zip'}

# Create storage folder for metadata and extracted content only
os.makedirs(DOCUMENTS_STORAGE_FOLDER, exist_ok=True)

# Model Configuration
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 100