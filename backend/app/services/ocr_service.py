import base64
import logging
import tempfile
import os
from mistralai import Mistral
from app.core.config import settings

logger = logging.getLogger(__name__)

client = Mistral(api_key=settings.MISTRAL_API_KEY)


class OCRService:
    @staticmethod
    def extract_text(file_content: bytes, file_type: str) -> str:
        """
        Extract text from file content using Mistral OCR.
        Supported types: 'pdf', 'docx', 'pptx', 'png', 'jpg', 'jpeg', 'txt'
        """
        file_type = file_type.lower().replace(".", "")
        try:
            if file_type == "txt":
                return OCRService._extract_from_txt(file_content)
            elif file_type in ["png", "jpg", "jpeg", "webp", "gif"]:
                return OCRService._extract_from_image(file_content, file_type)
            elif file_type in ["pdf", "docx", "doc", "pptx", "ppt"]:
                return OCRService._extract_from_document(file_content, file_type)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
        except Exception as e:
            logger.error(f"Error extracting text from {file_type} file: {str(e)}")
            raise e

    @staticmethod
    def _extract_from_document(content: bytes, file_type: str) -> str:
        """
        Extract text from documents (PDF, DOCX, PPTX) using Mistral OCR.
        Uploads file to Mistral, gets signed URL, then processes with OCR.
        """
        logger.info(f"Processing {file_type.upper()} with Mistral OCR...")

        tmp_path = None
        uploaded_file = None

        try:
            # Write content to temp file
            suffix = f".{file_type}"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(content)
                tmp_path = tmp.name

            # Upload file to Mistral
            logger.info("Uploading file to Mistral...")
            with open(tmp_path, "rb") as f:
                uploaded_file = client.files.upload(
                    file={
                        "file_name": f"document{suffix}",
                        "content": f,
                    },
                    purpose="ocr",
                )

            # Get signed URL for the uploaded file
            signed_url = client.files.get_signed_url(file_id=uploaded_file.id)

            # Call Mistral OCR API with document URL
            logger.info("Running Mistral OCR...")
            ocr_response = client.ocr.process(
                model="mistral-ocr-latest",
                document={
                    "type": "document_url",
                    "document_url": signed_url.url,
                },
                include_image_base64=False,
                image_limit=0,
            )

            # Combine all pages into markdown
            text_parts = []
            for page in ocr_response.pages:
                text_parts.append(f"--- Page {page.index + 1} ---\n{page.markdown}")

            result = "\n\n".join(text_parts)
            logger.info(
                f"Mistral OCR extracted {len(result)} characters from {file_type.upper()}"
            )
            return result

        finally:
            # Cleanup temp file
            if tmp_path and os.path.exists(tmp_path):
                os.unlink(tmp_path)
            # Delete uploaded file from Mistral
            if uploaded_file:
                try:
                    client.files.delete(file_id=uploaded_file.id)
                except Exception as e:
                    logger.warning(f"Failed to delete file from Mistral: {e}")

    @staticmethod
    def _extract_from_image(content: bytes, file_type: str) -> str:
        """
        Extract text from images using Mistral OCR.
        """
        logger.info(f"Processing image ({file_type}) with Mistral OCR...")

        # Encode image to base64 data URI
        base64_content = base64.standard_b64encode(content).decode("utf-8")
        mime_types = {
            "png": "image/png",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "webp": "image/webp",
            "gif": "image/gif",
        }
        mime_type = mime_types.get(file_type, "image/png")
        data_uri = f"data:{mime_type};base64,{base64_content}"

        # Call Mistral OCR API for images
        ocr_response = client.ocr.process(
            model="mistral-ocr-latest",
            document={
                "type": "image_url",
                "image_url": data_uri,
            },
        )

        # Combine all pages
        text_parts = []
        for page in ocr_response.pages:
            text_parts.append(page.markdown)

        result = "\n\n".join(text_parts)
        logger.info(f"Mistral OCR extracted {len(result)} characters from image")
        return result

    @staticmethod
    def _extract_from_txt(content: bytes) -> str:
        """Extract text from plain text files."""
        try:
            return content.decode("utf-8")
        except UnicodeDecodeError:
            try:
                return content.decode("latin-1")
            except Exception as e:
                raise ValueError(f"Failed to decode TXT file: {str(e)}")
