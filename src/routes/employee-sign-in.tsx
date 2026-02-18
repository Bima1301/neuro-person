import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { AlertCircle, Brain, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { DEMO_USERS } from 'prisma/seed/data'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient, useSession } from '@/integrations/better-auth/client'
import { useTRPC } from '@/integrations/trpc/react'
import { env } from '@/env'
import Logo from '@/components/shared/logo'

export const Route = createFileRoute('/employee-sign-in')({
  component: EmployeeSignInPage,
})

function EmployeeSignInPage() {
  const isDemo = env.VITE_IS_DEMO
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { data: session, isPending: isSessionLoading } = useSession()
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const usernameId = useId()
  const passwordId = useId()

  // Redirect if already signed in
  useEffect(() => {
    if (!isSessionLoading && session?.user) {
      navigate({ to: '/employee' })
    }
  }, [session, isSessionLoading, navigate])

  const { data: employee } = useQuery(
    { ...trpc.employee.getByEmail.queryOptions({ email: isDemo ? DEMO_USERS.find(user => user.role === 'EMPLOYEE')?.email || '' : '' }), enabled: isDemo },
  )

  useEffect(() => {
    if (isDemo && employee) {
      setUsername(employee.email)
      setPassword('123123123')
    }
  }, [isDemo, employee])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    setIsValidating(true)

    try {
      // Validate username against employee database
      const result = await queryClient.fetchQuery(
        trpc.organization.validateEmployeeIdentifier.queryOptions({
          identifier: username,
        }),
      )

      if (!result.isValid) {
        setValidationError(result.reason || 'Username tidak valid')
        setIsValidating(false)
        return
      }

      // Username is valid, get email from result and proceed with Better Auth sign-in
      if (!result.email) {
        setValidationError('Email tidak ditemukan untuk username ini')
        setIsValidating(false)
        return
      }

      setIsValidating(false)
      setIsSubmitting(true)

      // Use email from validation result for Better Auth login
      const signInResult = await authClient.signIn.email({
        email: result.email,
        password,
      })

      if (signInResult.error) {
        setValidationError(
          signInResult.error.message || 'Username atau password tidak valid',
        )
        setIsSubmitting(false)
        return
      }

      // Sign-in successful, redirect will happen via useEffect
    } catch (error: unknown) {
      console.error('Error during sign-in:', error)
      const errorMessage =
        error &&
          typeof error === 'object' &&
          'message' in error &&
          typeof (error as { message: string }).message === 'string'
          ? (error as { message: string }).message
          : 'Terjadi kesalahan saat memvalidasi username'
      setValidationError(errorMessage)
      setIsSubmitting(false)
    }
  }

  if (isSessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-slate-900 to-slate-800">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <Link className="flex justify-center mb-8" to="/">
          <Logo />
        </Link>

        <Card className="bg-stone-900 border-white/5 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">
              Masuk ke Portal Karyawan
            </CardTitle>
            <CardDescription className="text-white/60">
              Masukkan username dan password yang terdaftar sebagai karyawan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={usernameId} className="text-white/90">
                  Username
                </Label>
                <Input
                  id={usernameId}
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setValidationError(null)
                  }}
                  required
                  disabled={isValidating || isSubmitting}
                  autoComplete="username"
                  className="bg-[#252932] border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={passwordId} className="text-white/90">
                  Password
                </Label>
                <Input
                  id={passwordId}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setValidationError(null)
                  }}
                  required
                  disabled={isValidating || isSubmitting}
                  autoComplete="current-password"
                  className="bg-[#252932] border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400"
                  suffixIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-white/50 hover:text-white/70 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  }
                />
              </div>

              {validationError && (
                <Alert
                  variant="destructive"
                  className="bg-red-900/20 border-red-500/50"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-200">
                    {validationError}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                disabled={
                  isValidating || isSubmitting || !username || !password
                }
              >
                {isValidating || isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isValidating ? 'Memvalidasi...' : 'Masuk...'}
                  </>
                ) : (
                  'Masuk'
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-white/60">
              <p>
                Hanya karyawan yang terdaftar di sistem yang dapat mengakses
                portal ini.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
