import { z } from 'zod';
export interface ToolDef {
    name: string;
    description: string;
    schema: z.ZodObject<z.ZodRawShape>;
    handler: (args: Record<string, unknown>) => Promise<unknown>;
}
export declare const ALL_TOOLS: ToolDef[];
