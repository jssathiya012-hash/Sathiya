import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { LoaderCircle } from 'lucide-react'
import { AuthLayout } from '../../components/AuthLayout'
import { PasswordInput } from '../../components/PasswordInput'
import { resetPassword } from '../../api/mockApi'
import { isValidPassword } from '../../lib/validators'

const schema = z.object({
  password: z.string().refine(isValidPassword, 'Use more than 8 characters with upper, lower and special characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

export function ResetPasswordPage() {
  const { token = '' } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const result = schema.safeParse({ password, confirmPassword })
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Please check your password')
      return
    }
    setLoading(true)
    setError('')
    try {
      await resetPassword(token, password)
      toast.success('Password reset successfully. Please sign in.')
      navigate('/login')
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Could not reset your password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Choose a new password" subtitle="Use a strong password you have not used before.">
      <form onSubmit={submit} className="space-y-4">
        <PasswordInput label="New password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" />
        <PasswordInput label="Confirm new password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} autoComplete="new-password" />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button disabled={loading} className="flex h-11 w-full items-center justify-center rounded-xl bg-indigo-600 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
          {loading ? <LoaderCircle className="animate-spin" size={20} /> : 'Reset password'}
        </button>
      </form>
      <Link to="/login" className="mt-6 block text-center text-sm font-semibold text-slate-600 hover:text-indigo-700">Back to sign in</Link>
    </AuthLayout>
  )
}
