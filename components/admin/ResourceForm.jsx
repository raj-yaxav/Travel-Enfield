'use client';

import { useEffect, useState } from 'react';
import ImageUploader from './ImageUploader';
import { IconPlus, IconTrash, IconX } from './Icons';
import { adminFetch } from '../../lib/admin-api';

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20';

function StringArrayField({ value, onChange }) {
  const text = (value || []).join('\n');
  return (
    <textarea
      rows={Math.min(8, Math.max(3, (value?.length || 1) + 1))}
      value={text}
      onChange={e => onChange(e.target.value.split('\n'))}
      placeholder="One item per line"
      className={inputClass}
    />
  );
}

function MultiSelectField({ field, value, onChange }) {
  const selected = Array.isArray(value) ? value : [];

  function toggle(option) {
    onChange(selected.includes(option)
      ? selected.filter(item => item !== option)
      : [...selected, option]);
  }

  return (
    <div className="grid grid-cols-1 gap-2 rounded-lg border border-gray-200 bg-gray-50/60 p-3 sm:grid-cols-2">
      {field.options.map(option => {
        const value = typeof option === 'string' ? option : option.value;
        const label = typeof option === 'string' ? option : option.label;
        const checked = selected.includes(value);
        return (
          <label key={value} className={`flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-sm font-medium transition-colors ${checked ? 'bg-brand-purple/10 text-brand-purple' : 'text-gray-700 hover:bg-white'}`}>
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(value)}
              className="h-4 w-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple"
            />
            <span>{label}</span>
          </label>
        );
      })}
    </div>
  );
}

function MultiDateField({ value, onChange }) {
  const [pendingDate, setPendingDate] = useState('');
  const dates = Array.isArray(value) ? value : [];
  const formatDate = date => /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${date}T00:00:00`))
    : date;
  const addDate = () => {
    if (!pendingDate || dates.includes(pendingDate)) return;
    onChange([...dates, pendingDate].sort());
    setPendingDate('');
  };
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-3">
      <div className="flex flex-wrap gap-2">
        <input type="date" value={pendingDate} onChange={event => setPendingDate(event.target.value)} className={inputClass} aria-label="Choose departure date" />
        <button type="button" onClick={addDate} disabled={!pendingDate || dates.includes(pendingDate)} className="rounded-lg bg-brand-purple px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50">Add date</button>
      </div>
      {dates.length ? <ul className="mt-3 grid gap-2 sm:grid-cols-2">{dates.map(date => <li key={date} className="flex min-h-10 items-center justify-between gap-2 rounded-md bg-white px-3 text-sm font-semibold text-gray-700 ring-1 ring-gray-200"><span>{formatDate(date)}</span><button type="button" onClick={() => onChange(dates.filter(item => item !== date))} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${formatDate(date)}`}><IconX className="h-4 w-4" /></button></li>)}</ul> : <p className="mt-3 text-sm text-gray-500">No departure dates added yet.</p>}
    </div>
  );
}

function ImageArrayField({ value, onChange }) {
  const list = value || [];
  return (
    <div className="flex flex-wrap gap-3">
      {list.map((url, idx) => (
        <div key={idx} className="relative">
          <img src={url} alt="" className="h-24 w-24 rounded-lg border border-gray-200 object-cover" />
          <button
            type="button"
            onClick={() => onChange(list.filter((_, i) => i !== idx))}
            className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-gray-500 shadow ring-1 ring-gray-200 hover:text-red-600"
            aria-label="Remove image"
          >
            <IconX className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <ImageUploader value="" onChange={url => url && onChange([...list, url])} label="Add" />
    </div>
  );
}

function ObjectArrayField({ items, itemFields, onChange }) {
  const list = items || [];

  function updateItem(idx, name, val) {
    onChange(list.map((item, i) => (i === idx ? { ...item, [name]: val } : item)));
  }
  function removeItem(idx) {
    onChange(list.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-3">
      {list.map((item, idx) => (
        <div key={idx} className="rounded-lg border border-gray-200 bg-gray-50/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-400">#{idx + 1}</span>
            <button type="button" onClick={() => removeItem(idx)} className="rounded p-1 text-gray-400 hover:text-red-600" aria-label="Remove">
              <IconTrash className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {itemFields.map(subField => (
              <div key={subField.name} className={subField.type === 'textarea' || subField.type === 'stringArray' ? 'sm:col-span-2' : ''}>
                <FieldInput field={subField} value={item[subField.name]} onChange={val => updateItem(idx, subField.name, val)} compact />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...list, {}])}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-semibold text-gray-500 transition-colors hover:border-brand-purple hover:text-brand-purple"
      >
        <IconPlus className="h-4 w-4" /> Add
      </button>
    </div>
  );
}

function FieldControl({ field, value, onChange }) {
  switch (field.type) {
    case 'textarea':
      return <textarea rows={4} value={value ?? ''} onChange={e => onChange(e.target.value)} className={inputClass} />;
    case 'number':
      return <input type="number" value={value ?? ''} onChange={e => onChange(e.target.value === '' ? undefined : Number(e.target.value))} className={inputClass} />;
    case 'boolean':
      return (
        <label className="inline-flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={Boolean(value)} onChange={e => onChange(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple" />
          Enabled
        </label>
      );
    case 'select':
      return (
        <select value={value ?? ''} onChange={e => onChange(e.target.value)} className={inputClass}>
          <option value="">Select…</option>
          {field.options.map(opt => {
            const optionValue = typeof opt === 'string' ? opt : opt.value;
            const optionLabel = typeof opt === 'string' ? opt : opt.label;
            return <option key={optionValue} value={optionValue}>{optionLabel}</option>;
          })}
        </select>
      );
    case 'date':
      return <input type="date" value={value ? String(value).slice(0, 10) : ''} onChange={e => onChange(e.target.value)} className={inputClass} />;
    case 'image':
      return <ImageUploader value={value} onChange={onChange} />;
    case 'imageArray':
      return <ImageArrayField value={value} onChange={onChange} />;
    case 'stringArray':
      return <StringArrayField value={value} onChange={onChange} />;
    case 'multiSelect':
      return <MultiSelectField field={field} value={value} onChange={onChange} />;
    case 'multiDate':
      return <MultiDateField value={value} onChange={onChange} />;
    case 'objectArray':
      return <ObjectArrayField items={value} itemFields={field.itemFields} onChange={onChange} />;
    default:
      return <input type="text" value={value ?? ''} onChange={e => onChange(e.target.value)} className={inputClass} />;
  }
}

function FieldInput({ field, value, onChange, compact }) {
  return (
    <div>
      <label className={`mb-1 block font-semibold text-gray-700 ${compact ? 'text-xs' : 'text-sm'}`}>
        {field.label}
        {field.required && <span className="text-red-500"> *</span>}
      </label>
      <FieldControl field={field} value={value} onChange={onChange} />
      {field.hint && !compact && <p className="mt-1 text-xs text-gray-400">{field.hint}</p>}
    </div>
  );
}

function cleanValue(fields, value) {
  const result = { ...value };
  fields.forEach(field => {
    if (field.type === 'stringArray') {
      result[field.name] = (result[field.name] || []).map(s => s.trim()).filter(Boolean);
    } else if (field.type === 'objectArray') {
      result[field.name] = (result[field.name] || []).map(item => cleanValue(field.itemFields, item));
    }
  });
  return result;
}

export default function ResourceForm({ config, initialValue, onSubmit, submitLabel, extraActions }) {
  const [value, setValue] = useState(() => initialValue || {});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [destinationsLoading, setDestinationsLoading] = useState(config.singular === 'Trip');
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValue?.slug));

  useEffect(() => {
    if (config.singular !== 'Trip') return;
    let active = true;
    adminFetch('destinations?limit=100')
      .then(data => { if (active) setDestinations(data.items || []); })
      .catch(() => { if (active) setError('Could not load destinations. Please refresh and try again.'); })
      .finally(() => { if (active) setDestinationsLoading(false); });
    return () => { active = false; };
  }, [config.singular]);

  function setField(name, val) {
    setValue(prev => {
      const next = { ...prev, [name]: val };
      if (name === 'title' && config.singular === 'Trip' && !slugTouched) {
        next.slug = String(val || '')
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      return next;
    });
    if (name === 'slug') setSlugTouched(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await onSubmit(cleanValue(config.fields, value));
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {config.fields.map(field => {
        const enhancedField = field.type === 'destinationSelect'
          ? {
              ...field,
              type: 'select',
              options: destinations.map(destination => ({ value: destination.slug, label: `${destination.name} (${destination.slug})` })),
              hint: destinationsLoading ? 'Loading destinations...' : field.hint,
            }
          : field;
        return <FieldInput key={field.name} field={enhancedField} value={value[field.name]} onChange={val => setField(field.name, val)} />;
      })}

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3 border-t border-gray-100 pt-5">
        <button type="submit" disabled={busy} className="rounded-lg bg-brand-purple px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-deep disabled:opacity-60">
          {busy ? 'Saving…' : submitLabel || 'Save'}
        </button>
        {extraActions}
      </div>
    </form>
  );
}
