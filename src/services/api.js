
const API_BASE = '/api';

/**
 * Standardized fetch wrapper to handle JSON parsing and error checking.
 */
async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(data.error || `Request failed with status ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API Error (${url}):`, error);
        throw error;
    }
}

export const api = {
    /**
     * Fetch list of public tables.
     */
    getTables: () => request('/tables'),

    /**
     * Fetch all rows for a specific table.
     */
    getTableData: (tableName) => request(`/table/${tableName}`),

    /**
     * Fetch schema (columns) for a specific table.
     */
    getTableSchema: (tableName) => request(`/table/${tableName}/schema`),

    /**
     * Create a new row in a table.
     */
    createRow: (tableName, rowData) => request(`/table/${tableName}`, {
        method: 'POST',
        body: JSON.stringify(rowData),
    }),

    /**
     * Update an existing row by ID.
     */
    updateRow: (tableName, id, rowData) => request(`/table/${tableName}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(rowData),
    }),

    /**
     * Delete a row by ID.
     */
    deleteRow: (tableName, id) => request(`/table/${tableName}/${id}`, {
        method: 'DELETE',
    }),
};
