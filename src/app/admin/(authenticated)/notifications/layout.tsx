"use client"

import { Header } from "@/components/admin/shared"
import { Tabs } from "@/components/admin/ui/tabs"
import { usePathname, useRouter } from "next/navigation"
import { Send, Bell } from "lucide-react"

import { Button } from "@/components/admin/ui/button"

export default function NotificationsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()

    const activeTab = pathname.includes('/sent') ? 'sent' : 'received'

    const handleTabChange = (value: string) => {
        router.push(`/admin/notifications/${value}`)
    }

    const handleSendMessage = () => {
        router.push("/admin/notifications/compose")
    }

    const isComposePage = pathname.includes('/compose');
    return (
        <div className="p-0">
            <Header title="Notification Center" description="Send messages, manage notifications, and track communication history" />


            {/* Send New Message Button */}
            {!isComposePage && (
                <div className="flex justify-end px-6 mt-2">
                    <Button onClick={handleSendMessage} className="bg-blue-600 text-white hover:bg-blue-900 shadow-md">
                        <Send className="h-4 w-4 mr-2" />
                        Send New Message
                    </Button>
                </div>
            )}

            <div className="p-6">
                {isComposePage ? (
                    <div>{children}</div>
                ) : (
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <div className="bg-white rounded-lg shadow-lg px-6 py-4 bg-gradient-to-r from-gray-50 to-white mb-6">
                            <div className="flex items-center space-x-8">
                                <button
                                    onClick={() => handleTabChange("sent")}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === "sent" ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    <Send className="h-4 w-4" />
                                    <span>Sent Notifications</span>
                                </button>
                                <button
                                    onClick={() => handleTabChange("received")}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === "received" ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    <Bell className="h-4 w-4" />
                                    <span>Received Notifications</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            {children}
                        </div>
                    </Tabs>
                )}
            </div>
        </div>
    )
}
