'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';

export default function TablePage() {
    const params = useParams();
    const router = useRouter();
    const name = params?.name;

    const [rows, setRows] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRow, setEditingRow] = useState(null); // null = create mode
    const [formData, setFormData] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Toast State
    const [toast, setToast] = useState(null);

    // Fetch Data
    useEffect(() => {
        if (!name) return;

        const fetchData = async () => {
            setLoading(true);
            setPageError(null);
            try {
                // Parallel fetch for schema and data
                const [schemaData, tableData] = await Promise.all([
                    api.getTableSchema(name),
                    api.getTableData(name)
                ]);
                setColumns(schemaData);
                setRows(tableData);
            } catch (err) {
                console.error(err);
                setPageError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [name, refreshKey]);

    // Handlers
    const openCreateModal = () => {
        setEditingRow(null);
        setFormData({});
        setIsModalOpen(true);
    };

    const openEditModal = (row) => {
        setEditingRow(row);
        setFormData({ ...row });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({});
        setEditingRow(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Filter out empty strings for cleaner data, but allow 0/false
            const cleanData = {};
            Object.keys(formData).forEach(key => {
                const val = formData[key];
                if (val !== '' && val !== null && val !== undefined) {
                    cleanData[key] = val;
                }
            });

            if (editingRow) {
                await api.updateRow(name, editingRow.id, cleanData);
                showToast('Record updated successfully');
            } else {
                await api.createRow(name, cleanData);
                showToast('Record created successfully');
            }

            closeModal();
            setRefreshKey(k => k + 1);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this record?')) return;

        try {
            await api.deleteRow(name, id);
            showToast('Record deleted successfully');
            setRefreshKey(k => k + 1);
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    // Render Helpers
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-500 font-medium">Loading data...</span>
                </div>
            </div>
        );
    }

    if (pageError) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 p-6">
                <div className="text-center max-w-md">
                    <div className="bg-red-100 text-red-600 p-4 rounded-full inline-block mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Failed to load table</h1>
                    <p className="text-gray-600 mb-6">{pageError}</p>
                    <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
            <Toast
                message={toast?.message}
                type={toast?.type}
                onClose={() => setToast(null)}
            />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Link href="/" className="hover:text-blue-600 hover:underline">Dashboard</Link>
                            <span>/</span>
                            <span className="capitalize">{name}</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 capitalize tracking-tight">{name}</h1>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:bg-blue-700 hover:shadow transition flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Record
                    </button>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {columns.map(col => (
                                        <th key={col.column_name} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            {col.column_name}
                                        </th>
                                    ))}
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center">
                                                <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                                                <p className="text-lg font-medium text-gray-900">No records found</p>
                                                <p className="text-sm">Get started by adding a new record.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                            {columns.map((col) => (
                                                <td key={col.column_name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {['created_at', 'updated_at'].includes(col.column_name) && row[col.column_name]
                                                        ? new Date(row[col.column_name]).toLocaleString()
                                                        : String(row[col.column_name] ?? '-')}
                                                </td>
                                            ))}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => openEditModal(row)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(row.id)}
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingRow ? 'Edit Record' : 'Create New Record'}
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto p-1">
                        {columns.map(col => {
                            const isAuto = col.column_default && col.column_default.includes('nextval');
                            const isGenerated = col.is_identity === 'YES' || col.is_generated === 'YES';
                            const isReadOnly = col.column_name === 'id' || isAuto || isGenerated || ['created_at', 'updated_at'].includes(col.column_name);

                            // Skip showing ID in Create mode entirely if it's auto
                            if (!editingRow && isReadOnly) return null;

                            return (
                                <div key={col.column_name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                        {col.column_name.replace(/_/g, ' ')}
                                        {isReadOnly && <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Auto</span>}
                                    </label>
                                    <input
                                        type={col.data_type === 'integer' ? 'number' : 'text'}
                                        disabled={isReadOnly}
                                        placeholder={isReadOnly ? '(Auto-generated)' : ''}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow ${isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'border-gray-300'}`}
                                        value={formData[col.column_name] || ''}
                                        onChange={e => setFormData({ ...formData, [col.column_name]: e.target.value })}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Saving...' : (editingRow ? 'Update Record' : 'Create Record')}
                        </button>
                    </div>
                </form>
            </Modal>
        </main>
    );
}
