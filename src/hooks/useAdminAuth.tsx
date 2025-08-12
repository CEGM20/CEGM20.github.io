'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminPayload } from '@/lib/admin-auth'

interface AdminUser {
  id: string
  username: string
  email?: string
}

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = () => {
    try {
      const token = localStorage.getItem('adminToken')
      const adminUserStr = localStorage.getItem('adminUser')

      if (!token || !adminUserStr) {
        setIsAdmin(false)
        setAdminUser(null)
        setIsLoading(false)
        return
      }

      const adminUser = JSON.parse(adminUserStr)
      setAdminUser(adminUser)
      setIsAdmin(true)
    } catch (error) {
      console.error('Error checking admin auth:', error)
      setIsAdmin(false)
      setAdminUser(null)
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setIsAdmin(false)
    setAdminUser(null)
    router.push('/admin/login')
  }

  return {
    isAdmin,
    isLoading,
    adminUser,
    logout,
    checkAdminAuth
  }
}