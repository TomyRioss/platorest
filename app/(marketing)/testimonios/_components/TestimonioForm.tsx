"use client";

import { useState, type FormEvent } from "react";

type Errors = { name?: string; email?: string; comment?: string };

export default function TestimonioForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = "Ingresá tu nombre.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Ingresá un email válido.";
    if (!comment.trim()) next.comment = "Contanos tu experiencia.";
    return next;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="rounded border border-border bg-surface p-6 text-center">
        <p className="font-medium text-text-primary">¡Gracias por tu testimonio!</p>
        <p className="mt-1 text-sm text-text-secondary">Lo vamos a revisar pronto.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded border border-border p-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text-primary">
          Nombre
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded border border-border px-3 py-2 text-text-primary"
        />
        {errors.name && <p className="mt-1 text-sm text-danger">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text-primary">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded border border-border px-3 py-2 text-text-primary"
        />
        {errors.email && <p className="mt-1 text-sm text-danger">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-text-primary">
          Comentario
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded border border-border px-3 py-2 text-text-primary"
        />
        {errors.comment && <p className="mt-1 text-sm text-danger">{errors.comment}</p>}
      </div>

      <button
        type="submit"
        className="rounded bg-primary px-6 py-3 font-medium text-white hover:bg-primary-hover"
      >
        Enviar testimonio
      </button>
    </form>
  );
}
