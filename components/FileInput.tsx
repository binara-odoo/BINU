import { Signal } from "@preact/signals";

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
  formData: Signal<Record<string, string | string[]>>;
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

    // Convert dropped files to base64 and add them to existing files
    Array.from(e.dataTransfer.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        // Add new file to existing files
        const currentFiles = formData.value[id] as string[] || [];
        formData.value = {
          ...formData.value,
          [id]: [...currentFiles, base64String]
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
        const currentFiles = formData.value[id] as string[] || [];
        formData.value = {
          ...formData.value,
          [id]: [...currentFiles, base64String]
        };
        // Notify parent form of the change
        onChange(new Event('change'));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDelete = (index: number) => {
    const currentFiles = formData.value[id] as string[];
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

  const hasFiles = formData.value[id] && Array.isArray(formData.value[id]) && (formData.value[id] as string[]).length > 0;
  const files = hasFiles ? formData.value[id] as string[] : [];

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
                {files.map((base64Data, index) => (
                  <div 
                    key={index} 
                    class="relative group/item aspect-square bg-[#8E8F1D]/5 rounded-lg overflow-hidden"
                  >
                    <img 
                      src={`data:image/jpeg;base64,${base64Data}`}
                      alt={`Uploaded image ${index + 1}`}
                      class="w-full h-full object-cover"
                    />
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
            accept="image/*"
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