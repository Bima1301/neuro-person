import { zodResolver } from '@hookform/resolvers/zod'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { AlertCircle, Brain, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import CircleLoader from '@/components/shared/circle-loader'
import Logo from '@/components/shared/logo'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { authClient, useSession } from '@/integrations/better-auth/client'

const signUpSchema = z
  .object({
    name: z.string().min(2, 'Nama minimal 2 karakter'),
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  })

type SignUpInput = z.infer<typeof signUpSchema>

export const Route = createFileRoute('/sign-up')({
  component: SignUpPage,
})

function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { data: session, isPending: isSessionLoading } = useSession()

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  // Redirect if already signed in
  useEffect(() => {
    if (!isSessionLoading && session?.user) {
      navigate({ to: '/app' })
    }
  }, [session, isSessionLoading, navigate])

  const onSubmit = async (data: SignUpInput) => {
    setError(null)
    setIsSubmitting(true)

    try {
      // Sign up user
      const signUpResult = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      })

      if (signUpResult.error) {
        setError(
          signUpResult.error.message || 'Gagal mendaftar. Silakan coba lagi.',
        )
        setIsSubmitting(false)
        return
      }

      // After sign-up, automatically sign in
      const signInResult = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      })

      if (signInResult.error) {
        setError(
          signInResult.error.message || 'Gagal login. Silakan coba lagi.',
        )
        setIsSubmitting(false)
        return
      }

      // Sign-in successful, redirect to onboarding (user will be redirected to app if already has organization)
      navigate({ to: '/onboarding' })
    } catch (error: unknown) {
      console.error('Error during sign-up:', error)
      const errorMessage =
        error &&
          typeof error === 'object' &&
          'message' in error &&
          typeof (error as { message: string }).message === 'string'
          ? (error as { message: string }).message
          : 'Terjadi kesalahan saat mendaftar'
      setError(errorMessage)
      setIsSubmitting(false)
    }
  }

  if (isSessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <CircleLoader />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md space-y-8">
          <Link to="/" >
            <Logo />
          </Link>


          <div className="space-y-2 mt-4">
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600">
              Enter your information to create your account
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900">
                      Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        {...field}
                        disabled={isSubmitting}
                        autoComplete="name"
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900">
                      Email <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your mail address"
                        {...field}
                        disabled={isSubmitting}
                        autoComplete="email"
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900">
                      Password <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        {...field}
                        disabled={isSubmitting}
                        autoComplete="new-password"
                        className="h-11"
                        suffixIcon={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900">
                      Confirm Password <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        {...field}
                        disabled={isSubmitting}
                        autoComplete="new-password"
                        className="h-11"
                        suffixIcon={
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/sign-in"
              className="text-primary font-medium hover:underline"
            >
              Login here
            </Link>
          </div>

          <div className="pt-4 border-t text-center">
            <Link
              to="/employee-sign-in"
              className="text-sm text-primary hover:underline"
            >
              Masuk sebagai karyawan
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-linear-to-br from-blue-600 via-purple-600 to-indigo-700">
        <DecorativeBackground />
      </div>
    </div>
  )
}

// Decorative Background Component (same as sign-in)
function DecorativeBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-20 right-20 w-64 h-64 bg-yellow-400 rounded-full opacity-20 blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-400 rounded-full opacity-20 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-400 rounded-full opacity-15 blur-3xl" />

      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-lg rotate-45" />
        <div className="absolute top-40 right-20 w-24 h-24 border-4 border-white rounded-full" />
        <div className="absolute bottom-32 left-32 w-20 h-20 border-4 border-white rotate-45" />
        <div className="absolute bottom-20 right-40 w-28 h-28 border-4 border-white rounded-lg" />
      </div>

      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center p-12">
        <div className="text-center text-white space-y-6 max-w-md">
          <div className="w-20 h-20 bg-white/20 rounded-2xl mx-auto flex items-center justify-center backdrop-blur-sm">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold">NeuroPerson</h2>
          <p className="text-white/80 text-lg">
            Manage your workforce efficiently with our comprehensive HR
            management system
          </p>
        </div>
      </div>
    </div>
  )
}
