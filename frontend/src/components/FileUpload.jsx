import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

const FileUpload = ({ onDrop, accept, multiple = false, disabled = false }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    disabled,
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
            <p className="text-gray-500 text-xs">Supported formats: PDF, DOCX, TXT</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
