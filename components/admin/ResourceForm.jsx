'use client';

import { useState } from 'react';
import ImageUploader from './ImageUploader';
import { IconPlus, IconTrash, IconX } from './Icons';

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
          {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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

  function setField(name, val) {
    setValue(prev => ({ ...prev, [name]: val }));
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
      {config.fields.map(field => (
        <FieldInput key={field.name} field={field} value={value[field.name]} onChange={val => setField(field.name, val)} />
      ))}

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
