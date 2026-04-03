/**
 * Shared HTTP helper for calling the FreightUtils API.
 */
export declare function apiGet(endpoint: string, params: Record<string, unknown>): Promise<unknown>;
export declare function apiPost(endpoint: string, body: unknown): Promise<unknown>;
