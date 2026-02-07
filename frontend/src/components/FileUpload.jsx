import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const FileUpload = ({ onDrop, accept, multiple = false, disabled = false, maxSize = 10 * 1024 * 1024 }) => {
  const handleDrop = useCallback((acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      fileRejections.forEach(({ file, errors }) => {
        errors.forEach(err => {
          if (err.code === 'file-too-large') {
            toast.error(`File ${file.name} is too large. Max size is ${maxSize / (1024 * 1024)}MB.`);
          } else {
            toast.error(`Error with ${file.name}: ${err.message}`);
          }
        });
      });
    }
    
    if (acceptedFiles.length > 0) {
      onDrop(acceptedFiles);
    }
  }, [onDrop, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept,
    multiple,
    disabled,
    maxSize,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'
      } ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-2">
        <Upload className={`w-8 h-8 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
        {isDragActive ? (
          <p className="text-blue-500 font-medium">Drop the files here...</p>
        ) : (
          <div className="space-y-1">
            <p className="text-gray-700 font-medium">Drag & drop files here, or click to select</p>
            <p className="text-gray-500 text-xs">Supported formats: PDF, DOCX, TXT (Max {maxSize / (1024 * 1024)}MB)</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
