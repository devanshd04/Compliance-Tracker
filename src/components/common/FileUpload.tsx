import React, { useRef } from 'react';
import { Upload, File, X } from 'lucide-react';
import { TaskFile } from '../../types';

interface FileUploadProps {
  taskId: string;
  files: TaskFile[];
  onFilesChange: (files: TaskFile[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  compact?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  taskId,
  files,
  onFilesChange,
  maxFiles = 5,
  acceptedTypes = ['.pdf', '.xlsx', '.xls', '.doc', '.docx'],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!taskId) {
      console.warn('No taskId provided for file upload.');
      return;
    }

    for (const file of selectedFiles.slice(0, maxFiles - files.length)) {
      if (file.size === 0) {
        console.warn(`Skipping empty file: ${file.name}`);
        continue;
      }

      console.log('📤 Uploading:', file.name, file.size, file.type);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch(`/api/tasks/${taskId}/files`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: formData,
        });

        if (response.ok) {
          const uploadedFile = await response.json();

          //  Normalize to TaskFile shape
          const normalizedFile: TaskFile = {
            id: uploadedFile.id || crypto.randomUUID(),
            fileName: uploadedFile.fileName || file.name,
            url: uploadedFile.filePath || '',
            uploadedBy: uploadedFile.uploadedByUserName || 'Unknown',
            uploadedAt: uploadedFile.uploadedAt || new Date(),
            rawFile: file,
          };

          onFilesChange([...files, normalizedFile]);
          console.log(' Uploaded & saved:', normalizedFile);
        } else {
          const errorText = await response.text();
          console.error(`❌ Upload failed: ${file.name}`, errorText);
        }
      } catch (error) {
        console.error(`❌ Error uploading ${file.name}:`, error);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    onFilesChange(updatedFiles);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Attachments ({files.length}/{maxFiles})
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={files.length >= maxFiles}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={file.id || `${file.fileName}-${index}`} // Prevent key warning
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md border"
            >
              <div className="flex items-center gap-3">
                <File className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.fileName}</p>
                  <p className="text-xs text-gray-500">
                    Uploaded on {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
