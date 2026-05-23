
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createProjectSchema } from "@/lib/validations/schemas";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function NewProjectPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", description: "", start_date: "", end_date: "" });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = createProjectSchema.safeParse(form);
    if (!result.success) {
      const fe: Record<string, string> = {};
      result.error.issues.forEach((i) => { fe[i.path[0] as string] = i.message; });
      setErrors(fe);
      return;
    }
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data, error } = await supabase
      .from("projects")
      .insert({ ...result.data, owner_id: user.id })
      .select("id")
      .single();

    if (error) { setErrors({ name: error.message }); setIsSaving(false); return; }

    await supabase.from("project_members").insert({ project_id: data.id, user_id: user.id });
    router.push(`/projects/${data.id}/board`);
  };

  return (
   <div
  style={{
    maxWidth: "1200px",
    padding: "40px 32px 56px",
  }}
>
  {/* Header */}
  <div
    style={{
      marginBottom: "34px",
    }}
  >
    <h1
      style={{
        margin: 0,
        fontSize: "30px",
        fontWeight: 700,
        lineHeight: 1.15,
        letterSpacing: "-0.02em",
        color: "var(--c-text)",
        marginBottom: "10px",
      }}
    >
      Buat Proyek Baru
    </h1>

    <p
      style={{
        margin: 0,
        fontSize: "14px",
        lineHeight: 1.7,
        color: "var(--c-muted)",
        maxWidth: "1200px",
      }}
    >
      Isi detail proyek. AI akan membantu membuat roadmap, sprint planning,
      dan task breakdown secara otomatis.
    </p>
  </div>


  {/* Form */}
  <form
    onSubmit={handleSubmit}
    style={{
      background: "var(--c-surface)",
      border: "1px solid var(--c-border)",
      borderRadius: "24px",
      padding: "30px 30px 30px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      boxShadow: "0 4px 20px rgba(0,0,0,.03)",
    }}
  >
    {/* Nama Proyek */}
<div style={{ marginBottom: "26px" }}>
  <label
    style={{
      display: "block",
      marginBottom: "10px",
      fontSize: "12px",
      fontWeight: 600,
      color: "var(--c-muted)",
    }}
  >
    Nama Proyek
  </label>

  <Input
    placeholder="Contoh: E-Commerce MVP"
    value={form.name}
    onChange={set("name")}
    error={errors.name}
    required
  />
</div>



    {/* Description */}
    <div>
      <label
        style={{
          display: "block",
          marginBottom: "10px",
          fontSize: "12px",
          fontWeight: 600,
          color: "var(--c-muted)",
        }}
      >
        Deskripsi
      </label>

      <textarea
        placeholder="Deskripsi singkat tujuan dan scope proyek ini..."
        value={form.description}
        onChange={set("description")}
        rows={4}
        className="input-field"
        style={{
          width: "100%",
          resize: "none",
          padding: "14px 12px",
          borderRadius: "14px",
          background: "var(--c-raised)",
          border: "1px solid var(--c-border)",
          color: "var(--c-text)",
          fontSize: "14px",
          lineHeight: 1.6,
        }}
      />
    </div>

{/* Tanggal */}
<div
  className="grid grid-cols-2"
  style={{
    gap: "24px",
    marginBottom: "26px",
  }}
>
  <div>
    <label
      style={{
        display: "block",
        marginBottom: "10px",
        fontSize: "12px",
        fontWeight: 600,
        color: "var(--c-muted)",
      }}
    >
      Tanggal Mulai
    </label>

    <Input
      type="date"
      value={form.start_date}
      onChange={set("start_date")}
      error={errors.start_date}
      required
    />
  </div>

  <div>
    <label
      style={{
        display: "block",
        marginBottom: "10px",
        fontSize: "12px",
        fontWeight: 600,
        color: "var(--c-muted)",
      }}
    >
      Tanggal Selesai
    </label>

    <Input
      type="date"
      value={form.end_date}
      onChange={set("end_date")}
      error={errors.end_date}
      required
    />
  </div>
</div>

    {/* Actions */}
<div
  className="flex"
  style={{
    gap: "12px",
    paddingTop: "8px",
    marginTop: "4px",
  }}
>
  <Button
    type="button"
    variant="secondary"
    onClick={() => router.back()}
    className="flex-1 px-6 rounded-xl"
    style={{ height: "48px", fontSize: "14px" }}
  >
    Batal
  </Button>

  <Button
    type="submit"
    loading={isSaving}
    className="flex-1 px-6 rounded-xl"
    style={{ height: "48px", fontSize: "14px" }}
  >
    Buat Proyek
  </Button>
</div>
  </form>
</div>
  );
}
