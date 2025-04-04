import { useState, useEffect } from "preact/hooks";

interface NewSystemFormProps {
  questions: Array<{
    id: string;
    label: string;
    type: string;
  }>;
  buttonText: string;
}

interface OdooUser {
  id: number;
  name: string;
}

export default function NewSystemForm({ questions, buttonText }: NewSystemFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<OdooUser[]>([]);

  useEffect(() => {
    // Fetch users when component mounts
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/odoo-users");
        if (!response.ok) {
          throw new Error("Error fetching users");
        }
        const result = await response.json();
        if (result.success && result.data) {
          setUsers(result.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    setFormData((prev) => ({ ...prev, [target.name]: target.value }));
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
  
    try {
      const odooFormData = {
        x_name: formData.new_system_name,
        x_studio_new_system_name: formData.new_system_name,
        x_studio_users: formData.users,
        x_studio_budget: formData.budget,
        x_studio_date_start: formData.date,
        x_studio_purpouse: formData.purpose,
        x_studio_timeline: formData.timeline,
        x_studio_features: formData.features,
        x_studio_user_id: parseInt(formData.responsible) || 2
      };

      const response = await fetch("/api/odoo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "x_new_system",
          data: odooFormData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en la petición');
      }
  
      const result = await response.json();
  
      if (result.error) {
        throw new Error(result.error);
      }

      setMessage("✅ Datos guardados con éxito en Odoo.");
      setFormData({});
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMessage(`❌ ${errorMessage}`);
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-6">
      {questions.map((question) => (
        <div key={question.id} class="space-y-2">
          <label class="block text-sm font-medium text-white">
            {question.label}
          </label>
          {question.type === "textarea" ? (
            <textarea
              name={question.id}
              value={formData[question.id] || ""}
              onInput={handleChange}
              class="w-full p-2 border rounded-md min-h-[100px] text-white bg-[rgba(16,13,20,0.741)] border-gray-700 focus:border-[#B4E3FF] focus:outline-none focus:ring-1 focus:ring-[#B4E3FF] transition-all duration-300"
            />
          ) : question.type === "selector" ? (
            <select
              name={question.id}
              value={formData[question.id] || ""}
              onChange={handleChange}
              class="w-full p-2 border rounded-md text-white bg-[rgba(16,13,20,0.741)] border-gray-700 focus:border-[#B4E3FF] focus:outline-none focus:ring-1 focus:ring-[#B4E3FF] transition-all duration-300"
            >
              <option value="">Seleccionar usuario</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={question.type}
              name={question.id}
              value={formData[question.id] || ""}
              onInput={handleChange}
              class="w-full p-2 border rounded-md text-white bg-[rgba(16,13,20,0.741)] border-gray-700 focus:border-[#B4E3FF] focus:outline-none focus:ring-1 focus:ring-[#B4E3FF] transition-all duration-300"
            />
          )}
        </div>
      ))}
      <div class="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          class={`px-4 py-2 rounded-md ${
            loading
              ? "bg-gray-500"
              : "bg-blue-300 hover:bg-blue-600 text-white"
          }`}
        >
          {loading ? "Guardando..." : buttonText}
        </button>
      </div>
      {message && <div class="mt-4 text-center">{message}</div>}
    </form>
  );
} 