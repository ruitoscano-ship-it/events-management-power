import { useState } from 'react'
import { newId } from '../../lib/datetime'
import { isValidPhone, isValidPin } from '../../lib/phone'
import { isSupabaseConfigured } from '../../lib/supabase'
import { resetVolunteerPin } from '../../lib/volunteerAuth'
import { useEvent } from '../../context/EventContext'
import {
  FormField,
  inputClass,
  submitButtonClass,
  cancelButtonClass,
} from '../ui/FormField'
import type { Volunteer } from '../../types'

interface Props {
  initial?: Volunteer
  isNew?: boolean
  onDone: () => void
  onCancel?: () => void
}

export function VolunteerForm({ initial, isNew = false, onDone, onCancel }: Props) {
  const { data, saveVolunteer } = useEvent()
  const [name, setName] = useState(initial?.name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [role, setRole] = useState(initial?.role ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [resetPin, setResetPin] = useState(false)
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const canResetPin =
    !isNew &&
    initial &&
    isSupabaseConfigured &&
    Boolean(initial.account_id || (phone && isValidPhone(phone)))

  function handleCancel() {
    if (saving) return
    ;(onCancel ?? onDone)()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (resetPin) {
      if (!isValidPin(newPin)) {
        setFormError('O novo código deve ter 4 dígitos.')
        return
      }
      if (newPin !== confirmPin) {
        setFormError('Os dois códigos não coincidem.')
        return
      }
    }

    setSaving(true)

    const volunteer: Volunteer = {
      id: initial?.id ?? newId(),
      event_id: data.event.id,
      account_id: initial?.account_id ?? null,
      name,
      email: email || null,
      phone: phone || null,
      role: role || null,
      notes: notes || null,
      active: initial?.active ?? true,
    }

    await saveVolunteer(volunteer, isNew || !initial)

    if (resetPin && canResetPin) {
      const pinResult = await resetVolunteerPin({
        pin: newPin,
        accountId: initial?.account_id,
        phone: phone || initial?.phone,
      })
      if (!pinResult.ok) {
        setFormError(pinResult.error)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    onDone()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-full min-h-0 w-full flex-col"
    >
      <div className="modal-dialog-scroll min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-5">
        {formError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </p>
        )}

        <FormField label="Nome">
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Função">
          <input
            className={inputClass}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Catering, Logística…"
          />
        </FormField>
        <FormField label="Email">
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>
        <FormField label="Telefone">
          <input
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
          />
        </FormField>
        <FormField label="Notas">
          <textarea
            className={inputClass}
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </FormField>

        {canResetPin && (
          <fieldset className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
            <legend className="text-xs font-bold uppercase tracking-wide text-slate-600 px-1">
              Acesso à app (voluntário)
            </legend>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={resetPin}
                onChange={(e) => {
                  setResetPin(e.target.checked)
                  if (!e.target.checked) {
                    setNewPin('')
                    setConfirmPin('')
                    setFormError(null)
                  }
                }}
                className="mt-1 h-4 w-4 rounded border-slate-300 accent-[#ff2d6a]"
              />
              <span className="text-sm text-slate-700">
                Redefinir código de 4 dígitos
                <span className="block text-xs text-slate-500 mt-0.5">
                  O voluntário usa este código com o telefone para entrar na app.
                </span>
              </span>
            </label>
            {resetPin && (
              <>
                <FormField label="Novo código (4 dígitos)">
                  <input
                    className={inputClass}
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    pattern="\d{4}"
                    value={newPin}
                    onChange={(e) =>
                      setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))
                    }
                    placeholder="••••"
                    autoComplete="new-password"
                    required={resetPin}
                  />
                </FormField>
                <FormField label="Confirmar código">
                  <input
                    className={inputClass}
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    pattern="\d{4}"
                    value={confirmPin}
                    onChange={(e) =>
                      setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))
                    }
                    placeholder="••••"
                    autoComplete="new-password"
                    required={resetPin}
                  />
                </FormField>
              </>
            )}
          </fieldset>
        )}

        {!isNew && initial && isSupabaseConfigured && !canResetPin && (
          <p className="text-xs text-slate-600 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            Sem conta de acesso ligada. Adiciona um telefone válido ou o voluntário
            regista-se na app com o mesmo número.
          </p>
        )}
      </div>

      <div className="shrink-0 flex flex-col-reverse gap-2 border-t border-slate-100 bg-white px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-5">
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className={`${cancelButtonClass} sm:min-w-[7.5rem]`}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className={`${submitButtonClass} sm:min-w-[7.5rem]`}
        >
          {saving
            ? 'A guardar…'
            : resetPin
              ? 'Guardar e atualizar código'
              : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
