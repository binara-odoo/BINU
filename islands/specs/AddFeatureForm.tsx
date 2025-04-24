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

interface OdooProject {
  id: number;
  name: string;
  partner_id: [number, string];
  date_start: string;
  date: string;
  user_id: [number, string];
  tag_ids: number[];
}

interface FileData {
  base64: string;
  name: string;
  type: string;
}

type FormDataValue = string | string[] | FileData[];

interface FormData {
  [key: string]: FormDataValue;
}

interface AddFeatureFormProps {
  questions: Question[];
  buttonText: string;
  systemName: string;
  translations: Translations;
}

// Helper function to safely get string value from form data
const getStringValue = (value: FormDataValue): string => {
  if (typeof value === 'string') return value;
  return '';
};

export default function AddFeatureForm({
  questions,
  buttonText,
  systemName,
  translations
}: AddFeatureFormProps) {
  const isSubmitting = useSignal(false);
  const error = useSignal("");
  const success = useSignal("");
  const projects = useSignal<OdooProject[]>([]);
  const isLoading = useSignal(false);
  const selectedProjectId = useSignal<string>("");
  const selectedProjectName = useSignal<string>("");
  const formData = useSignal<FormData>({
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
        // Create an array to store file data
        const fileDataArray: FileData[] = [];
        
        // Process each file
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const reader = new FileReader();
          
          reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            fileDataArray.push({
              base64: base64String,
              name: file.name,
              type: file.type
            });
            
            // When all files are processed, update the form data
            if (fileDataArray.length === files.length) {
              formData.value = { 
                ...formData.value, 
                [target.name]: fileDataArray 
              };
            }
          };
          
          reader.readAsDataURL(file);
        }
      }
    } else {
      // For all other inputs including select
      formData.value = { ...formData.value, [target.name]: target.value };
    }
  };

  const handleProjectChange = (e: Event) => {
    const select = e.target as HTMLSelectElement;
    const selectedOption = select.options[select.selectedIndex];
    
    // Get the project ID and name from the selected option
    const projectId = select.value;
    const projectName = selectedOption.text;
    
    // Update the signals
    selectedProjectId.value = projectId;
    selectedProjectName.value = projectName;
    
    // Also update the formData to ensure it's captured
    formData.value = { 
      ...formData.value, 
      project: projectId,
      projectName: projectName
    };
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!IS_BROWSER) return;

    isSubmitting.value = true;
    error.value = "";
    success.value = "";

    const form = e.target as HTMLFormElement;
    const formDataObj = new FormData(form);

    // Get the selected project ID and name
    const projectId = selectedProjectId.value || "";
    let projectName = selectedProjectName.value || "";
    
    // For non-Odoo systems, use the system name as the project name
    if (systemName !== "Odoo") {
      projectName = systemName;
    }
    
    // Ensure projectName is a string
    projectName = String(projectName);
    
    // Validate project ID only for Odoo
    if (!projectId && systemName === "Odoo") {
      error.value = "Por favor seleccione un proyecto";
      isSubmitting.value = false;
      return;
    }

    // Ensure projectId is not empty for any system
    if (!projectId) {
      error.value = "El ID del proyecto es requerido";
      isSubmitting.value = false;
      return;
    }

    // Map form fields to the new API structure
    const newFeatureData = {
      type: "newFeature",
      projectId: projectId,
      projectName: projectName,
      systemName: systemName,
      feature: formData.value["feature"] as string || formDataObj.get("feature") as string,
      expected: formData.value["why"] as string || formDataObj.get("why") as string,
      current: formData.value["users"] as string || formDataObj.get("users") as string,
      steps: formData.value["requirements"] as string || formDataObj.get("requirements") as string,
      priority: formData.value["priority"] as string || formDataObj.get("priority") as string || "2",
      images: formData.value["images"] ? 
        (formData.value["images"] as FileData[]).map(fileData => ({
          name: fileData.name,
          type: fileData.type,
          datas: fileData.base64,
          res_model: "project.task"
        })) : 
        null
    };
    
    try {
      const response = await fetch("/api/odoo-projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFeatureData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || translations.add_feature.project_error);
      }

      success.value = translations.add_feature.success_message || "New feature submitted successfully!";
      form.reset();
      formData.value = { priority: "2", images: [] }; // Reset to default
    } catch (err) {
      console.error("Error submitting form:", err);
      error.value = err instanceof Error ? err.message : translations.add_feature.generic_error;
    } finally {
      isSubmitting.value = false;
    }
  };

  useEffect(() => {
    // Always set the system name in the formData
    formData.value = { 
      ...formData.value, 
      systemName: systemName
    };
    
    // If the system is Odoo, fetch projects
    if (systemName === "Odoo") {
      isLoading.value = true;
      fetch("/api/odoo-projects")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.odooProjects) {
            projects.value = data.odooProjects;
            
            // If we have projects, set the first one as default
            if (data.odooProjects.length > 0) {
              const firstProject = data.odooProjects[0];
              selectedProjectId.value = firstProject.id.toString();
              selectedProjectName.value = firstProject.name;
              formData.value = { 
                ...formData.value, 
                project: firstProject.id.toString(),
                projectName: firstProject.name
              };
            }
          } else {
            console.error(translations.add_feature.project_error, data.error);
            error.value = data.error || translations.add_feature.project_error;
          }
        })
        .catch((err) => {
          console.error(translations.add_feature.project_error, err);
          error.value = translations.add_feature.project_error;
        })
        .finally(() => {
          isLoading.value = false;
        });
    } else {
      // For non-Odoo systems, try to find a project that matches the system name
      isLoading.value = true;
      fetch("/api/odoo-projects")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            // Search for a project that matches the system name
            const matchingProject = data.data.find(
              (project: OdooProject) => project.name === systemName
            );
            
            if (matchingProject) {
              selectedProjectId.value = matchingProject.id.toString();
              selectedProjectName.value = matchingProject.name;
              formData.value = { 
                ...formData.value, 
                project: matchingProject.id.toString(),
                projectName: matchingProject.name
              };
            } else {
              console.log("No matching project found, using system name");
              selectedProjectId.value = "0"; // Use a default ID if no match found
              selectedProjectName.value = systemName;
              formData.value = { 
                ...formData.value, 
                project: "0", // Use a default ID if no match found
                projectName: systemName
              };
            }
          } else {
            console.log("No projects data available, using system name");
            selectedProjectId.value = "0"; // Use a default ID if no data
            selectedProjectName.value = systemName;
            formData.value = { 
              ...formData.value, 
              project: "0", // Use a default ID if no data
              projectName: systemName
            };
          }
        })
        .catch((err) => {
          console.error("Error fetching projects:", err);
          console.log("Using system name due to error");
          selectedProjectId.value = "0"; // Use a default ID on error
          selectedProjectName.value = systemName;
          formData.value = { 
            ...formData.value, 
            project: "0", // Use a default ID on error
            projectName: systemName
          };
        })
        .finally(() => {
          isLoading.value = false;
        });
    }
  }, [systemName, translations]);

  return (
    <form onSubmit={handleSubmit} class="space-y-6 md:space-y-8">
      {questions.map((question) => (
        <div key={question.id} class="space-y-2 md:space-y-3">
          {systemName === "Odoo" && question.id === "feature" && (
            <div class="space-y-2 md:space-y-3">
              <label class="block text-sm md:text-base lg:text-lg font-medium">
                {translations.add_feature.select_project}
              </label>
              {isLoading.value ? (
                <div class="input-field w-full p-2 md:p-3 lg:p-4 border rounded-md text-gray-500 bg-gray-100 border-gray-300 text-sm md:text-base">
                  {translations.add_feature.loading_projects}
                </div>
              ) : (
                <select
                  name="project"
                  required={systemName === "Odoo"}
                  onChange={handleProjectChange}
                  value={selectedProjectId.value}
                  class="input-field w-full p-2 md:p-3 lg:p-4 border rounded-md text-black bg-white border-gray-700 focus:border-[#8E8F1D] focus:outline-none focus:ring-1 focus:ring-[#8E8F1D] transition-all duration-300 text-sm md:text-base"
                >
                  <option value="" disabled={systemName === "Odoo"}>{translations.fix_system.project_placeholder}</option>
                  {projects.value.length > 0 ? (
                    projects.value.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No hay proyectos disponibles</option>
                  )}
                </select>
              )}
            </div>
          )}

          <label class="block text-sm md:text-base lg:text-lg font-medium">
            {question.label}
          </label>
          {question.type === "textarea" ? (
            <textarea
              name={question.id}
              value={getStringValue(formData.value[question.id])}
              onInput={handleChange}
              required
              class="input-field w-full p-2 md:p-3 lg:p-4 border rounded-md min-h-[100px] md:min-h-[150px] lg:min-h-[200px] text-black bg-white border-gray-700 focus:border-[#8E8F1D] focus:outline-none focus:ring-1 focus:ring-[#8E8F1D] transition-all duration-300 text-sm md:text-base"
            />
          ) : question.type === "radio" && question.id === "priority" ? (
            <PriorityRadioGroup
              value={formData.value[question.id] as string || "medium"}
              onChange={handleChange}
              translations={translations}
            />
          ) : question.type === "file" ? (
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
          ) : (
            <input
              type={question.type}
              name={question.id}
              value={getStringValue(formData.value[question.id])}
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
          {isSubmitting.value ? translations.add_feature.submitting : buttonText}
        </button>
      </div>
    </form>
  );
}