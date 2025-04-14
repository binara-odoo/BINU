import { useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";

interface OdooProjects {
  id: number;
  name: string;
  partner_id: [number, string];
  date_start: string;
  date: string;
  tag_ids: number[];
}

export default function SelectSystemIsland({ lang}: {lang: string}){
    const systems = [ "Odoo" ];
    const odooProjects = useSignal<OdooProjects[]>([]);
    const isLoading = useSignal(false);
    const error = useSignal("");

    useEffect(() => {
        isLoading.value = true;
        fetch("/api/odoo-projects")
            .then((res) => res.json())
            .then((data) => {
                if(data.success && data.data){
                    odooProjects.value = data.data;
                } else {
                    error.value = data.error || "Error al cargar los proyectos";
                }
            })
            .catch(() => {
                error.value = "Error al cargar los proyectos";
            })
            .finally(() => {
                isLoading.value = false;
            })
    }, []);

    return (
        <div class = "form-container shadow-lg rounded-lg text-[#8E8F1D] p-4 sm:p-6 md:p-8">
            {systems.map((system) => (
                <div
                    key = { system}
                    class = "p-4 hover:bg-[#121212] cursor-pointer rounded-lg"
                >
                    <a 
                      href = {`/specs/system-options?system=${system}&lang=${lang}`}
                      class = "block"
                    >
                        { system }
                    </a>
                </div>
            ))}

            {odooProjects.value.map((project) => (
                <div
                    key = { project.id }
                    class = "p-4 hover:bg-[#121212] cursor-pointer rounded-lg"
                >
                    <a 
                      href = {`/specs/system-options?system=${project.name}&lang=${lang}`}
                      class = "block"
                    >
                        { project.name }
                    </a>
                </div>
            ))}
        </div>
    )
}