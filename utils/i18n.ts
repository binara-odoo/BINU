export async function LoadTranslations( lang: string){
    try{
        const filePath = `${Deno.cwd()}/locals/${lang}.json`;
        const content = await Deno.readTextFile(filePath);
        return JSON.parse(content);
    } catch (error){
        console.error(`Error loading translations for language: ${lang}`, error);
        return {};
    }
}