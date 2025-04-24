import { Handlers } from "$fresh/server.ts";

const ODOO_API_URL = Deno.env.get("ODOO_API_URL");
const ODOO_API_DATABASE = Deno.env.get("ODOO_API_DATABASE");
const ODOO_API_USERNAME = Deno.env.get("ODOO_API_USERNAME");
const ODOO_API_KEY = Deno.env.get("ODOO_API_KEY");

async function authenticate() {
    try {
        const response = await fetch(ODOO_API_URL!, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "call",
                params: {
                    service: "common",
                    method: "authenticate",
                    args: [
                        ODOO_API_DATABASE,
                        ODOO_API_USERNAME,
                        ODOO_API_KEY,
                        {},
                    ],
                },
                id: 1,
            }),
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.data?.message || "Error de autenticación");
        }

        const uid = data.result;
        if (!uid || typeof uid !== "number") {
            throw new Error("No se pudo autenticar al usuario.");
        }

        return uid;
    } catch (err) {
        console.error("Error autenticando:", err);
        throw err;
    }
}

export async function createProject(data: {
    name: string;
    relatedSystems: string;
    date: string;
    responsible: string;
}) {
    try {
        const uid = await authenticate();
        if (!uid) {
            throw new Error("Authentication failed");
        }

        const odooData = {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "object",
                method: "execute_kw",
                args: [
                    ODOO_API_DATABASE,
                    uid,
                    ODOO_API_KEY,
                    "project.project",
                    "create",
                    [{
                        name: data.name,
                        date_start: data.date,
                        user_id: parseInt(data.responsible),
                    }],
                ],
            },
            id: 3,
        };

        const response = await fetch(ODOO_API_URL!, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
            },
            body: JSON.stringify(odooData),
        });

        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error.data?.message || "Error creating project in Odoo");
        }

        return result.result;
    } catch (error) {
        console.error("Error creating project:", error);
        throw error;
    }
}

export async function getProjectTaskCount(projectId: string) {
    try {
        const uid = await authenticate();
        if (!uid) {
            throw new Error("Authentication failed");
        }

        const odooData = {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "object",
                method: "execute_kw",
                args: [
                    ODOO_API_DATABASE,
                    uid,
                    ODOO_API_KEY,
                    "project.task",
                    "search_count",
                    [[["project_id", "=", parseInt(projectId)]]],
                ],
            },
            id: 4,
        };

        const response = await fetch(ODOO_API_URL!, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
            },
            body: JSON.stringify(odooData),
        });

        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error.data?.message || "Error getting task count from Odoo");
        }

        return result.result;
    } catch (error) {
        console.error("Error getting task count:", error);
        throw error;
    }
}

interface OdooAttachment {
    name: string;
    type: string;
    datas: string;
    res_model: string;
}

// Function to get the "Tickets DevOps" project ID
async function getTicketsDevOpsProjectId(): Promise<number> {
    const uid = await authenticate();
    if (!uid) {
        throw new Error("Authentication failed");
    }

    const odooData = {
        jsonrpc: "2.0",
        method: "call",
        params: {
            service: "object",
            method: "execute_kw",
            args: [
                ODOO_API_DATABASE,
                uid,
                ODOO_API_KEY,
                "project.project",
                "search_read",
                [[["name", "=", "Tickets DevOps"]]],
                {
                    fields: ["id"],
                },
            ],
        },
        id: 2,
    };

    const response = await fetch(ODOO_API_URL!, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
        },
        body: JSON.stringify(odooData),
    });

    const result = await response.json();
    
    if (result.error) {
        throw new Error(result.error.data?.message || "Error getting Tickets DevOps project ID");
    }

    if (result.result && result.result.length > 0) {
        return result.result[0].id;
    }

    throw new Error("Tickets DevOps project not found");
}

export async function createTask(data: {
    projectId: string;
    name: string;
    purpose: string;
    relatedSystems: string;
    users: string;
    priority: string;
    budget: string;
    features: string;
    images: OdooAttachment[] | null;
}) {
    try {
        const uid = await authenticate();
        if (!uid) {
            throw new Error("Authentication failed");
        }
        
        // Get the Tickets DevOps project ID
        const ticketsDevOpsProjectId = await getTicketsDevOpsProjectId();
        
        // Convert priority to a number
        const priorityValue = parseInt(data.priority);

        // Create description with questions and responses
        const description = `
Priority Level: ${getPriorityText(data.priority)}<br><br>
What systems are related to this one?<br><br>
${data.relatedSystems}<br><br>
What is the purpose of this system?<br><br>
${data.purpose}<br><br>
Who are the users of this system?<br><br>
${data.users}<br><br>
What is the budget for this system?<br><br>
${data.budget}<br><br>
What are the features of this system?<br><br>
${data.features}`;

        // Create task in the newly created project
        const odooData = {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "object",
                method: "execute_kw",
                args: [
                    ODOO_API_DATABASE,
                    uid,
                    ODOO_API_KEY,
                    "project.task",
                    "create",
                    [{
                        name: data.name,
                        project_id: parseInt(data.projectId),
                        description: description,
                        x_studio_related_systems: data.relatedSystems,
                        x_studio_purpose: data.purpose,
                        x_studio_users: data.users,
                        x_studio_priority: data.priority,
                        x_studio_features: data.features,
                        priority: priorityValue,
                        x_studio_images: data.images ? data.images.map(img => img.datas).join(',') : false,
                    }],
                ],
            },
            id: 5,
        };

        const response = await fetch(ODOO_API_URL!, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(odooData),
        });

        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error.data?.message || "Error creating task in original project");
        }

        const taskId = result.result;

        // Create the same task in the Tickets DevOps project
        const ticketsDevOpsData = {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "object",
                method: "execute_kw",
                args: [
                    ODOO_API_DATABASE,
                    uid,
                    ODOO_API_KEY,
                    "project.task",
                    "create",
                    [{
                        name: data.name,
                        project_id: ticketsDevOpsProjectId,
                        description: description,
                        x_studio_related_systems: data.relatedSystems,
                        x_studio_purpose: data.purpose,
                        x_studio_users: data.users,
                        x_studio_priority: data.priority,
                        x_studio_features: data.features,
                        priority: priorityValue,
                        x_studio_images: data.images ? data.images.map(img => img.datas).join(',') : false,
                    }],
                ],
            },
            id: 6,
        };

        const ticketsDevOpsResponse = await fetch(ODOO_API_URL!, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ticketsDevOpsData),
        });

        const ticketsDevOpsResult = await ticketsDevOpsResponse.json();
        
        if (ticketsDevOpsResult.error) {
            console.error("Error creating task in Tickets DevOps project:", ticketsDevOpsResult.error);
        }

        const ticketsDevOpsTaskId = ticketsDevOpsResult.result;

        // If we have attachments, create them for both tasks
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
            // Create attachments for the original task
            for (const attachment of data.images) {
                const attachmentData = {
                    jsonrpc: "2.0",
                    method: "call",
                    params: {
                        service: "object",
                        method: "execute_kw",
                        args: [
                            ODOO_API_DATABASE,
                            uid,
                            ODOO_API_KEY,
                            "ir.attachment",
                            "create",
                            [{
                                name: attachment.name,
                                type: "binary",
                                datas: attachment.datas,
                                res_model: "project.task",
                                res_id: taskId,
                                mimetype: attachment.type,
                            }],
                        ],
                    },
                    id: 7,
                };

                const attachmentResponse = await fetch(ODOO_API_URL!, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(attachmentData),
                });

                const attachmentResult = await attachmentResponse.json();
                
                if (attachmentResult.error) {
                    console.error("Error creating attachment for original task:", attachmentResult.error);
                }
            }

            // Create attachments for the Tickets DevOps task
            for (const attachment of data.images) {
                const attachmentData = {
                    jsonrpc: "2.0",
                    method: "call",
                    params: {
                        service: "object",
                        method: "execute_kw",
                        args: [
                            ODOO_API_DATABASE,
                            uid,
                            ODOO_API_KEY,
                            "ir.attachment",
                            "create",
                            [{
                                name: attachment.name,
                                type: "binary",
                                datas: attachment.datas,
                                res_model: "project.task",
                                res_id: ticketsDevOpsTaskId,
                                mimetype: attachment.type,
                            }],
                        ],
                    },
                    id: 8,
                };

                const attachmentResponse = await fetch(ODOO_API_URL!, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(attachmentData),
                });

                const attachmentResult = await attachmentResponse.json();
                
                if (attachmentResult.error) {
                    console.error("Error creating attachment for Tickets DevOps task:", attachmentResult.error);
                }
            }
        }

        return {
            originalTaskId: taskId,
            ticketsDevOpsTaskId: ticketsDevOpsTaskId
        };
    } catch (error) {
        console.error("Error in createTask:", error);
        throw error;
    }
}

// Function to get project initials
async function getProjectInitials(projectId: number): Promise<string> {
    const uid = await authenticate();
    if (!uid) {
        throw new Error("Authentication failed");
    }

    const odooData = {
        jsonrpc: "2.0",
        method: "call",
        params: {
            service: "object",
            method: "execute_kw",
            args: [
                ODOO_API_DATABASE,
                uid,
                ODOO_API_KEY,
                "project.project",
                "read",
                [[projectId]],
                {
                    fields: ["name"],
                },
            ],
        },
        id: 2,
    };

    const response = await fetch(ODOO_API_URL!, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
        },
        body: JSON.stringify(odooData),
    });

    const result = await response.json();
    
    if (result.error) {
        throw new Error(result.error.data?.message || "Error getting project name");
    }

    if (result.result && result.result.length > 0) {
        const projectName = result.result[0].name;
        // Extract initials from project name (first letter of each word)
        return projectName
            .split(' ')
            .map((word: string) => word.charAt(0).toUpperCase())
            .join('');
    }

    throw new Error("Project not found");
}

// Function to get the next fix task number
async function getNextFixTaskNumber(projectInitials: string): Promise<number> {
    const uid = await authenticate();
    if (!uid) {
        throw new Error("Authentication failed");
    }

    // Search for tasks with name pattern "{projectInitials}FIX000#"
    const odooData = {
        jsonrpc: "2.0",
        method: "call",
        params: {
            service: "object",
            method: "execute_kw",
            args: [
                ODOO_API_DATABASE,
                uid,
                ODOO_API_KEY,
                "project.task",
                "search_read",
                [[["name", "ilike", `${projectInitials}FIX`]]],
                {
                    fields: ["name"],
                    order: "name desc",
                    limit: 1,
                },
            ],
        },
        id: 2,
    };

    const response = await fetch(ODOO_API_URL!, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
        },
        body: JSON.stringify(odooData),
    });

    const result = await response.json();
    
    if (result.error) {
        throw new Error(result.error.data?.message || "Error getting next fix task number");
    }

    if (result.result && result.result.length > 0) {
        // Extract the number from the last task name (e.g., "PSDFIX001" -> 1)
        const lastTaskName = result.result[0].name;
        const match = lastTaskName.match(/FIX(\d+)/);
        if (match && match[1]) {
            return parseInt(match[1]) + 1;
        }
    }

    // If no existing fix tasks for this project, start with 1
    return 1;
}

// Function to generate a custom fix task name
async function generateFixTaskName(projectId: number): Promise<string> {
    const projectInitials = await getProjectInitials(projectId);
    const nextNumber = await getNextFixTaskNumber(projectInitials);
    
    // Format: project_initials_FIX000#
    return `${projectInitials}FIX${nextNumber.toString().padStart(3, '0')}`;
}

export async function createFixTask(data: {
    projectId: string;
    feature: string;
    expected: string;
    current: string;
    steps: string;
    priority: string;
    images: OdooAttachment[] | null;
}) {
    try {
        const uid = await authenticate();
        if (!uid) {
            throw new Error("Authentication failed");
        }
        
        // Get the Tickets DevOps project ID
        const ticketsDevOpsProjectId = await getTicketsDevOpsProjectId();
        
        // Convert priority to a number
        const priorityValue = parseInt(data.priority);
        
        // Generate custom fix task name
        const customTaskName = await generateFixTaskName(parseInt(data.projectId));

        // Create description with questions and responses
        const description = `
Priority Level: ${getPriorityText(data.priority)}<br><br>
What feature needs to be fixed?<br><br>
${data.feature}<br><br>
What is the expected behavior?<br><br>
${data.expected}<br><br>
What is the current behavior?<br><br>
${data.current}<br><br>
What are the steps to reproduce the issue?<br><br>
${data.steps}`;

        // Create task in the newly created project
        const odooData = {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "object",
                method: "execute_kw",
                args: [
                    ODOO_API_DATABASE,
                    uid,
                    ODOO_API_KEY,
                    "project.task",
                    "create",
                    [{
                        name: customTaskName,
                        project_id: parseInt(data.projectId),
                        description: description,
                        x_studio_fix_feature: data.feature,
                        x_studio_fix_expected: data.expected,
                        x_studio_fix_current: data.current,
                        x_studio_fix_steps: data.steps,
                        x_studio_fix_priority: data.priority,
                        priority: priorityValue,
                        x_studio_images: data.images ? data.images.map(img => img.datas).join(',') : false,
                    }],
                ],
            },
            id: 5,
        };

        const response = await fetch(ODOO_API_URL!, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(odooData),
        });

        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error.data?.message || "Error creating task");
        }

        const taskId = result.result;

        // Create the same task in the Tickets DevOps project
        const ticketsDevOpsData = {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "object",
                method: "execute_kw",
                args: [
                    ODOO_API_DATABASE,
                    uid,
                    ODOO_API_KEY,
                    "project.task",
                    "create",
                    [{
                        name: customTaskName,
                        project_id: ticketsDevOpsProjectId,
                        description: description,
                        x_studio_fix_feature: data.feature,
                        x_studio_fix_expected: data.expected,
                        x_studio_fix_current: data.current,
                        x_studio_fix_steps: data.steps,
                        x_studio_fix_priority: data.priority,
                        priority: priorityValue,
                        x_studio_images: data.images ? data.images.map(img => img.datas).join(',') : false,
                    }],
                ],
            },
            id: 6,
        };

        const ticketsDevOpsResponse = await fetch(ODOO_API_URL!, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ticketsDevOpsData),
        });

        const ticketsDevOpsResult = await ticketsDevOpsResponse.json();
        
        if (ticketsDevOpsResult.error) {
            console.error("Error creating task in Tickets DevOps project:", ticketsDevOpsResult.error);
        }

        const ticketsDevOpsTaskId = ticketsDevOpsResult.result;

        // If we have attachments, create them for both tasks
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
            // Create attachments for the original task
            for (const attachment of data.images) {
                const attachmentData = {
                    jsonrpc: "2.0",
                    method: "call",
                    params: {
                        service: "object",
                        method: "execute_kw",
                        args: [
                            ODOO_API_DATABASE,
                            uid,
                            ODOO_API_KEY,
                            "ir.attachment",
                            "create",
                            [{
                                name: attachment.name,
                                type: "binary",
                                datas: attachment.datas,
                                res_model: "project.task",
                                res_id: taskId,
                                mimetype: attachment.type,
                            }],
                        ],
                    },
                    id: 7,
                };

                const attachmentResponse = await fetch(ODOO_API_URL!, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(attachmentData),
                });

                const attachmentResult = await attachmentResponse.json();
                
                if (attachmentResult.error) {
                    console.error("Error creating attachment for original task:", attachmentResult.error);
                }
            }

            // Create attachments for the Tickets DevOps task
            for (const attachment of data.images) {
                const attachmentData = {
                    jsonrpc: "2.0",
                    method: "call",
                    params: {
                        service: "object",
                        method: "execute_kw",
                        args: [
                            ODOO_API_DATABASE,
                            uid,
                            ODOO_API_KEY,
                            "ir.attachment",
                            "create",
                            [{
                                name: attachment.name,
                                type: "binary",
                                datas: attachment.datas,
                                res_model: "project.task",
                                res_id: ticketsDevOpsTaskId,
                                mimetype: attachment.type,
                            }],
                        ],
                    },
                    id: 8,
                };

                const attachmentResponse = await fetch(ODOO_API_URL!, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(attachmentData),
                });

                const attachmentResult = await attachmentResponse.json();
                
                if (attachmentResult.error) {
                    console.error("Error creating attachment for Tickets DevOps task:", attachmentResult.error);
                }
            }
        }

        return {
            originalTaskId: taskId,
            ticketsDevOpsTaskId: ticketsDevOpsTaskId,
            customTaskName: customTaskName
        };
    } catch (error) {
        console.error("Error in createFixTask:", error);
        throw error;
    }
}

// Function to get the Odoo tag ID
async function getOdooTagId(): Promise<number> {
    try {
        const uid = await authenticate();
        if (!uid) {
            throw new Error("Authentication failed");
        }

        const odooData = {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "object",
                method: "execute_kw",
                args: [
                    ODOO_API_DATABASE,
                    uid,
                    ODOO_API_KEY,
                    "project.tags",
                    "search_read",
                    [[["name", "=", "Odoo"]]],
                    {
                        fields: ["id"],
                    },
                ],
            },
            id: 1,
        };

        const response = await fetch(ODOO_API_URL!, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
            },
            body: JSON.stringify(odooData),
        });

        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error.data?.message || "Error getting Odoo tag ID");
        }

        // Return just the ID
        return result.result[0].id;
    } catch (error) {
        console.error("Error getting Odoo tag ID:", error);
        throw error;
    }
}

// Function to get a tag ID by its name
async function getTagIdByName(name: string): Promise<number> {
    try {
        const uid = await authenticate();
        if (!uid) {
            throw new Error("Authentication failed");
        }

        const odooData = {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "object",
                method: "execute_kw",
                args: [
                    ODOO_API_DATABASE,
                    uid,
                    ODOO_API_KEY,
                    "project.tags",
                    "search_read",
                    [[["name", "=", name]]],
                    {
                        fields: ["id"],
                    },
                ],
            },
            id: 2,
        };

        const response = await fetch(ODOO_API_URL!, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
            },
            body: JSON.stringify(odooData),
        });

        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error.data?.message || `Error getting ${name} tag ID`);
        }

        // Return just the ID
        return result.result[0].id;
    } catch (error) {
        console.error(`Error getting ${name} tag ID:`, error);
        throw error;
    }
}

interface OdooProject {
    id: number;
    name: string;
    partner_id: [number, string];
    date_start: string;
    date: string;
    tag_ids: number[];
}

export const handler: Handlers = {
    async GET(_req) {
        try {
            const uid = await authenticate();
            if (!uid) {
                return new Response(
                    JSON.stringify({ error: "Error de autenticación" }),
                    {
                        status: 401,
                        headers: { 
                            "Content-Type": "application/json",
                            "Cache-Control": "no-store"
                        },
                    }
                );
            }

            // Get the Odoo tag ID first
            const odooTagId = await getOdooTagId();
            
            // Get the Development tag ID
            const developmentTagId = await getTagIdByName("Development");

            const odooData = {
                jsonrpc: "2.0",
                method: "call",
                params: {
                    service: "object",
                    method: "execute_kw",
                    args: [
                        ODOO_API_DATABASE,
                        uid,
                        ODOO_API_KEY,
                        "project.project",
                        "search_read",
                        [],
                        {
                            fields: ["id", "name", "partner_id", "date_start", "date", "tag_ids"],
                        },
                    ],
                },
                id: 2,
            };

            const response = await fetch(ODOO_API_URL!, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(odooData),
            });

            const result = await response.json();
            
            if (result.error) {
                return new Response(
                    JSON.stringify({ 
                        error: result.error.data?.message || "Error en Odoo" 
                    }),
                    {
                        status: 400,
                        headers: { 
                            "Content-Type": "application/json",
                            "Cache-Control": "no-store"
                        },
                    }
                );
            }

            // Filter out projects with the Odoo tag
            const filteredProjects = result.result.filter((project: OdooProject) => 
                !project.tag_ids?.includes(odooTagId) && !project.tag_ids?.includes(developmentTagId)
            );

            // Filter projects with the Odoo tag but exclude those with Development tag
            const filteredOdooProjects = result.result.filter((project: OdooProject) => 
                project.tag_ids?.includes(odooTagId) && !project.tag_ids?.includes(developmentTagId)
            );

            return new Response(
                JSON.stringify({ 
                    success: true, 
                    data: filteredProjects,
                    odooProjects: filteredOdooProjects 
                }),
                {
                    status: 200,
                    headers: { 
                        "Content-Type": "application/json",
                        "Cache-Control": "no-store"
                    },
                }
            );

        } catch (error) {
            console.error("Error en la API de Odoo:", error);
            return new Response(
                JSON.stringify({ 
                    error: error instanceof Error ? error.message : "Error interno del servidor" 
                }),
                {
                    status: 500,
                    headers: { 
                        "Content-Type": "application/json",
                        "Cache-Control": "no-store"
                    },
                }
            );
        }
    },

    async POST(req) {
        try {
            const body = await req.json();

            if (body.type === "project") {
                const { name, relatedSystems, date, responsible } = body;
                if (!name || !relatedSystems || !date || !responsible) {
                    return new Response(JSON.stringify({ error: "Campos incompletos para proyecto" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    });
                }
                const id = await createProject({ name, relatedSystems, date, responsible });
                return new Response(JSON.stringify({ success: true, projectId: id }), {
                    status: 201,
                    headers: { "Content-Type": "application/json" },
                });
            }

            if (body.type === "task") {
                const { projectId, name, purpose, relatedSystems, users, priority, budget, features, images } = body;
                if (!projectId || !name || !purpose || !users || !priority || !budget || !features) {
                    return new Response(JSON.stringify({ error: "Campos incompletos para tarea" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    });
                }
                const taskIds = await createTask({ projectId, name, purpose, relatedSystems, users, priority, budget, features, images });
                return new Response(JSON.stringify({ 
                    success: true, 
                    taskId: taskIds.originalTaskId,
                    ticketsDevOpsTaskId: taskIds.ticketsDevOpsTaskId
                }), {
                    status: 201,
                    headers: { "Content-Type": "application/json" },
                });
            }

            if (body.type === "fix") {
                const { projectId, feature, expected, current, steps, priority, images } = body;
                
                // Check each field individually and provide specific error messages
                if (!projectId) {
                    return new Response(JSON.stringify({ error: "El ID del proyecto es requerido" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    });
                }
                if (!feature) {
                    return new Response(JSON.stringify({ error: "El campo 'feature' es requerido" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    });
                }
                if (!expected) {
                    return new Response(JSON.stringify({ error: "El campo 'expected' es requerido" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    });
                }
                if (!current) {
                    return new Response(JSON.stringify({ error: "El campo 'current' es requerido" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    });
                }
                if (!steps) {
                    return new Response(JSON.stringify({ error: "El campo 'steps' es requerido" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    });
                }
                
                const taskIds = await createFixTask({ 
                    projectId, 
                    feature,
                    expected,
                    current,
                    steps,
                    priority: priority || "2", // Default to medium priority if not provided
                    images 
                });
                return new Response(JSON.stringify({ 
                    success: true, 
                    taskId: taskIds.originalTaskId,
                    ticketsDevOpsTaskId: taskIds.ticketsDevOpsTaskId,
                    customTaskName: taskIds.customTaskName
                }), {
                    status: 201,
                    headers: { "Content-Type": "application/json" },
                });
            }

            if (body.type === "newFeature") {
                const { projectId, feature, expected, current, steps, priority, images } = body;
                
                // Check each field individually and provide specific error messages
                if (!projectId) {
                    return new Response(JSON.stringify({ error: "El ID del proyecto es requerido" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    });
                }
                if (!feature) {
                    return new Response(JSON.stringify({ error: "El campo 'feature' es requerido" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    });
                }
                if (!expected) {
                    return new Response(JSON.stringify({ error: "El campo 'expected' es requerido" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    });
                }
                if (!current) {
                    return new Response(JSON.stringify({ error: "El campo 'current' es requerido" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    });
                }
                if (!steps) {
                    return new Response(JSON.stringify({ error: "El campo 'steps' es requerido" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    });
                }
                
                const taskIds = await createNewFeatureTask({ 
                    projectId, 
                    feature,
                    expected,
                    current,
                    steps,
                    priority: priority || "2", // Default to medium priority if not provided
                    images 
                });
                return new Response(JSON.stringify({ 
                    success: true, 
                    taskId: taskIds.originalTaskId,
                    ticketsDevOpsTaskId: taskIds.ticketsDevOpsTaskId,
                    customTaskName: taskIds.customTaskName
                }), {
                    status: 201,
                    headers: { "Content-Type": "application/json" },
                });
            }

            return new Response(JSON.stringify({ error: "Tipo no válido: usa 'project', 'task', 'fix' o 'newFeature'" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });

        } catch (error) {
            console.error("Error en POST:", error);
            return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Error interno del servidor" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }
    },
};

// Helper function to generate a custom new feature task name
async function generateNewFeatureTaskName(projectId: number): Promise<string> {
  const projectInitials = await getProjectInitials(projectId);
  const nextNumber = await getNextNewFeatureTaskNumber();
  return `${projectInitials}NF${String(nextNumber).padStart(3, '0')}`;
}

// Helper function to get the next new feature task number
async function getNextNewFeatureTaskNumber(): Promise<number> {
  try {
    const uid = await authenticate();
    if (!uid) {
      throw new Error("Authentication failed");
    }

    // Get all tasks with names matching the pattern projectInitialsNF000#
    const odooData = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          ODOO_API_DATABASE,
          uid,
          ODOO_API_KEY,
          "project.task",
          "search_read",
          [
            [["name", "like", "NF"]],
            ["name"],
          ],
        ],
      },
      id: 5,
    };

    const response = await fetch(ODOO_API_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(odooData),
    });

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error.data?.message || "Error getting task numbers");
    }

    const tasks = result.result || [];
    
    // Extract numbers from task names and find the highest
    const numbers = tasks
      .map((task: { name: string }) => {
        const match = task.name.match(/NF(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter((num: number) => !isNaN(num));
    
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    return maxNumber + 1;
  } catch (error) {
    console.error("Error in getNextNewFeatureTaskNumber:", error);
    return 1; // Default to 1 if there's an error
  }
}

export async function createNewFeatureTask(data: {
    projectId: string;
    feature: string;
    expected: string;
    current: string;
    steps: string;
    priority: string;
    images: OdooAttachment[] | null;
}) {
    try {
        const uid = await authenticate();
        if (!uid) {
            throw new Error("Authentication failed");
        }
        
        // Get the Tickets DevOps project ID
        const ticketsDevOpsProjectId = await getTicketsDevOpsProjectId();
        
        // Convert priority to a number
        const priorityValue = parseInt(data.priority);
        
        // Generate custom new feature task name
        const customTaskName = await generateNewFeatureTaskName(parseInt(data.projectId));

        // Create description with questions and responses
        const description = `
Priority Level: ${getPriorityText(data.priority)}<br><br>
What is the new feature?<br><br>
${data.feature}<br><br>
Why is this feature needed?<br><br>
${data.expected}<br><br>
Who are the users of this feature?<br><br>
${data.current}<br><br>
What are the implementation requirements?<br><br>
${data.steps}`;

        // Create task in the newly created project
        const odooData = {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "object",
                method: "execute_kw",
                args: [
                    ODOO_API_DATABASE,
                    uid,
                    ODOO_API_KEY,
                    "project.task",
                    "create",
                    [{
                        name: customTaskName,
                        project_id: parseInt(data.projectId),
                        description: description,
                        x_studio_add_feature: data.feature,
                        x_studio_add_why: data.expected,
                        x_studio_add_users: data.current,
                        x_studio_add_requirements: data.steps,
                        x_studio_add_priority: data.priority,
                        x_studio_integration: "Yes",
                        priority: priorityValue,
                        x_studio_images: data.images ? data.images.map(img => img.datas).join(',') : false,
                    }],
                ],
            },
            id: 5,
        };

        const response = await fetch(ODOO_API_URL!, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(odooData),
        });

        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error.data?.message || "Error creating task");
        }

        const taskId = result.result;

        // Create the same task in the Tickets DevOps project
        const ticketsDevOpsData = {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "object",
                method: "execute_kw",
                args: [
                    ODOO_API_DATABASE,
                    uid,
                    ODOO_API_KEY,
                    "project.task",
                    "create",
                    [{
                        name: customTaskName,
                        project_id: ticketsDevOpsProjectId,
                        description: description,
                        x_studio_add_feature: data.feature,
                        x_studio_add_why: data.expected,
                        x_studio_add_users: data.current,
                        x_studio_add_requirements: data.steps,
                        x_studio_add_priority: data.priority,
                        x_studio_integration: "Yes",
                        priority: priorityValue,
                        x_studio_images: data.images ? data.images.map(img => img.datas).join(',') : false,
                    }],
                ],
            },
            id: 6,
        };

        const ticketsDevOpsResponse = await fetch(ODOO_API_URL!, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ticketsDevOpsData),
        });

        const ticketsDevOpsResult = await ticketsDevOpsResponse.json();
        
        if (ticketsDevOpsResult.error) {
            console.error("Error creating task in Tickets DevOps project:", ticketsDevOpsResult.error);
        }

        const ticketsDevOpsTaskId = ticketsDevOpsResult.result;

        // If we have attachments, create them for both tasks
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
            // Create attachments for the original task
            for (const attachment of data.images) {
                const attachmentData = {
                    jsonrpc: "2.0",
                    method: "call",
                    params: {
                        service: "object",
                        method: "execute_kw",
                        args: [
                            ODOO_API_DATABASE,
                            uid,
                            ODOO_API_KEY,
                            "ir.attachment",
                            "create",
                            [{
                                name: attachment.name,
                                type: "binary",
                                datas: attachment.datas,
                                res_model: "project.task",
                                res_id: taskId,
                                mimetype: attachment.type,
                            }],
                        ],
                    },
                    id: 7,
                };

                const attachmentResponse = await fetch(ODOO_API_URL!, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(attachmentData),
                });

                const attachmentResult = await attachmentResponse.json();
                
                if (attachmentResult.error) {
                    console.error("Error creating attachment for original task:", attachmentResult.error);
                }
            }

            // Create attachments for the Tickets DevOps task
            for (const attachment of data.images) {
                const attachmentData = {
                    jsonrpc: "2.0",
                    method: "call",
                    params: {
                        service: "object",
                        method: "execute_kw",
                        args: [
                            ODOO_API_DATABASE,
                            uid,
                            ODOO_API_KEY,
                            "ir.attachment",
                            "create",
                            [{
                                name: attachment.name,
                                type: "binary",
                                datas: attachment.datas,
                                res_model: "project.task",
                                res_id: ticketsDevOpsTaskId,
                                mimetype: attachment.type,
                            }],
                        ],
                    },
                    id: 8,
                };

                const attachmentResponse = await fetch(ODOO_API_URL!, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(attachmentData),
                });

                const attachmentResult = await attachmentResponse.json();
                
                if (attachmentResult.error) {
                    console.error("Error creating attachment for Tickets DevOps task:", attachmentResult.error);
                }
            }
        }

        return {
            originalTaskId: taskId,
            ticketsDevOpsTaskId: ticketsDevOpsTaskId,
            customTaskName: customTaskName
        };
    } catch (error) {
        console.error("Error in createNewFeatureTask:", error);
        throw error;
    }
}

// Helper function to convert priority number to text
function getPriorityText(priority: string): string {
    switch (priority) {
        case "0":
            return "4. Low priority";
        case "1":
            return "3. Medium priority";
        case "2":
            return "2. High priority";
        case "3":
            return "1. Critical (Immediate attention)";
        default:
            return "3. Medium priority";
    }
}
