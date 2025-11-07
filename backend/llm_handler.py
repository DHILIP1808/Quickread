import aiohttp
import json
import re
from config import OPENROUTER_API_KEY, OPENROUTER_BASE_URL, OPENROUTER_MODEL

class LLMHandler:
    """Handle communication with OpenRouter API"""
    
    def __init__(self):
        self.api_key = OPENROUTER_API_KEY
        self.base_url = OPENROUTER_BASE_URL
        self.model = OPENROUTER_MODEL
        
        # Common greeting patterns
        self.greeting_patterns = [
            r'\b(hi|hello|hey|greetings|good\s+(morning|afternoon|evening)|howdy)\b',
            r'\bhow\s+are\s+you\b',
            r'\bwhat\'?s\s+up\b',
            r'\bnice\s+to\s+meet\b',
            r'\bpleasure\s+to\s+meet\b'
        ]
    
    def is_greeting(self, text: str) -> bool:
        """
        Check if the user input is a greeting
        
        Args:
            text: User's input text
            
        Returns:
            True if text is a greeting, False otherwise
        """
        text_lower = text.lower().strip()
        
        # Check if text is very short and matches greeting patterns
        if len(text_lower.split()) <= 5:  # Short messages are more likely greetings
            for pattern in self.greeting_patterns:
                if re.search(pattern, text_lower, re.IGNORECASE):
                    return True
        
        return False
    
    def get_greeting_response(self) -> str:
        """
        Return a friendly greeting response
        
        Returns:
            Greeting message
        """
        return """Hello! 👋 I'm your document assistant. I'm here to help you analyze and understand your uploaded documents.

You can ask me questions about:
- Specific information in your documents
- Summaries of content
- Analysis and insights
- Any clarifications you need

Just ask your question, and I'll do my best to help based on the document content!"""

    def clean_response(self, content: str) -> str:
        """
        Clean unwanted special characters and formatting from LLM response
        
        Args:
            content: Raw LLM response
            
        Returns:
            Cleaned response text
        """
        try:
            # Remove zero-width characters and control characters
            content = re.sub(r'[\u200B-\u200D\uFEFF\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]', '', content)
            
            # Remove common problematic escape sequences
            content = re.sub(r'\\x[0-9a-fA-F]{2}', '', content)
            content = re.sub(r'\\u[0-9a-fA-F]{4}', '', content)
            content = re.sub(r'\\[rnt]', '', content)
            
            # Remove HTML tags if any
            content = re.sub(r'<[^>]+>', '', content)
            
            # Remove markdown code block markers if they appear incorrectly
            content = re.sub(r'^```[\w]*\n?', '', content, flags=re.MULTILINE)
            content = re.sub(r'\n?```$', '', content, flags=re.MULTILINE)
            
            # Clean up multiple spaces while preserving intentional formatting
            lines = content.split('\n')
            cleaned_lines = []
            for line in lines:
                # Preserve empty lines but clean content lines
                if line.strip():
                    cleaned_line = re.sub(r' +', ' ', line.strip())
                    cleaned_lines.append(cleaned_line)
                else:
                    cleaned_lines.append('')
            
            content = '\n'.join(cleaned_lines)
            
            # Remove excessive blank lines (more than 2 consecutive)
            content = re.sub(r'\n{3,}', '\n\n', content)
            
            return content.strip()
        except Exception as e:
            print(f"Error cleaning response: {str(e)}")
            return content.strip()

    async def query_document(self, document_content: str, question: str, temperature: float = 0.7) -> str:
        """
        Query the document using LLM
        
        Args:
            document_content: The extracted document content
            question: User's question
            temperature: Temperature for model response
            
        Returns:
            Model's response
        """
        # Check if it's a greeting
        if self.is_greeting(question):
            return self.get_greeting_response()
        
        if not self.api_key:
            raise Exception("OpenRouter API key not configured")
        
        # Prepare the prompt with better instructions
        prompt = f"""You are a helpful document analysis assistant. Analyze the following document and answer the user's question.

<document>
{document_content[:8000]}
</document>

User Question: {question}

Instructions:
- Provide a clear, direct answer based ONLY on the document content
- Be concise but complete
- If the information is not in the document, politely say so
- Use proper formatting with paragraphs for readability
- Do not include any special characters, escape sequences, or formatting markers"""

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "Document Assistant",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": temperature,
            "max_tokens": 2000
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/chat/completions",
                    json=payload,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=60)
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        raise Exception(f"OpenRouter API error: {error_text}")
                    
                    data = await response.json()
                    raw_response = data['choices'][0]['message']['content']
                    
                    # Clean the response before returning
                    cleaned_response = self.clean_response(raw_response)
                    return cleaned_response
                    
        except aiohttp.ClientError as e:
            raise Exception(f"Error communicating with OpenRouter API: {str(e)}")
        except Exception as e:
            raise Exception(f"Error querying LLM: {str(e)}")

    async def query_with_context(self, document_content: str, question: str, context: str = "", temperature: float = 0.7) -> str:
        """
        Query with additional context
        
        Args:
            document_content: The extracted document content
            question: User's question
            context: Additional context
            temperature: Temperature for model response
            
        Returns:
            Model's response
        """
        # Check if it's a greeting
        if self.is_greeting(question):
            return self.get_greeting_response()
        
        full_content = f"{context}\n\nDocument Content:\n{document_content[:8000]}"
        return await self.query_document(full_content, question, temperature)