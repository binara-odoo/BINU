import { Signal } from "@preact/signals";

interface FileData {
  base64: string;
  name: string;
  type: string;
}

type FormDataValue = string | string[] | FileData[];

interface FormData {
  [key: string]: FormDataValue;
}

interface FileInputProps {
  id: string;
  translations: {
    images_drag: string;
    images_or: string;
    images_button: string;
    images_no_files: string;
    images_count_single: string;
    images_count_multiple: string;
  };
  formData: Signal<FormData>;
  onChange: (e: Event) => void;
}

export default function FileInput({ id, translations, formData, onChange }: FileInputProps) {
  const handleButtonClick = () => {
    // Find the hidden input and trigger its click
    const input = document.querySelector(`input[name="${id}"]`) as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const label = e.currentTarget as HTMLLabelElement;
    label.classList.add('bg-[#8E8F1D]/5');
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const label = e.currentTarget as HTMLLabelElement;
    label.classList.remove('bg-[#8E8F1D]/5');
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const label = e.currentTarget as HTMLLabelElement;
    label.classList.remove('bg-[#8E8F1D]/5');
    
    if (!e.dataTransfer?.files) return;

    // Convert dropped files to FileData and add them to existing files
    Array.from(e.dataTransfer.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        // Add new file to existing files
        const currentFiles = formData.value[id] as FileData[] || [];
        formData.value = {
          ...formData.value,
          [id]: [...currentFiles, {
            base64: base64String,
            name: file.name,
            type: file.type
          }]
        };
        // Notify parent form of the change
        onChange(new Event('change'));
      };
      reader.readAsDataURL(file);
    });
  };

  const processFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        // Add new file to existing files
        const currentFiles = formData.value[id] as FileData[] || [];
        formData.value = {
          ...formData.value,
          [id]: [...currentFiles, {
            base64: base64String,
            name: file.name,
            type: file.type
          }]
        };
        // Notify parent form of the change
        onChange(new Event('change'));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDelete = (index: number) => {
    const currentFiles = formData.value[id] as FileData[];
    if (!currentFiles) return;

    // Remove the file at the specified index
    const newFiles = [...currentFiles];
    newFiles.splice(index, 1);
    
    // Update formData with the new array
    formData.value = {
      ...formData.value,
      [id]: newFiles.length > 0 ? newFiles : []
    };
    // Notify parent form of the change
    onChange(new Event('change'));
  };

  const getFileIcon = (fileType: string, fileName: string = '') => {
    const extension = fileName.toLowerCase().split('.').pop() || '';
    
    // PDF files
    if (fileType.includes('pdf') || extension === 'pdf') {
      return (
        <svg class="h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      );
    }

    // Word files
    const wordTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (wordTypes.some(type => fileType.includes(type)) || ['doc', 'docx'].includes(extension)) {
      return (
        <svg class="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
      );
    }

    // Excel files
    const excelTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
      'text/csv'
    ];
    if (excelTypes.some(type => fileType.includes(type)) || ['xls', 'xlsx', 'csv'].includes(extension)) {
      return (
        <svg class="h-8 w-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="8" y1="13" x2="16" y2="13"></line>
          <line x1="8" y1="17" x2="16" y2="17"></line>
          <rect x="8" y="12" width="8" height="6"></rect>
        </svg>
      );
    }

    // PowerPoint files
    const powerPointTypes = [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    if (powerPointTypes.some(type => fileType.includes(type)) || ['ppt', 'pptx'].includes(extension)) {
      return (
        <svg class="h-8 w-8 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <circle cx="12" cy="14" r="4"></circle>
          <path d="M12 10v8"></path>
        </svg>
      );
    }

    // Default document icon
    return (
      <svg class="h-8 w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
      </svg>
    );
  };

  const getFilePreview = (fileData: FileData) => {
    // Check if the file is an image
    if (fileData.type.startsWith('image/')) {
      return (
        <img 
          src={`data:${fileData.type};base64,${fileData.base64}`}
          alt={fileData.name}
          class="w-full h-full object-cover"
        />
      );
    }
    
    // For non-image files, show the document icon
    return getFileIcon(fileData.type, fileData.name);
  };

  const hasFiles = formData.value[id] && Array.isArray(formData.value[id]) && (formData.value[id] as FileData[]).length > 0;
  const files = hasFiles ? formData.value[id] as FileData[] : [];

  return (
    <div class="relative">
      <div class="input-field flex items-center justify-center w-full">
        <label 
          class="group flex flex-col items-center justify-center w-full h-auto min-h-[10rem] border-2 border-[#8E8F1D] border-dashed rounded-lg cursor-pointer hover:bg-[#8E8F1D]/5 transition-all duration-300"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!hasFiles ? (
            <div class="flex flex-col items-center justify-center px-4 py-3">
              <svg class="w-7 h-7 mb-2 text-[#8E8F1D] group-hover:text-[#6b6d16] transition-colors duration-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              <p class="mb-1 text-sm text-[#8E8F1D] font-medium group-hover:text-[#6b6d16] transition-colors duration-300">
                <span class="font-semibold">{translations.images_drag}</span>
              </p>
              <p class="text-xs text-[#8E8F1D]/80 mb-2 group-hover:text-[#6b6d16]/80 transition-colors duration-300">
                {translations.images_or}
              </p>
              <button 
                type="button" 
                onClick={handleButtonClick}
                class="px-3 py-1.5 text-sm font-medium text-white bg-[#8E8F1D] rounded-lg hover:bg-[#6b6d16] focus:outline-none focus:ring-2 focus:ring-[#8E8F1D] focus:ring-offset-2 transition-all duration-300"
              >
                {translations.images_button}
              </button>
            </div>
          ) : (
            <div class="flex flex-col items-center justify-center p-4 w-full">
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4 w-full">
                {files.map((fileData, index) => (
                  <div 
                    key={index} 
                    class="relative group/item aspect-square bg-[#8E8F1D]/5 rounded-lg overflow-hidden"
                  >
                    <div class="w-full h-full flex flex-col items-center justify-center p-4">
                      {getFilePreview(fileData)}
                      <span class="mt-2 text-xs text-gray-500 truncate w-full text-center">
                        {fileData.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(index);
                      }}
                      class="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <div 
                  class="aspect-square bg-[#8E8F1D]/5 rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#8E8F1D]/10 transition-all duration-300"
                  onClick={handleButtonClick}
                >
                  <svg class="w-6 h-6 text-[#8E8F1D]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
            </div>
          )}
          <input
            type="file"
            name={id}
            onChange={(e) => {
              const input = e.target as HTMLInputElement;
              if (input.files && input.files.length > 0) {
                processFiles(input.files);
                // Clear input value to allow selecting the same file again
                input.value = '';
              }
            }}
            multiple
            class="hidden"
            accept="*/*"
          />
        </label>
      </div>
      <div class="mt-2 text-sm text-[#8E8F1D]">
        {hasFiles ? 
          (files.length === 1 ? 
            translations.images_count_single :
            translations.images_count_multiple.replace('{count}', files.length.toString())
          )
          : translations.images_no_files}
      </div>
    </div>
  );
} 