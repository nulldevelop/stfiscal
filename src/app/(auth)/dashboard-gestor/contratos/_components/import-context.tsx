'use client'

import type React from 'react'
import { createContext, useContext, useState } from 'react'

interface ImportContextType {
	isImporting: boolean
	setIsImporting: (value: boolean) => void
}

const ImportContext = createContext<ImportContextType | undefined>(undefined)

export function ImportProvider({ children }: { children: React.ReactNode }) {
	const [isImporting, setIsImporting] = useState(false)

	return (
		<ImportContext.Provider value={{ isImporting, setIsImporting }}>
			{children}
		</ImportContext.Provider>
	)
}

export function useImport() {
	const context = useContext(ImportContext)
	if (context === undefined) {
		throw new Error('useImport must be used within an ImportProvider')
	}
	return context
}
