import { useState } from "react"
import { Send, Loader2 } from "lucide-react"

interface CreateMessageFormProps {
  onSendMessage: (messageData: any) => Promise<void>
  onSaveDraft: (messageData: any) => void
}

const targetGroups = ["Bus Operators", "Drivers", "Conductors", "Fleet Operators", "Passengers", "All Users"]

export default function CreateMessageForm({ onSendMessage, onSaveDraft }: CreateMessageFormProps) {
  const [messageTitle, setMessageTitle] = useState("")
  const [messageBody, setMessageBody] = useState("")
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [priority, setPriority] = useState("Medium")
  const [category, setCategory] = useState("General")
  const [scheduledTime, setScheduledTime] = useState("")
  const [isScheduled, setIsScheduled] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const handleGroupToggle = (group: string) => {
    setSelectedGroups((prev) => (prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]))
  }

  const handleSendMessage = async () => {
    // Validate required fields
    if (!messageTitle.trim()) {
      alert("Please enter a message title")
      return
    }
    if (!messageBody.trim()) {
      alert("Please enter message content")
      return
    }
    if (selectedGroups.length === 0) {
      alert("Please select at least one target group")
      return
    }

    setIsSending(true)
    try {
      const messageData = { messageTitle, messageBody, selectedGroups, priority, category, scheduledTime, isScheduled }
      await onSendMessage(messageData)
      // Reset form only on success
      setMessageTitle("")
      setMessageBody("")
      setSelectedGroups([])
      setPriority("Medium")
      setCategory("General")
      setScheduledTime("")
      setIsScheduled(false)
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleSaveDraft = () => {
    const messageData = { messageTitle, messageBody, selectedGroups, priority, category, scheduledTime, isScheduled }
    onSaveDraft(messageData)
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Send className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Create New Message</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message Title *</label>
            <input
              type="text"
              placeholder="Enter message title..."
              value={messageTitle}
              onChange={(e) => setMessageTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message Content *</label>
            <textarea
              placeholder="Type your message here..."
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Target Groups *</label>
            <div className="grid grid-cols-2 gap-2">
              {targetGroups.map((group) => (
                <div key={group} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={group}
                    checked={selectedGroups.includes(group)}
                    onChange={() => handleGroupToggle(group)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={group} className="text-sm text-gray-700">
                    {group}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="General">General</option>
                <option value="Emergency">Emergency</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Route Update">Route Update</option>
                <option value="Policy">Policy</option>
                <option value="Training">Training</option>
                <option value="Technology">Technology</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="schedule"
              checked={isScheduled}
              onChange={(e) => setIsScheduled(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="schedule" className="text-sm text-gray-700">
              Schedule for later
            </label>
          </div>

          {isScheduled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Time</label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSendMessage}
              disabled={isSending}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {isScheduled ? "Schedule Message" : "Send Now"}
                </>
              )}
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={isSending}
              className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Save Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}