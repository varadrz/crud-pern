'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function TablePage() {
    const params = useParams(); // Unwrap if needed, but standard hook works
    const name = params?.name;
    const router = useRouter();

    const [rows, setRows] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // Form state
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (!name) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch schema
                const schemaRes = await fetch(`/api/table/${name}/schema`);
                const schemaData = await schemaRes.json();
                if (schemaData.error) throw new Error(schemaData.error);
                setColumns(schemaData);

                // Fetch data
                const dataRes = await fetch(`/api/table/${name}`);
                const dataData = await dataRes.json();
                if (dataData.error) throw new Error(dataData.error);
                setRows(dataData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [name, refreshKey]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const cleanData = {};
            Object.keys(formData).forEach(key => {
                if (formData[key] !== '') {
                    cleanData[key] = formData[key];
                }
            });

            const res = await fetch(`/api/table/${name}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cleanData),
            });
            const json = await res.json();
            if (json.error) throw new Error(json.error);

            setFormData({});
            setRefreshKey(k => k + 1);
        } catch (err) {
            alert(`Error creating row: ${err.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this row?')) return;
        try {
            const res = await fetch(`/api/table/${name}/${id}`, {
                method: 'DELETE',
            });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            setRefreshKey(k => k + 1);
        } catch (err) {
            alert(`Error deleting row: ${err.message}`);
        }
    };

    // Simple update via prompt for now to save UI complexity
    const handleUpdate = async (row) => {
        // Determine ID
        const id = row.id;
        if (!id) {
            alert('Cannot update row without ID');
            return;
        }

        // Ask just one field update or loop?
        // Let's implement a simple prompt loop for editing or just redirect?
        // User requested "Forms for Create and Update".
        // A prompt is technically a form? It's clunky.
        // Better: Populate the create form with this row's data and change button to "Update"?
        // Or rendering editable inputs in the table?
        // Let's do: prompt for a JSON object update? No, that's techy.

        // Simplest robust way: 
        // Ask user to pick a column to edit?
        // Let's do: use the Form area for "Edit" as well but it's tricky to switch context.

        // I will implement "Edit Mode" for the row.
        // But that requires managing state per row.

        // Compromise: A specialized Edit Form that appears when you click Edit.
        const newVal = prompt("Enter new value for specific column (format: col=val)", "");
        // This is bad UX.

        // Let's just create a quick modal or inline edit inputs?
        // Inline edit is good.
        // I'll toggle `editingId` state.
    };

    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    const startEdit = (row) => {
        setEditingId(row.id);
        setEditData({ ...row });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData({});
    };

    const saveEdit = async () => {
        try {
            const id = editingId;
            const res = await fetch(`/api/table/${name}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData),
            });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            setEditingId(null);
            setRefreshKey(k => k + 1);
        } catch (err) {
            alert(`Error updating: ${err.message}`);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

    return (
        <main className="p-8 font-sans">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Table: {name}</h1>
                <button onClick={() => router.push('/')} className="text-blue-500 hover:underline">&larr; Back to Tables</button>
            </div>

            {/* Create Form */}
            <div className="mb-8 p-4 bg-gray-50 rounded border">
                <h2 className="text-lg font-semibold mb-4">Add New Row</h2>
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {columns.map(col => {
                        // Hide ID if auto-increment usually (default starts with nextval)
                        const isAuto = col.column_default && col.column_default.includes('nextval');
                        const isId = col.column_name === 'id';
                        // Show input for all, but maybe optional for auto
                        return (
                            <div key={col.column_name}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {col.column_name} {isAuto && <span className="text-xs text-gray-400">(Auto)</span>}
                                </label>
                                <input
                                    type="text"
                                    className="w-full border p-2 rounded"
                                    placeholder={isAuto ? '(Leave empty for auto)' : ''}
                                    value={formData[col.column_name] || ''}
                                    onChange={e => setFormData({ ...formData, [col.column_name]: e.target.value })}
                                />
                            </div>
                        );
                    })}
                    <div className="col-span-full">
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                            Insert Row
                        </button>
                    </div>
                </form>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-200">
                    <thead>
                        <tr className="bg-gray-100">
                            {columns.map(col => (
                                <th key={col.column_name} className="border p-2 text-left">{col.column_name}</th>
                            ))}
                            <th className="border p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(row => {
                            const isEditing = editingId === row.id;
                            return (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    {columns.map(col => (
                                        <td key={col.column_name} className="border p-2">
                                            {isEditing ? (
                                                <input
                                                    className="w-full border p-1"
                                                    value={editData[col.column_name] || ''}
                                                    onChange={e => setEditData({ ...editData, [col.column_name]: e.target.value })}
                                                />
                                            ) : (
                                                <span className="truncate block max-w-xs" title={row[col.column_name]}>{String(row[col.column_name] ?? '')}</span>
                                            )}
                                        </td>
                                    ))}
                                    <td className="border p-2 whitespace-nowrap">
                                        {isEditing ? (
                                            <div className="flex space-x-2">
                                                <button onClick={saveEdit} className="text-green-600 hover:underline">Save</button>
                                                <button onClick={cancelEdit} className="text-gray-600 hover:underline">Cancel</button>
                                            </div>
                                        ) : (
                                            <div className="flex space-x-2">
                                                <button onClick={() => startEdit(row)} className="text-blue-600 hover:underline">Edit</button>
                                                <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:underline">Delete</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + 1} className="p-4 text-center text-gray-500">No rows found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
