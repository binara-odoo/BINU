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
                    args: [ODOO_API_DATABASE, ODOO_API_USERNAME, ODOO_API_KEY, {}],
                },
                id: 1,
            }),
        });

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.data.message || 'Authentication failed');
        }
        return data.result;
    } catch (error) {
        console.error('Authentication error:', error);
        throw error;
    }
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
                        'res.users',
                        'search_read',
                        [[['active', '=', true]]],
                        { fields: ['id', 'name'] }
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

            return new Response(
                JSON.stringify({ success: true, data: result.result }),
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
}; 