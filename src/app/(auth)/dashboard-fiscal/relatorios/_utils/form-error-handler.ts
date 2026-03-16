'use client'

import type { FieldErrors, UseFormReturn } from 'react-hook-form'

type FormValues = Record<string, unknown>

export function handleFormValidationError<T extends FormValues>(
	errors: FieldErrors<T>,
	form: UseFormReturn<T>,
	onError?: () => void,
): boolean {
	// Encontrar o primeiro campo com erro
	const firstErrorField = Object.keys(errors)[0] as keyof T

	if (firstErrorField) {
		// Tentar encontrar o elemento do campo para dar foco
		const fieldName = firstErrorField as string

		// Tentar diferentes formas de encontrar o elemento
		let inputElement: HTMLElement | null = null

		// 1. Tentar pelo ID do campo
		inputElement = document.getElementById(fieldName)

		// 2. Tentar pelo name
		if (!inputElement) {
			inputElement = document.querySelector(`[name="${fieldName}"]`)
		}

		// 3. Tentar pelo aria-invalid
		if (!inputElement) {
			const allInputs = document.querySelectorAll('[aria-invalid="true"]')
			if (allInputs.length > 0) {
				inputElement = allInputs[0] as HTMLElement
			}
		}

		// Dar foco no primeiro campo com erro
		if (inputElement) {
			inputElement.focus()
			// Scroll para o elemento
			inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
		}

		// Chamar o callback de erro (fecha o modal)
		if (onError) {
			onError()
		}

		return true
	}

	return false
}
