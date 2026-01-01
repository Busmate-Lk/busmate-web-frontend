import { Delete, Edit, Edit2Icon, Plus, Trash } from "lucide-react";

export default function ScheduleExceptions() {

    // Dummy data
    const exceptions = [
        {
            id: 'EX001',
            date: '2024-01-15',
            exceptionType: 'ADDED',
            description: 'Independence Day - No service'
        },
        {
            id: 'EX002',
            date: '2024-02-14',
            exceptionType: 'REMOVED',
            description: 'Valentine\'s Day - Extra services'
        },
        {
            id: 'EX003',
            date: '2024-04-01',
            exceptionType: 'REMOVED',
            description: 'Road maintenance - Route diversion'
        }
    ];

    return (
        <div className="flex flex-col rounded-md px-4 py-2 bg-gray-200 w-2/5">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Schedule Exceptions</span>
                <button className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center gap-1">
                    <Plus size={14}/>
                    <span>Add Exception</span>
                </button>
            </div>
            <div className="space-y-1">
                {exceptions.map(exception => (
                    <div key={exception.id} className="bg-white border border-gray-300 rounded p-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium w-20">{exception.date}</span>
                            <span className={`px-1 py-0.5 text-xs rounded ${
                                exception.exceptionType === 'REMOVED' ? 'bg-red-100 text-red-800' :
                                exception.exceptionType === 'ADDED' ? 'bg-green-100 text-green-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {exception.exceptionType}
                            </span>
                            <span className="text-xs text-gray-600 truncate">{exception.description}</span>
                        </div>
                        <div className="flex gap-1">
                            <button className="text-blue-600 hover:text-blue-800 text-xs">
                                <Edit size={14}/>
                            </button>
                            <button className="text-red-600 hover:text-red-800 text-xs">
                                <Trash size={14}/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
