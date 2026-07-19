"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { saveModifierGroup, deleteModifierGroup, type ModifierGroupInput } from "./actions";

export type ModifierGroupData = {
  id: string;
  name: string;
  required: boolean;
  multiple: boolean;
  modifiers: { id: string; name: string; price: number }[];
};

type GroupForm = {
  key: string;
  id?: string;
  name: string;
  required: boolean;
  multiple: boolean;
  modifiers: { key: string; id?: string; name: string; price: string }[];
  collapsed: boolean;
};

function groupToForm(g?: ModifierGroupData): GroupForm {
  return {
    key: g?.id ?? crypto.randomUUID(),
    id: g?.id,
    name: g?.name ?? "",
    required: g?.required ?? false,
    multiple: g?.multiple ?? false,
    modifiers: g?.modifiers.map((m) => ({ key: m.id, id: m.id, name: m.name, price: String(m.price) })) ?? [
      { key: crypto.randomUUID(), name: "", price: "0" },
    ],
    collapsed: false,
  };
}

export function ModifierGroupsEditor({
  productId,
  groups,
  onSaved,
}: {
  productId: string;
  groups: ModifierGroupData[];
  onSaved: () => void;
}) {
  const [forms, setForms] = useState<GroupForm[]>(() => groups.map((g) => groupToForm(g)));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setForms(groups.map((g) => groupToForm(g))), [groups]);

  function addGroup() {
    setForms((prev) => [...prev, groupToForm()]);
  }

  function updateGroup(key: string, patch: Partial<GroupForm>) {
    setForms((prev) => prev.map((g) => (g.key === key ? { ...g, ...patch } : g)));
  }

  function addModifier(groupKey: string) {
    setForms((prev) =>
      prev.map((g) =>
        g.key === groupKey
          ? { ...g, modifiers: [...g.modifiers, { key: crypto.randomUUID(), name: "", price: "0" }] }
          : g,
      ),
    );
  }

  function updateModifier(groupKey: string, modKey: string, patch: Partial<GroupForm["modifiers"][number]>) {
    setForms((prev) =>
      prev.map((g) =>
        g.key === groupKey
          ? { ...g, modifiers: g.modifiers.map((m) => (m.key === modKey ? { ...m, ...patch } : m)) }
          : g,
      ),
    );
  }

  function removeModifier(groupKey: string, modKey: string) {
    setForms((prev) =>
      prev.map((g) =>
        g.key === groupKey && g.modifiers.length > 1
          ? { ...g, modifiers: g.modifiers.filter((m) => m.key !== modKey) }
          : g,
      ),
    );
  }

  function removeUnsavedGroup(key: string) {
    setForms((prev) => prev.filter((g) => g.key !== key));
  }

  function saveGroup(form: GroupForm) {
    if (!form.name.trim()) {
      setError("Nombre del grupo requerido.");
      return;
    }
    setError(null);
    const input: ModifierGroupInput = {
      id: form.id,
      name: form.name,
      required: form.required,
      multiple: form.multiple,
      modifiers: form.modifiers.map((m) => ({ id: m.id, name: m.name, price: Number(m.price) || 0 })),
    };
    startTransition(async () => {
      const result = await saveModifierGroup(productId, input);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSaved();
    });
  }

  function removeGroup(groupId: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteModifierGroup(groupId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSaved();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-primary">
          Modificadores{forms.length > 0 ? ` (${forms.length})` : ""}
        </p>
        <button
          type="button"
          onClick={addGroup}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <Plus className="h-4 w-4" /> Agregar grupo
        </button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {forms.map((form) => (
        <div key={form.key} className="rounded-lg border border-border p-3">
          <div className="flex items-center gap-2">
            <input
              value={form.name}
              onChange={(e) => updateGroup(form.key, { name: e.target.value })}
              placeholder="Ej: Elegí tu salsa"
              className="flex-1 border-b border-border bg-transparent px-1 py-0.5 text-sm font-medium outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => updateGroup(form.key, { collapsed: !form.collapsed })}
              className="rounded-full p-1 text-text-secondary hover:bg-surface"
            >
              {form.collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => (form.id ? removeGroup(form.id) : removeUnsavedGroup(form.key))}
              className="rounded-full p-1 text-text-secondary hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {!form.collapsed && (
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap gap-4 text-sm text-text-primary">
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={form.required}
                    onChange={(e) => updateGroup(form.key, { required: e.target.checked })}
                  />
                  Obligatorio
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={form.multiple}
                    onChange={(e) => updateGroup(form.key, { multiple: e.target.checked })}
                  />
                  Selección múltiple
                </label>
              </div>

              <div className="space-y-2">
                {form.modifiers.map((m) => (
                  <div key={m.key} className="flex items-center gap-2">
                    <input
                      value={m.name}
                      onChange={(e) => updateModifier(form.key, m.key, { name: e.target.value })}
                      placeholder="Opción"
                      className="flex-1 rounded border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={m.price}
                      onChange={(e) => updateModifier(form.key, m.key, { price: e.target.value.replace(/\D/g, "") })}
                      placeholder="0"
                      className="w-24 rounded border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => removeModifier(form.key, m.key)}
                      className="shrink-0 text-text-secondary hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addModifier(form.key)}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" /> Agregar opción
                </button>
              </div>

              <button
                type="button"
                onClick={() => saveGroup(form)}
                disabled={isPending}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                Guardar grupo
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
