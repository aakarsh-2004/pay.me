import React from "react"

export const Center = ({ children }: { children: React.ReactNode }) => {
    return <div className="flex justify-center flex-col h-full items-center">
        <div className="flex justify-center items-center">
            {children}
        </div>
    </div>
}