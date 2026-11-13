"use client"

import { useState } from "react"

export function useDeleteAccount() {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function deleteAccount(): Promise<boolean> {
    setIsDeleting(true)
    setError(null)

    // Řádky 14-24 jsou určeny pro simulaci úspěšného odstranění účtu během vývoje. Pokud je URL obsahuje parametr `simulateAccountDeletion=success`, funkce se chová, jako by odstranění účtu proběhlo úspěšně.
    try {
      const simulateSuccess =
        process.env.NODE_ENV === "development" &&
        new URLSearchParams(window.location.search).get(
          "simulateAccountDeletion",
        ) === "success"

      if (simulateSuccess) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        return true
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL
      if (!baseUrl) {
        throw new Error("Chybí konfigurace adresy API.")
      }

      const response = await fetch(`${baseUrl}/users/me`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Odstranění účtu selhalo (HTTP ${response.status}).`)
      }

      return true
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Účet se nepodařilo odstranit.",
      )
      return false
    } finally {
      setIsDeleting(false)
    }
  }

  return { deleteAccount, isDeleting, error }
}
