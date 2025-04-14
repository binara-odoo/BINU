import { Handlers, PageProps } from "$fresh/server.ts";
import Navbar from "../../islands/navbar/Navbar.tsx";
import { Translations } from "../../types/translations.ts";
//import PagesBackground from "../../islands/background/PagesBackground.tsx";
import { LoadTranslations } from "../../utils/i18n.ts";
import NewSystemForm from "../../islands/specs/NewSystemForm.tsx";
import { decodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { createProject, getProjectTaskCount, createTask } from "../api/odoo-projects.ts";

interface LoginProps {
  LoggedIn: boolean;
  Translations: Translations;
  lang: string;
  system: string;
  userInfo?: {
    name?: string;
    email?: string;
    picture?: string;
  };
}

export const handler: Handlers<LoginProps> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const lang = url.searchParams.get("lang") || "es";
    const system = url.searchParams.get("system") || "";
    const translations = await LoadTranslations(lang);

    // Check authentication
    const cookies = req.headers.get("cookie") || "";
    const sessionCookie = cookies.split("; ").find(c => c.startsWith("session="));
    let session = null;
    
    if (sessionCookie) {
      try {
        const encodedSession = sessionCookie.split("=")[1];
        // Add padding if needed
        const paddedSession = encodedSession + '='.repeat((4 - encodedSession.length % 4) % 4);
        const decodedSession = new TextDecoder().decode(decodeBase64(paddedSession));
        session = JSON.parse(decodedSession);
      } catch (error) {
        console.error("Error decoding session:", error);
      }
    }

    // Redirect to login if not authenticated
    if (!session?.loggedIn) {
      const loginUrl = new URL("/auth", url.origin);
      loginUrl.searchParams.set("lang", lang);
      return new Response("", {
        status: 303,
        headers: { Location: loginUrl.toString() },
      });
    }

    return ctx.render({
      LoggedIn: true,
      Translations: translations,
      lang: lang,
      system: system,
      userInfo: {
        name: session.name,
        email: session.email,
        picture: session.picture,
      },
    });
  },

  async POST(req) {
    const url = new URL(req.url);
    const lang = url.searchParams.get("lang") || "es";

    try {
      const form = await req.formData();

      const newSystemName = form.get("new_system_name")?.toString() || "";
      if (!newSystemName) {
        return new Response(null, {
          status: 303,
          headers: { Location: "/error?message=System name is required" },
        });
      }

      const responsible = form.get("responsible")?.toString() || "";
      if (!responsible) {
        return new Response(null, {
          status: 303,
          headers: { Location: "/error?message=Responsible person is required" },
        });
      }

      const initials = newSystemName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase();

      try {
        // Create the project in Odoo
        const projectId = await createProject({
          name: newSystemName,
          relatedSystems: form.get("related_systems")?.toString() || "",
          date: form.get("date")?.toString() || new Date().toISOString().split('T')[0],
          responsible: responsible,
        });

        // Get the task count for this project
        const taskCount = await getProjectTaskCount(projectId);

        // Generate task name with initials and sequential number
        const taskName = `${initials}${(taskCount + 1).toString().padStart(4, "0")}`;

        // Process attachments
        const attachments = [];
        let index = 0;
        while (form.has(`attachment_${index}_name`)) {
          const name = form.get(`attachment_${index}_name`)?.toString() || `image_${index}.jpg`;
          const type = form.get(`attachment_${index}_type`)?.toString() || 'binary';
          const datas = form.get(`attachment_${index}_datas`)?.toString() || '';
          const resModel = form.get(`attachment_${index}_res_model`)?.toString() || 'project.task';
          
          if (datas) {
            attachments.push({
              name,
              type,
              datas,
              res_model: resModel,
              // res_id will be set after task creation
            });
          }
          
          index++;
        }

        // Create the first task for this project
        const taskId = await createTask({
          projectId,
          name: taskName,
          relatedSystems: form.get("related_systems")?.toString() || "",
          purpose: form.get("purpose")?.toString() || "",
          users: form.get("users")?.toString() || "",
          priority: form.get("priority")?.toString() || "0",
          budget: form.get("budget")?.toString() || "",
          features: form.get("features")?.toString() || "",
          images: attachments.length > 0 ? attachments : null,
        });

        // Redirect to the project page
        return new Response(null, {
          status: 303,
          headers: { Location: `/specs/new-system?lang=${lang}&taskId=${taskId}` },
        });
      } catch (odooError) {
        console.error("Odoo API error:", odooError);
        let errorMessage = "Error creating project in Odoo";
        
        if (odooError instanceof Error) {
          errorMessage = odooError.message;
        }
        
        return new Response(null, {
          status: 303,
          headers: { Location: `/error?message=${encodeURIComponent(errorMessage)}` },
        });
      }
    } catch (error) {
      console.error("Error processing form:", error);
      
      // Extract the error message
      let errorMessage = "Failed to process form";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Redirect to an error page with the error message
      return new Response(null, {
        status: 303,
        headers: { Location: `/error?message=${encodeURIComponent(errorMessage)}` },
      });
    }
  }
};

export default function NewSystem({ data }: PageProps<LoginProps>) {
  const questions = [
    {
      id: "new_system_name",
      label: data.Translations.new_system.new_system_name,
      type: "text",
    },
    {
      id: "related_systems",
      label: data.Translations.new_system.related_systems,
      type: "selector",
    },
    {
      id: "purpose",
      label: data.Translations.new_system.purpose,
      type: "textarea",
    },
    {
      id: "users",
      label: data.Translations.new_system.users,
      type: "textarea",
    },
    {
      id: "priority",
      label: data.Translations.new_system.priority,
      type: "radio",
    },
    {
      id: "features",
      label: data.Translations.new_system.features,
      type: "textarea",
    },
    {
      id: "images",
      label: data.Translations.new_system.images,
      type: "file",
    },
    {
      id: "date",
      label: data.Translations.new_system.date,
      type: "date",
    },
    {
      id: "responsible",
      label: data.Translations.new_system.responsible,
      type: "selector"
    }
  ];

  return (
    <div class="relative min-h-screen">
      <head>
        <title>{data.Translations.new_system.title}</title>
      </head>
        <div class="flex flex-col relative z-10 min-h-screen  text-white">
          <Navbar
            LoggedIn={data.LoggedIn}
            Translations={data.Translations}
            lang={data.lang}
            userInfo={data.userInfo}
          />
          <main class="max-w-7xl mx-auto flex-1 pt-32">
            <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 text-[#8E8F1D]">
              {data.Translations.new_system.title}
            </h1>
            <div class="w-[95%] sm:w-[85%] md:w-[650px] lg:w-[750px] xl:w-[850px] mx-auto px-4 sm:px-6 lg:px-8 mb-20">
              <div class="form-container bg-gray-200 shadow-lg rounded-lg text-[#8E8F1D] p-4 sm:p-6 md:p-8 lg:p-10">
                <NewSystemForm
                  questions={questions}
                  buttonText={data.Translations.new_system.button}
                  translations={data.Translations}
                />
              </div>
            </div>
          </main>
        </div>
    </div>
  );
}