import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { getProfile, updateProfile } from '../../api/mockApi'
import { useAppStore } from '../../store/appStore'
import { Card } from '../../components/Card'
import { Skeleton } from '../../components/Skeleton'
import type { User } from '../../types'

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  phone: z.string().trim().min(10, 'Enter a valid phone number'),
  companyName: z.string().trim().min(2, 'Enter your company name'),
  gstNumber: z.string().trim().optional(),
  line1: z.string().trim().min(3, 'Enter your billing address'),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, 'Enter your city'),
  state: z.string().trim().min(2, 'Enter your state'),
  postalCode: z.string().trim().regex(/^[0-9]{6}$/, 'Enter a 6-digit postal code'),
  country: z.string().trim().min(2, 'Enter your country'),
})

type ProfileForm = z.infer<typeof schema>

export function ProfilePage() {
  const sessionUser = useAppStore(state => state.user)
  const setUser = useAppStore(state => state.setUser)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!sessionUser) return
    getProfile(sessionUser.id).then((user: User) => {
      reset({
        name: user.name,
        phone: user.phone ?? '',
        companyName: user.companyName ?? '',
        gstNumber: user.gstNumber ?? '',
        line1: user.billingAddress.line1,
        line2: user.billingAddress.line2 ?? '',
        city: user.billingAddress.city,
        state: user.billingAddress.state,
        postalCode: user.billingAddress.postalCode,
        country: user.billingAddress.country,
      })
    }).finally(() => setLoading(false))
  }, [sessionUser, reset])

  const save = async (values: ProfileForm) => {
    if (!sessionUser) return
    setSaving(true)
    try {
      const updated = await updateProfile(sessionUser.id, {
        name: values.name,
        phone: values.phone,
        companyName: values.companyName,
        gstNumber: values.gstNumber,
        billingAddress: {
          line1: values.line1,
          line2: values.line2,
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
          country: values.country,
        },
      })
      setUser(updated)
      toast.success('Profile saved successfully.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save your profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Skeleton className="h-[520px]" />

  const field = (name: keyof ProfileForm, label: string, type = 'text', placeholder = '') => (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <input id={name} type={type} placeholder={placeholder} {...register(name)} className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900" />
      {errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name]?.message}</p>}
    </div>
  )

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-950 dark:text-white">Profile</h1><p className="mt-1 text-sm text-slate-500">Keep your personal and billing details up to date.</p></div>
      <form onSubmit={handleSubmit(save)} className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card className="p-5 sm:p-6">
          <h2 className="mb-5 font-bold text-slate-950 dark:text-white">Personal details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {field('name', 'Full name')}
            {field('phone', 'Phone number', 'tel', '+91 98765 43210')}
            {field('companyName', 'Company name')}
            {field('gstNumber', 'GST number', 'text', '29ABCDE1234F1Z5')}
          </div>
        </Card>
        <Card className="p-5 sm:p-6">
          <h2 className="mb-5 font-bold text-slate-950 dark:text-white">Billing address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">{field('line1', 'Address line 1')}</div>
            <div className="sm:col-span-2">{field('line2', 'Address line 2 (optional)')}</div>
            {field('city', 'City')}
            {field('state', 'State')}
            {field('postalCode', 'Postal code')}
            {field('country', 'Country')}
          </div>
        </Card>
        <div className="xl:col-span-2 flex justify-end"><button disabled={saving} className="h-11 rounded-xl bg-indigo-600 px-5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">{saving ? 'Saving...' : 'Save changes'}</button></div>
      </form>
    </div>
  )
}
