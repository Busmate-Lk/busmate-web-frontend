'use client';

import { useState } from 'react';
import { Edit, Plus, Trash, X, Check } from "lucide-react";
import { useScheduleWorkspace } from '@/context/ScheduleWorkspace';
import { createEmptyException, ExceptionTypeEnum, ScheduleException } from '@/types/ScheduleWorkspaceData';

export default function ScheduleExceptions() {
    const { data, addException, updateException, removeException } = useScheduleWorkspace();
    const { schedule } = data;
    const { exceptions } = schedule;

    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<ScheduleException>(createEmptyException());

    const handleAddNew = () => {
        setIsAddingNew(true);
        setEditForm(createEmptyException());
        setEditingIndex(null);
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setEditForm({ ...exceptions[index] });
        setIsAddingNew(false);
    };

    const handleSave = () => {
        if (!editForm.exceptionDate) return;

        if (isAddingNew) {
            addException(editForm);
            setIsAddingNew(false);
        } else if (editingIndex !== null) {
            updateException(editingIndex, editForm);
            setEditingIndex(null);
        }
        setEditForm(createEmptyException());
    };

    const handleCancel = () => {
        setIsAddingNew(false);
        setEditingIndex(null);
        setEditForm(createEmptyException());
    };

    const handleDelete = (index: number) => {
        if (confirm('Are you sure you want to remove this exception?')) {
            removeException(index);
        }
    };

    return (
        <div className="flex flex-col rounded-md px-4 py-2 bg-gray-200 w-2/5">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Schedule Exceptions ({exceptions.length})</span>
                <button 
                    onClick={handleAddNew}
                    disabled={isAddingNew}
                    className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50"
                >
                    <Plus size={14}/>
                    <span>Add Exception</span>
                </button>
            </div>
            
            {/* Add new exception form */}
            {isAddingNew && (
                <div className="bg-blue-50 border border-blue-300 rounded p-2 mb-2">
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={editForm.exceptionDate}
                                onChange={(e) => setEditForm({ ...editForm, exceptionDate: e.target.value })}
                                className="flex-1 text-xs border border-gray-300 rounded px-2 py-1"
                            />
                            <select
                                value={editForm.exceptionType}
                                onChange={(e) => setEditForm({ ...editForm, exceptionType: e.target.value as ExceptionTypeEnum })}
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                                <option value={ExceptionTypeEnum.REMOVED}>Removed</option>
                                <option value={ExceptionTypeEnum.ADDED}>Added</option>
                            </select>
                        </div>
                        <input
                            type="text"
                            placeholder="Description (optional)"
                            value={editForm.description || ''}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                        />
                        <div className="flex justify-end gap-1">
                            <button
                                onClick={handleCancel}
                                className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded"
                            >
                                <X size={14} />
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!editForm.exceptionDate}
                                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                <Check size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-1 max-h-48 overflow-y-auto">
                {exceptions.length === 0 && !isAddingNew && (
                    <div className="text-xs text-gray-500 text-center py-4">
                        No exceptions added yet
                    </div>
                )}
                
                {exceptions.map((exception, index) => (
                    <div key={exception.id || index}>
                        {editingIndex === index ? (
                            // Edit mode
                            <div className="bg-yellow-50 border border-yellow-300 rounded p-2">
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            value={editForm.exceptionDate}
                                            onChange={(e) => setEditForm({ ...editForm, exceptionDate: e.target.value })}
                                            className="flex-1 text-xs border border-gray-300 rounded px-2 py-1"
                                        />
                                        <select
                                            value={editForm.exceptionType}
                                            onChange={(e) => setEditForm({ ...editForm, exceptionType: e.target.value as ExceptionTypeEnum })}
                                            className="text-xs border border-gray-300 rounded px-2 py-1"
                                        >
                                            <option value={ExceptionTypeEnum.REMOVED}>Removed</option>
                                            <option value={ExceptionTypeEnum.ADDED}>Added</option>
                                        </select>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Description (optional)"
                                        value={editForm.description || ''}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        className="text-xs border border-gray-300 rounded px-2 py-1"
                                    />
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={handleCancel}
                                            className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded"
                                        >
                                            <X size={14} />
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={!editForm.exceptionDate}
                                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                        >
                                            <Check size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // View mode
                            <div className="bg-white border border-gray-300 rounded p-2 flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-xs font-medium w-20 shrink-0">{exception.exceptionDate}</span>
                                    <span className={`px-1 py-0.5 text-xs rounded shrink-0 ${
                                        exception.exceptionType === 'REMOVED' ? 'bg-red-100 text-red-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                        {exception.exceptionType}
                                    </span>
                                    {exception.description && (
                                        <span className="text-xs text-gray-600 truncate" title={exception.description}>
                                            {exception.description}
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button 
                                        onClick={() => handleEdit(index)}
                                        className="text-blue-600 hover:text-blue-800 p-1"
                                    >
                                        <Edit size={14}/>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(index)}
                                        className="text-red-600 hover:text-red-800 p-1"
                                    >
                                        <Trash size={14}/>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
