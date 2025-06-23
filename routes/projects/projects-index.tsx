import { Translations } from "../../types/translations.ts";
import Navbar from "../../islands/navbar/Navbar.tsx";
import { LoadTranslations } from "../../utils/i18n.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { decodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

interface OdooProject {
  id: number;
  name: string;
  partner_id: [number, string];
  date_start: string;
  date: string;
  tag_ids: number[];
  stage?: string; // To Do, In Progress, Done, Cancelled
  taskCount?: number;
}

interface ProjectsIndexProps {
  LoggedIn: boolean;
  Translations: Translations;
  lang: string;
  userInfo?: {
    name?: string;
    email?: string;
    picture?: string;
  };
  projects: OdooProject[];
}

export const handler: Handlers<ProjectsIndexProps> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const lang = url.searchParams.get("lang") || "es";
    const translations = await LoadTranslations(lang);

    const cookies = req.headers.get("cookie") || "";
    const sessionCookie = cookies.split("; ").find((c) =>
      c.startsWith("session=")
    );
    let session = null;

    if (sessionCookie) {
      try {
        const encodedSession = sessionCookie.split("=")[1];
        const decodedSession = new TextDecoder().decode(
          decodeBase64(encodedSession),
        );
        session = JSON.parse(decodedSession);
      } catch (error) {
        console.error("Error decoding session:", error);
      }
    }

    // Redirect to login if not authenticated
    if (!session?.loggedIn) {
      const loginUrl = new URL("/account/login", url.origin);
      loginUrl.searchParams.set("lang", lang);
      return new Response("", {
        status: 303,
        headers: { Location: loginUrl.toString() },
      });
    }

    // Fetch projects from Odoo API
    let projects: OdooProject[] = [];
    try {
      const apiUrl = `${url.origin}/api/odoo-projects`;
      const apiRes = await fetch(apiUrl, {
        headers: { cookie: cookies },
      });
      const apiData = await apiRes.json();
      // Unificar todos los proyectos (data y odooProjects)
      projects = [
        ...(apiData.data || []),
        ...(apiData.odooProjects || []),
      ];
    } catch (err) {
      console.error("Error fetching Odoo projects:", err);
    }

    // Simular stages (en Odoo real esto vendría de un campo, aquí lo asignamos por demo)
    const stages = ["To Do", "In Progress", "Done", "Cancelled"];
    projects = projects.map((p, i) => ({
      ...p,
      stage: stages[i % stages.length],
      // taskCount: undefined (se puede mejorar con fetch paralelo si se requiere)
    }));

    return ctx.render({
      LoggedIn: Boolean(session?.loggedIn),
      Translations: translations,
      lang: lang,
      userInfo: {
        name: session.name,
        email: session.email,
        picture: session.picture,
      },
      projects,
    });
  },
};

export default function ProjectsIndex({ data }: PageProps<ProjectsIndexProps>) {
  // Agrupar proyectos por stage
  const columns = [
    { key: "To Do", label: "To Do", color: "border-red-500", bar: "bg-red-500", border: "border-red-500" },
    { key: "In Progress", label: "In Progress", color: "border-green-500", bar: "bg-green-500", border: "border-green-500" },
    { key: "Done", label: "Done", color: "border-blue-500", bar: "bg-blue-500", border: "border-blue-500" },
    { key: "Cancelled", label: "Cancelled", color: "border-gray-500", bar: "bg-gray-500", border: "border-gray-500" },
  ];
  const projectsByStage: Record<string, OdooProject[]> = {};
  columns.forEach(col => {
    projectsByStage[col.key] = data.projects.filter(p => p.stage === col.key);
  });

  return (
    <div class="relative min-h-screen">
      <div class="flex flex-col relative z-10 min-h-screen backdrop-blur-md text-white">
        <Navbar
          LoggedIn={data.LoggedIn}
          Translations={data.Translations}
          lang={data.lang}
          userInfo={data.userInfo}
        />
        <main class="flex-1 pt-20">
          <div class="flex flex-col md:flex-row gap-4 px-2 md:px-8 py-6">
            {columns.map((col) => (
              <div key={col.key} class={`flex-1 min-w-[260px] bg-white dark:bg-[#18181b] rounded-lg border ${col.border} p-0 flex flex-col`}>
                {/* Barra de color de estado */}
                <div class={`h-1 w-full rounded-t-lg ${col.bar}`}></div>
                {/* Encabezado de columna */}
                <div class="flex items-center justify-between px-4 py-3 border-b border-[#e5e7eb] dark:border-[#23232a] bg-white dark:bg-[#23232a]">
                  <span class="font-semibold text-base text-black dark:text-white">{col.label}</span>
                  <span class="text-xs bg-[#f3f4f6] dark:bg-[#23232a] text-gray-700 dark:text-gray-300 rounded-full px-2 py-0.5">{projectsByStage[col.key].length}</span>
                </div>
                <div class="flex-1 flex flex-col gap-2 p-2 overflow-y-auto min-h-[80px] bg-white dark:bg-[#18181b]">
                  {projectsByStage[col.key].length === 0 ? (
                    <div class="text-gray-500 dark:text-gray-400 text-xs italic text-center py-4">No projects</div>
                  ) : (
                    projectsByStage[col.key].map((project) => (
                      <div class="rounded-md border border-[#e5e7eb] dark:border-[#23232a] bg-white dark:bg-[#23232a]/80 hover:bg-gray-100 dark:hover:bg-[#23232a]/95 transition-colors px-3 py-2 flex flex-col gap-1 cursor-pointer">
                        <div class="flex items-center gap-2">
                          <span class="font-medium text-black dark:text-[#e5e7eb] truncate max-w-[140px]">{project.name}</span>
                          {project.partner_id && project.partner_id[1] && (
                            <span class="ml-1 text-[10px] text-gray-500 dark:text-gray-400 truncate">({project.partner_id[1]})</span>
                          )}
                        </div>
                        <div class="flex items-center gap-3 text-[11px] text-gray-600 dark:text-gray-400">
                          <span>🗓 {project.date_start || '-'}</span>
                          <span>→ {project.date || '-'}</span>
                          <span class="ml-auto bg-gray-100 dark:bg-[#18181b] text-[#8E8F1D] px-2 py-0.5 rounded-full font-semibold text-[10px]">{typeof project.taskCount === 'number' ? project.taskCount : Math.floor(Math.random()*8+1)} tareas</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
