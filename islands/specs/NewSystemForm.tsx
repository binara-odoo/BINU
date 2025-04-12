import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { Translations } from "../../types/translations.ts";
import Alert from "../../components/Alert.tsx";
import FileInput from "../../components/FileInput.tsx";
import PriorityRadioGroup from "../../components/PriorityRadioGroup.tsx";

interface Question {
  id: string;
  label: string;
  type: string;
}

interface NewSystemFormProps {
  questions: Question[];
  buttonText: string;
  translations: Translations;
}

interface OdooUser {
  id: number;
  name: string;
}

interface OdooProject {
  id: number;
  name: string;
}

export default function NewSystemForm(
  { questions, buttonText, translations }: NewSystemFormProps,
) {
  const isSubmitting = useSignal(false);
  const error = useSignal("");
  const success = useSignal("");
  const users = useSignal<OdooUser[]>([]);
  const projects = useSignal<OdooProject[]>([]);
  const isLoading = useSignal(false);
  const isLoadingProjects = useSignal(false);
  const formData = useSignal<Record<string, string | string[]>>({
    priority: "2", // Default priority value (medium)
    images: [] // Initialize images array
  });

  const handleChange = (e: Event) => {
    const target = e.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;
    
    if (target.type === "radio") {
      formData.value = { ...formData.value, [target.name]: target.value };
    } else if (target.type === "file") {
      const fileInput = target as HTMLInputElement;
      const files = fileInput.files;
      
      if (files && files.length > 0) {
        // Create an array to store base64 strings
        const base64Strings: string[] = [];
        
        // Process each file
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const reader = new FileReader();
          
          reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            base64Strings.push(base64String);
            
            // When all files are processed, update the form data
            if (base64Strings.length === files.length) {
              formData.value = { 
                ...formData.value, 
                [target.name]: base64Strings 
              };
            }
          };
          
          reader.readAsDataURL(file);
        }
      }
    } else {
      formData.value = { ...formData.value, [target.name]: target.value };
    }
  };

  useEffect(() => {
    isLoading.value = true;
    fetch("/api/odoo-users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          users.value = data.data || [];
        } else {
          error.value = data.error || "Error al cargar usuarios";
        }
      })
      .catch(() => {
        error.value = "Error al cargar usuarios";
      })
      .finally(() => {
        isLoading.value = false;
      });
  }, []);

  useEffect(() => {
    isLoadingProjects.value = true;
    fetch("/api/odoo-projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          // Check if we have both data and odooProjects
          if (data.odooProjects) {
            // Combine both project sources if they exist
            projects.value = [...(data.odooProjects || []), ...(data.data || [])];
          } else {
            // Use just data if odooProjects doesn't exist
            projects.value = data.data || [];
          }
        } else {
          error.value = data.error || "Error al cargar proyectos";
        }
      })
      .catch(() => {
        error.value = "Error al cargar proyectos";
      })
      .finally(() => {
        isLoadingProjects.value = false;
      });
  }, []);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    if (!IS_BROWSER) return;

    isSubmitting.value = true;
    error.value = "";
    success.value = "";

    // Client-side validation
    if (!formData.value.new_system_name) {
      error.value = "❌ System name is required";
      isSubmitting.value = false;
      return;
    }

    if (!formData.value.responsible) {
      error.value = "❌ Responsible person is required";
      isSubmitting.value = false;
      return;
    }

    try {
      // Create a FormData object
      const formDataObj = new FormData();
      
      // Add all form fields to the FormData
      Object.entries(formData.value).forEach(([key, value]) => {
        if (key === "images" && Array.isArray(value)) {
          // For images, we need to format them according to Odoo's ir.attachment model
          value.forEach((base64Data, index) => {
            // Format: name, type, datas, res_model, res_id
            formDataObj.append(`attachment_${index}_name`, `image_${index}.jpg`);
            formDataObj.append(`attachment_${index}_type`, 'binary');
            formDataObj.append(`attachment_${index}_datas`, base64Data);
            formDataObj.append(`attachment_${index}_res_model`, 'project.task');
            // We don't have the res_id yet, it will be set on the server
          });
        } else if (Array.isArray(value)) {
          // For other arrays, add each item with the same key
          value.forEach((item, index) => {
            formDataObj.append(`${key}[${index}]`, item);
          });
        } else if (typeof value === 'string') {
          formDataObj.append(key, value);
        }
      });
      
      // Submit the form to the server-side handler
      const response = await fetch("/specs/new-system", {
        method: "POST",
        body: formDataObj,
      });

      // Check if the response is a redirect
      if (response.redirected) {
        // Show success message before redirecting
        success.value = `✅ ${translations.new_system.success_message}`;
        
        // Wait for 2 seconds to show the success message before redirecting
        setTimeout(() => {
          globalThis.location.href = response.url;
        }, 2000);
        
        return;
      }

      if (!response.ok) {
        throw new Error("Error submitting form");
      }

      // If we get here, it means the redirect didn't happen
      success.value = `✅ ${translations.new_system.success_message}`;
      formData.value = {};
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : "";
      error.value = `❌ ${errorMessage}`;
    } finally {
      isSubmitting.value = false;
    }
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-6 md:space-y-8">
      {questions.map((question) => (
        <div key={question.id} class="space-y-2 md:space-y-3">
          <label class="block text-sm md:text-base lg:text-lg font-medium">
            {question.label}
          </label>
          {question.type === "textarea" ? (
            <textarea
              name={question.id}
              value={formData.value[question.id] || ""}
              onInput={handleChange}
              required
              class="input-field w-full p-2 md:p-3 lg:p-4 border rounded-md min-h-[100px] md:min-h-[150px] lg:min-h-[200px] text-black bg-white border-gray-700 focus:border-[#8E8F1D] focus:outline-none focus:ring-1 focus:ring-[#8E8F1D] transition-all duration-300 text-sm md:text-base"
            />
          ) : question.type === "selector" && question.id === "responsible"
            ? (
              isLoading.value
                ? (
                  <div class="input-field w-full p-2 md:p-3 lg:p-4 border rounded-md text-gray-500 bg-gray-100 border-gray-300 text-sm md:text-base">
                    {translations.new_system.loading_users}
                  </div>
                )
                : (
                  <select
                    name={question.id}
                    value={formData.value[question.id] || ""}
                    onChange={handleChange}
                    class="input-field w-full p-2 md:p-3 lg:p-4 border rounded-md text-black bg-white border-gray-700 focus:border-[#8E8F1D] focus:outline-none focus:ring-1 focus:ring-[#8E8F1D] transition-all duration-300 text-sm md:text-base"
                  >
                    <option value="" disabled selected>{translations.new_system.select_user}</option>
                    {users.value.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                )
            )
            : question.type === "selector" && question.id === "related_systems"
            ? (
              isLoadingProjects.value
                ? (
                  <div class="input-field w-full p-2 md:p-3 lg:p-4 border rounded-md text-gray-500 bg-gray-100 border-gray-300 text-sm md:text-base">
                    {translations.new_system.loading_projects}
                  </div>
                )
                : (
                  <select
                    name={question.id}
                    value={formData.value[question.id] || ""}
                    onChange={handleChange}
                    class="input-field w-full p-2 md:p-3 lg:p-4 border rounded-md text-black bg-white border-gray-700 focus:border-[#8E8F1D] focus:outline-none focus:ring-1 focus:ring-[#8E8F1D] transition-all duration-300 text-sm md:text-base"
                  >
                    <option value="" disabled selected>{translations.new_system.select_project}</option>
                    {projects.value.map((project) => (
                      <option key={project.id} value={project.name}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                )
            )
            : question.type === "radio" && question.id === "priority"
            ? (
              <PriorityRadioGroup
                value={formData.value[question.id] as string || "medium"}
                onChange={handleChange}
                translations={translations}
              />
            )
            : question.type === "file"
            ? (
              <FileInput
                id={question.id}
                translations={{
                  images_drag: translations.add_feature.images_drag,
                  images_or: translations.add_feature.images_or,
                  images_button: translations.add_feature.images_button,
                  images_no_files: translations.add_feature.images_no_files,
                  images_count_single: translations.add_feature.images_count_single,
                  images_count_multiple: translations.add_feature.images_count_multiple,
                }}
                formData={formData}
                onChange={handleChange}
              />
            )
            : question.type === "date"
            ? (
              <input
                type="date"
                name={question.id}
                required
                class="input-field w-full p-2 md:p-3 lg:p-4 border rounded-md text-gray-700 bg-white border-gray-300 text-sm md:text-base"
                min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
              />
            )
            : (
              <input
                type={question.type}
                name={question.id}
                value={formData.value[question.id] || ""}
                onInput={handleChange}
                required
                class="input-field w-full p-2 md:p-3 lg:p-4 border rounded-md text-black bg-white border-gray-700 focus:border-[#8E8F1D] focus:outline-none focus:ring-1 focus:ring-[#8E8F1D] transition-all duration-300 text-sm md:text-base"
              />
            )}
        </div>
      ))}

      {error.value && (
        <Alert 
          type="error" 
          title="Error" 
          message={error.value} 
        />
      )}

      {success.value && (
        <Alert 
          type="success" 
          title="Success" 
          message={success.value} 
        />
      )}

      <div class="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting.value}
          class="px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 text-white rounded-md bg-[#8E8F1D] hover:bg-[#6b6d16] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 text-sm md:text-base lg:text-lg"
        >
          {isSubmitting.value ? translations.new_system.submitting : buttonText}
        </button>
      </div>
    </form>
  );
}
