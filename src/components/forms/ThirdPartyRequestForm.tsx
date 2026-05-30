import { useState } from 'react'
import { useEvent } from '../../context/EventContext'
import { newId } from '../../lib/datetime'
import {
  THIRD_PARTY_MATERIAL_LABELS,
  THIRD_PARTY_ORG_LABELS,
  THIRD_PARTY_STATUS_LABELS,
} from '../../lib/thirdParties'
import { darkBtnPrimary, darkInput, darkLabel } from '../ui/darkForm'
import type {
  ThirdPartyMaterialCategory,
  ThirdPartyOrgKind,
  ThirdPartyRequest,
  ThirdPartyRequestStatus,
} from '../../types'

interface Props {
  initial?: ThirdPartyRequest
  onDone: () => void
}

export function ThirdPartyRequestForm({ initial, onDone }: Props) {
  const { data, saveThirdPartyRequest } = useEvent()
  const [organizationName, setOrganizationName] = useState(
    initial?.organization_name ?? '',
  )
  const [orgKind, setOrgKind] = useState<ThirdPartyOrgKind>(
    initial?.organization_kind ?? 'municipality',
  )
  const [materialCategory, setMaterialCategory] = useState<ThirdPartyMaterialCategory>(
    initial?.material_category ?? 'sound',
  )
  const [itemDescription, setItemDescription] = useState(
    initial?.item_description ?? '',
  )
  const [quantity, setQuantity] = useState(initial?.quantity ?? '')
  const [status, setStatus] = useState<ThirdPartyRequestStatus>(
    initial?.status ?? 'draft',
  )
  const [referenceNumber, setReferenceNumber] = useState(
    initial?.reference_number ?? '',
  )
  const [contactName, setContactName] = useState(initial?.contact_name ?? '')
  const [contactEmail, setContactEmail] = useState(initial?.contact_email ?? '')
  const [contactPhone, setContactPhone] = useState(initial?.contact_phone ?? '')
  const [requestedAt, setRequestedAt] = useState(initial?.requested_at ?? '')
  const [neededBy, setNeededBy] = useState(initial?.needed_by ?? '')
  const [submittedAt, setSubmittedAt] = useState(initial?.submitted_at ?? '')
  const [resolvedAt, setResolvedAt] = useState(initial?.resolved_at ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!organizationName.trim() || !itemDescription.trim()) return
    setSaving(true)
    await saveThirdPartyRequest(
      {
        id: initial?.id ?? newId(),
        event_id: data.event.id,
        organization_name: organizationName.trim(),
        organization_kind: orgKind,
        material_category: materialCategory,
        item_description: itemDescription.trim(),
        quantity: quantity.trim() || null,
        status,
        reference_number: referenceNumber.trim() || null,
        contact_name: contactName.trim() || null,
        contact_email: contactEmail.trim() || null,
        contact_phone: contactPhone.trim() || null,
        requested_at: requestedAt || null,
        needed_by: neededBy || null,
        submitted_at: submittedAt || null,
        resolved_at: resolvedAt || null,
        notes: notes.trim() || null,
      },
      !initial,
    )
    setSaving(false)
    onDone()
  }

  const selectClass = darkInput

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className={darkLabel}>Entidade</span>
        <input
          className={darkInput}
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          required
          placeholder="Ex.: Câmara Municipal de …"
        />
      </label>
      <label className="block">
        <span className={darkLabel}>Tipo de entidade</span>
        <select
          className={selectClass}
          value={orgKind}
          onChange={(e) => setOrgKind(e.target.value as ThirdPartyOrgKind)}
        >
          {(Object.keys(THIRD_PARTY_ORG_LABELS) as ThirdPartyOrgKind[]).map(
            (k) => (
              <option key={k} value={k}>
                {THIRD_PARTY_ORG_LABELS[k]}
              </option>
            ),
          )}
        </select>
      </label>
      <label className="block">
        <span className={darkLabel}>Categoria de material</span>
        <select
          className={selectClass}
          value={materialCategory}
          onChange={(e) =>
            setMaterialCategory(e.target.value as ThirdPartyMaterialCategory)
          }
        >
          {(
            Object.keys(THIRD_PARTY_MATERIAL_LABELS) as ThirdPartyMaterialCategory[]
          ).map((k) => (
            <option key={k} value={k}>
              {THIRD_PARTY_MATERIAL_LABELS[k]}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className={darkLabel}>Descrição do pedido</span>
        <textarea
          className={darkInput}
          rows={2}
          value={itemDescription}
          onChange={(e) => setItemDescription(e.target.value)}
          required
          placeholder="Ex.: Sistema PA com 2 colunas e mesa de mistura"
        />
      </label>
      <label className="block">
        <span className={darkLabel}>Quantidade / dimensão</span>
        <input
          className={darkInput}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Ex.: 80 cadeiras, 200 m de vedação"
        />
      </label>
      <label className="block">
        <span className={darkLabel}>Estado do pedido</span>
        <select
          className={selectClass}
          value={status}
          onChange={(e) => setStatus(e.target.value as ThirdPartyRequestStatus)}
        >
          {(
            Object.keys(THIRD_PARTY_STATUS_LABELS) as ThirdPartyRequestStatus[]
          ).map((k) => (
            <option key={k} value={k}>
              {THIRD_PARTY_STATUS_LABELS[k]}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className={darkLabel}>N.º referência / processo</span>
        <input
          className={darkInput}
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.target.value)}
          placeholder="Referência da autarquia ou entidade"
        />
      </label>
      <div className="form-grid-2">
        <label className="block">
          <span className={darkLabel}>Contacto</span>
          <input
            className={darkInput}
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
        </label>
        <label className="block">
          <span className={darkLabel}>Telefone</span>
          <input
            className={darkInput}
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </label>
      </div>
      <label className="block">
        <span className={darkLabel}>Email</span>
        <input
          type="email"
          className={darkInput}
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
        />
      </label>
      <div className="form-grid-2">
        <label className="block">
          <span className={darkLabel}>Data do pedido</span>
          <input
            type="date"
            className={darkInput}
            value={requestedAt}
            onChange={(e) => setRequestedAt(e.target.value)}
          />
        </label>
        <label className="block">
          <span className={darkLabel}>Necessário até</span>
          <input
            type="date"
            className={darkInput}
            value={neededBy}
            onChange={(e) => setNeededBy(e.target.value)}
          />
        </label>
      </div>
      <div className="form-grid-2">
        <label className="block">
          <span className={darkLabel}>Data envio</span>
          <input
            type="date"
            className={darkInput}
            value={submittedAt}
            onChange={(e) => setSubmittedAt(e.target.value)}
          />
        </label>
        <label className="block">
          <span className={darkLabel}>Data resolução</span>
          <input
            type="date"
            className={darkInput}
            value={resolvedAt}
            onChange={(e) => setResolvedAt(e.target.value)}
          />
        </label>
      </div>
      <label className="block">
        <span className={darkLabel}>Notas</span>
        <textarea
          className={darkInput}
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>
      <button
        type="submit"
        disabled={saving || !organizationName.trim() || !itemDescription.trim()}
        className={darkBtnPrimary}
      >
        {saving ? 'A guardar…' : initial ? 'Atualizar pedido' : 'Registar pedido'}
      </button>
    </form>
  )
}
