"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OwnerGuard } from "@/components/owner-guard";
import { HorariosForm } from "@/components/horarios-form";
import {
  getMinhasQuadras,
  createQuadra,
  updateQuadra,
  deleteQuadra,
  uploadImage,
  logout,
  type Quadra,
  type User,
  type HorariosSemanais,
  DEFAULT_HORARIOS_SEMANAIS,
} from "@/lib/api";
import { Plus, Trash2, Loader2, Save, Upload, MapPin, LogOut, X } from "lucide-react";

const ESPORTES = [
  { value: "futebol", label: "⚽ Futebol Society" },
  { value: "futsal", label: "🥅 Futsal" },
  { value: "tenis", label: "🎾 Tênis" },
  { value: "padel", label: "🏸 Padel" },
  { value: "beach_tenis", label: "🏖️ Beach Tênis" },
  { value: "volei", label: "🏐 Vôlei" },
  { value: "basquete", label: "🏀 Basquete" },
];

const COBERTURAS = [
  { value: "coberto", label: "Coberto" },
  { value: "descoberto", label: "Descoberto" },
  { value: "misto", label: "Misto" },
];

type FormData = {
  nome: string;
  tipoPiso: string;
  cobertura: string;
  precoPorHora: string;
  descricao: string;
  rua: string;
  cidade: string;
  estado: string;
  cep: string;
  lat: string;
  lng: string;
  imagemCapa: string;
};

const EMPTY_FORM: FormData = {
  nome: "", tipoPiso: "futebol", cobertura: "descoberto",
  precoPorHora: "", descricao: "", rua: "", cidade: "", estado: "", cep: "",
  lat: "", lng: "", imagemCapa: "",
};

function fromQuadra(q: Quadra): FormData {
  return {
    nome: q.nome,
    tipoPiso: q.tipoPiso,
    cobertura: q.cobertura ?? "descoberto",
    precoPorHora: q.precoPorHora?.toString() ?? "",
    descricao: q.descricao,
    rua: q.endereco.rua,
    cidade: q.endereco.cidade,
    estado: q.endereco.estado,
    cep: q.endereco.cep,
    lat: q.coordenadas.lat.toString(),
    lng: q.coordenadas.lng.toString(),
    imagemCapa: q.imagemCapa,
  };
}

function Dashboard({ user }: { user: User }) {
  const [quadras, setQuadras] = useState<Quadra[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [tab, setTab] = useState<"info" | "horarios">("info");
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [horarios, setHorarios] = useState<HorariosSemanais>(DEFAULT_HORARIOS_SEMANAIS);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeMsg, setGeocodeMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    getMinhasQuadras()
      .then(setQuadras)
      .catch(() => setQuadras([]))
      .finally(() => setLoadingList(false));
  }, []);

  const selectedQuadra = quadras.find((q) => q.id === selectedId);

  function selectQuadra(q: Quadra) {
    setSelectedId(q.id);
    setIsNew(false);
    setForm(fromQuadra(q));
    setHorarios(q.horariosSemanais ?? DEFAULT_HORARIOS_SEMANAIS);
    setTab("info");
    setSaveError("");
    setGeocodeMsg(null);
  }

  function startNew() {
    setSelectedId(null);
    setIsNew(true);
    setForm(EMPTY_FORM);
    setHorarios(DEFAULT_HORARIOS_SEMANAIS);
    setTab("info");
    setSaveError("");
    setGeocodeMsg(null);
  }

  const setField =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function handleGeocode() {
    const parts = [form.rua, form.cidade, form.estado, "Brasil"].filter(Boolean);
    if (parts.length < 2) { setGeocodeMsg({ type: "err", text: "Preencha rua e cidade primeiro." }); return; }
    setGeocoding(true);
    setGeocodeMsg(null);
    try {
      const q = encodeURIComponent(parts.join(", "));
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
        headers: { "Accept-Language": "pt-BR" },
      });
      const data = await res.json();
      if (!data.length) { setGeocodeMsg({ type: "err", text: "Endereço não encontrado." }); return; }
      setForm((prev) => ({ ...prev, lat: parseFloat(data[0].lat).toFixed(6), lng: parseFloat(data[0].lon).toFixed(6) }));
      setGeocodeMsg({ type: "ok", text: `✓ ${data[0].display_name.split(",").slice(0, 2).join(",")}` });
    } catch {
      setGeocodeMsg({ type: "err", text: "Erro ao buscar coordenadas." });
    } finally {
      setGeocoding(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, imagemCapa: url }));
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaveError("");
    if (!form.nome.trim()) { setSaveError("Nome é obrigatório."); return; }
    if (!form.cidade.trim() || !form.estado.trim()) { setSaveError("Cidade e estado são obrigatórios."); return; }
    setSaving(true);
    try {
      const payload = {
        nome: form.nome,
        descricao: form.descricao || form.nome,
        tipoPiso: form.tipoPiso,
        cobertura: form.cobertura,
        precoPorHora: form.precoPorHora ? parseFloat(form.precoPorHora) : null,
        avaliacao: selectedQuadra?.avaliacao ?? 0,
        imagemCapa: form.imagemCapa || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&h=600&fit=crop",
        imagens: selectedQuadra?.imagens ?? [],
        telefone: null,
        endereco: { rua: form.rua, cidade: form.cidade, estado: form.estado, cep: form.cep },
        coordenadas: { lat: parseFloat(form.lat) || 0, lng: parseFloat(form.lng) || 0 },
        horariosSemanais: horarios,
      };
      if (isNew) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const created = await createQuadra(payload as any);
        setQuadras((prev) => [...prev, created]);
        setSelectedId(created.id);
        setIsNew(false);
      } else if (selectedId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updated = await updateQuadra(selectedId, payload as any);
        setQuadras((prev) => prev.map((q) => (q.id === selectedId ? updated : q)));
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedId || !selectedQuadra) return;
    if (!confirm(`Excluir "${selectedQuadra.nome}"?`)) return;
    setDeleting(true);
    try {
      await deleteQuadra(selectedId);
      setQuadras((prev) => prev.filter((q) => q.id !== selectedId));
      setSelectedId(null);
      setIsNew(false);
    } finally {
      setDeleting(false);
    }
  }

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Left sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-100">
          <Link href="/" className="text-lg font-black tracking-widest text-green-600">FUTZER</Link>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{user.nome}</p>
        </div>

        <div className="p-3">
          <button
            onClick={startNew}
            className="w-full flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-3 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Quadra
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {loadingList ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
            </div>
          ) : quadras.length === 0 && !isNew ? (
            <p className="text-xs text-gray-400 text-center py-6 px-3">
              Clique em &ldquo;Nova Quadra&rdquo; para começar
            </p>
          ) : (
            <div className="space-y-1">
              {quadras.map((q) => {
                const esporte = ESPORTES.find((e) => e.value === q.tipoPiso);
                const isSelected = selectedId === q.id;
                return (
                  <button
                    key={q.id}
                    onClick={() => selectQuadra(q)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors border ${
                      isSelected
                        ? "bg-green-50 border-green-200"
                        : "hover:bg-gray-50 border-transparent"
                    }`}
                  >
                    <p className={`text-sm font-medium truncate ${isSelected ? "text-green-800" : "text-gray-800"}`}>
                      {q.nome}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {esporte?.label.replace(/^\S+\s/, "") ?? q.tipoPiso}
                      {q.cobertura ? ` · ${q.cobertura}` : ""}
                    </p>
                  </button>
                );
              })}
              {isNew && (
                <div className="px-3 py-2.5 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm font-medium text-green-700 italic">Nova quadra...</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => { logout(); window.location.href = "/owner/login"; }}
            className="w-full flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Right panel */}
      <main className="flex-1 overflow-y-auto">
        {!isNew && !selectedId ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 text-2xl">⚽</div>
            <h2 className="text-lg font-semibold text-gray-700 mb-1">Selecione uma quadra</h2>
            <p className="text-sm text-gray-400 mb-6">Escolha na lista ou crie uma nova</p>
            <button
              onClick={startNew}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova Quadra
            </button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-gray-900">
                {isNew ? "Nova Quadra" : selectedQuadra?.nome}
              </h1>
              <div className="flex items-center gap-2">
                {!isNew && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Excluir
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>

            {saveError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4">{saveError}</p>
            )}

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200 mb-6">
              {(["info", "horarios"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    tab === t
                      ? "border-green-600 text-green-700"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t === "info" ? "Informações" : "Horários"}
                </button>
              ))}
            </div>

            {tab === "info" ? (
              <div className="space-y-5">
                {/* Dados */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800">Dados da Quadra</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                    <input
                      value={form.nome}
                      onChange={setField("nome")}
                      placeholder="Ex: Quadra 1 — Arena Premium"
                      className={inputCls}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Esporte *</label>
                      <select value={form.tipoPiso} onChange={setField("tipoPiso")} className={inputCls}>
                        {ESPORTES.map((e) => (
                          <option key={e.value} value={e.value}>{e.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estrutura</label>
                      <div className="flex gap-1.5">
                        {COBERTURAS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, cobertura: c.value }))}
                            className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                              form.cobertura === c.value
                                ? "bg-green-600 text-white border-green-600"
                                : "bg-white text-gray-600 border-gray-300 hover:border-green-400"
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preço por hora (R$)</label>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={form.precoPorHora}
                        onChange={setField("precoPorHora")}
                        placeholder="Ex: 120.00"
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                      value={form.descricao}
                      onChange={setField("descricao")}
                      rows={2}
                      placeholder="Breve descrição (opcional)"
                      className={inputCls + " resize-none"}
                    />
                  </div>
                </div>

                {/* Endereço */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800">Endereço</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rua / Logradouro</label>
                    <input value={form.rua} onChange={setField("rua")} placeholder="Rua das Acácias, 123" className={inputCls} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                      <input value={form.cidade} onChange={setField("cidade")} placeholder="Campinas" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                      <input value={form.estado} onChange={setField("estado")} placeholder="SP" maxLength={2} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                      <input value={form.cep} onChange={setField("cep")} placeholder="13000-000" className={inputCls} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleGeocode}
                      disabled={geocoding}
                      className="flex items-center gap-1.5 text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-medium px-3 py-2 rounded-lg transition-colors"
                    >
                      {geocoding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                      Buscar coordenadas
                    </button>
                    {geocodeMsg && (
                      <span className={`text-xs ${geocodeMsg.type === "ok" ? "text-green-600" : "text-red-500"}`}>
                        {geocodeMsg.text}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                      <input type="number" step="any" value={form.lat} onChange={setField("lat")} placeholder="-22.9064" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                      <input type="number" step="any" value={form.lng} onChange={setField("lng")} placeholder="-47.0616" className={inputCls} />
                    </div>
                  </div>
                </div>

                {/* Foto */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-800">Foto da Quadra</h3>
                  {form.imagemCapa ? (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.imagemCapa} alt="Capa" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, imagemCapa: "" }))}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all">
                      <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                      {uploading ? (
                        <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-400">Clique para enviar foto</span>
                        </>
                      )}
                    </label>
                  )}
                </div>
              </div>
            ) : (
              /* Horários tab */
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Horários disponíveis</h3>
                <p className="text-xs text-gray-500 mb-5">
                  Selecione as janelas de 1 hora disponíveis para reserva (06h–23h).
                </p>
                <HorariosForm
                  horariosSemanais={horarios}
                  onChange={(h) => setHorarios(h)}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function OwnerDashboardPage() {
  return <OwnerGuard>{(user) => <Dashboard user={user} />}</OwnerGuard>;
}
