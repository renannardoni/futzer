"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OwnerGuard } from "@/components/owner-guard";
import { HorariosForm } from "@/components/horarios-form";
import {
  getMinhasQuadras, createQuadra, updateQuadra, deleteQuadra,
  uploadImage, logout,
  addCourt, updateCourt, deleteCourt,
  addBooking, updateBooking, deleteBooking, addRecurrentBooking, deleteBookingGroup,
  generateAllSlots, slotsOcupados, DURACAO_OPTIONS, DISCRETIZACAO_OPTIONS,

  type Quadra, type SubQuadra, type Reserva, type User, type HorariosSemanais,
  DEFAULT_HORARIOS_SEMANAIS,
} from "@/lib/api";
import {
  Plus, Trash2, Loader2, Save, Upload, MapPin, LogOut, X, Menu,
  Settings, Edit2, ChevronRight, ChevronLeft, Phone, User as UserIcon, Check, Clock,
  Calendar, Repeat,
} from "lucide-react";
import { TimeInput } from "@/components/time-input";

// ── helpers ──────────────────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const DAY_KEYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"] as const;
const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_SHORT = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];

function getDayKey(iso: string) {
  return DAY_KEYS[new Date(iso + "T12:00:00").getDay()];
}

function formatDateLabel(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return { dia: DAY_LABELS[d.getDay()], num: d.getDate(), mes: MONTH_SHORT[d.getMonth()] };
}

const ESPORTES = [
  { value: "futebol", label: "⚽ Futebol Society" },
  { value: "futsal",  label: "🥅 Futsal" },
  { value: "tenis",   label: "🎾 Tênis" },
  { value: "padel",   label: "🏸 Padel" },
  { value: "beach_tenis", label: "🏖️ Beach Tênis" },
  { value: "volei",   label: "🏐 Vôlei" },
  { value: "basquete",label: "🏀 Basquete" },
];

const COBERTURAS = [
  { value: "coberto",    label: "Coberto" },
  { value: "descoberto", label: "Descoberto" },
  { value: "misto",      label: "Misto" },
];

// ── Arena settings panel ─────────────────────────────────────────────────────

type ArenaForm = {
  nome: string; descricao: string; telefone: string; precoPorHora: string;
  rua: string; cidade: string; estado: string; cep: string;
  lat: string; lng: string; imagemCapa: string; imagens: string[];
  mostrarDisponibilidade: boolean;
  duracaoMinima: string;
  discretizacaoMinima: string;
};

function fromArena(a: Quadra): ArenaForm {
  return {
    nome: a.nome, descricao: a.descricao,
    telefone: a.telefone ?? "", precoPorHora: a.precoPorHora?.toString() ?? "",
    mostrarDisponibilidade: a.mostrarDisponibilidade ?? false,
    duracaoMinima: a.duracaoMinima?.toString() ?? "",
    discretizacaoMinima: a.discretizacaoMinima?.toString() ?? "15",
    rua: a.endereco.rua, cidade: a.endereco.cidade,
    estado: a.endereco.estado, cep: a.endereco.cep,
    lat: a.coordenadas.lat.toString(), lng: a.coordenadas.lng.toString(),
    imagemCapa: a.imagemCapa, imagens: a.imagens ?? [],
  };
}

function ArenaSettingsPanel({
  arena, onSave, onDelete, onClose,
}: { arena: Quadra; onSave: (updated: Quadra) => void; onDelete: () => void; onClose: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState<ArenaForm>(fromArena(arena));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeMsg, setGeocodeMsg] = useState<string>("");
  const [uploadingCapa, setUploadingCapa] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const set = (f: keyof ArenaForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [f]: e.target.value }));

  async function handleGeocode() {
    setGeocoding(true); setGeocodeMsg("");
    try {
      const q = encodeURIComponent([form.rua, form.cidade, form.estado, "Brasil"].join(", "));
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
        headers: { "Accept-Language": "pt-BR" },
      });
      const data = await res.json();
      if (!data.length) { setGeocodeMsg("Não encontrado"); return; }
      setForm(prev => ({ ...prev, lat: parseFloat(data[0].lat).toFixed(6), lng: parseFloat(data[0].lon).toFixed(6) }));
      setGeocodeMsg("✓ Encontrado");
    } catch { setGeocodeMsg("Erro"); }
    finally { setGeocoding(false); }
  }

  async function handleCapaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingCapa(true);
    try { const url = await uploadImage(file); setForm(prev => ({ ...prev, imagemCapa: url })); }
    finally { setUploadingCapa(false); }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []); if (!files.length) return;
    setUploadingGallery(true);
    try {
      const urls = await Promise.all(files.map(f => uploadImage(f)));
      setForm(prev => ({ ...prev, imagens: [...prev.imagens, ...urls] }));
    } finally { setUploadingGallery(false); }
  }

  async function handleSave() {
    setSaving(true); setSaveError("");
    try {
      const payload = {
        nome: form.nome, descricao: form.descricao || form.nome,
        telefone: form.telefone.trim() || null,
        precoPorHora: form.precoPorHora ? parseFloat(form.precoPorHora) : null,
        imagemCapa: form.imagemCapa || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&h=600&fit=crop",
        imagens: form.imagens,
        endereco: { rua: form.rua, cidade: form.cidade, estado: form.estado, cep: form.cep },
        coordenadas: { lat: parseFloat(form.lat) || 0, lng: parseFloat(form.lng) || 0 },
        mostrarDisponibilidade: form.mostrarDisponibilidade,
        duracaoMinima: form.duracaoMinima ? parseInt(form.duracaoMinima) : null,
        discretizacaoMinima: form.discretizacaoMinima ? parseInt(form.discretizacaoMinima) : 15,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = await updateQuadra(arena.id, payload as any);
      onSave(updated);
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally { setSaving(false); }
  }

  const inp = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full md:w-[440px] bg-white h-full overflow-y-auto shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <h2 className="font-bold text-gray-900">Configurações da Arena</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="flex-1 p-5 space-y-5 overflow-y-auto">
          {saveError && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{saveError}</p>}

          {/* Informações básicas */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Informações</h3>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nome da Arena *</label>
              <input value={form.nome} onChange={set("nome")} placeholder="Arena Premium Sports" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Descrição</label>
              <textarea value={form.descricao} onChange={set("descricao")} rows={3} className={inp + " resize-none"} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Telefone</label>
                <input value={form.telefone} onChange={set("telefone")} placeholder="(11) 99999-9999" className={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Preço/hora (R$)</label>
                <input type="number" min="0" step="0.01" value={form.precoPorHora} onChange={set("precoPorHora")} placeholder="Ex: 120.00" className={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Duração mínima</label>
                <select value={form.duracaoMinima} onChange={e => setForm(prev => ({ ...prev, duracaoMinima: e.target.value }))} className={inp}>
                  <option value="">Sem mínimo</option>
                  {DURACAO_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Discretização mínima</label>
                <select value={form.discretizacaoMinima} onChange={e => setForm(prev => ({ ...prev, discretizacaoMinima: e.target.value }))} className={inp}>
                  {DISCRETIZACAO_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Disponibilidade pública */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Site Público</h3>
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-700">Mostrar disponibilidade no site</p>
                <p className="text-xs text-gray-400 mt-0.5">Visitantes verão os horários disponíveis e poderão contatar via WhatsApp</p>
              </div>
              <div className="relative shrink-0 ml-3">
                <input type="checkbox" checked={form.mostrarDisponibilidade}
                  onChange={e => setForm(prev => ({ ...prev, mostrarDisponibilidade: e.target.checked }))}
                  className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
              </div>
            </label>
          </section>

          {/* Endereço */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Endereço</h3>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Rua / Logradouro</label>
              <input value={form.rua} onChange={set("rua")} placeholder="Rua das Acácias, 123" className={inp} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Cidade</label>
                <input value={form.cidade} onChange={set("cidade")} placeholder="Campinas" className={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
                <input value={form.estado} onChange={set("estado")} placeholder="SP" maxLength={2} className={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">CEP</label>
                <input value={form.cep} onChange={set("cep")} placeholder="13000-000" className={inp} />
              </div>
            </div>
            <button onClick={handleGeocode} disabled={geocoding}
              className="flex items-center gap-1.5 text-xs bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg font-medium text-gray-700 disabled:opacity-50">
              {geocoding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
              Buscar coordenadas
              {geocodeMsg && <span className="ml-1 text-green-600">{geocodeMsg}</span>}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Latitude</label>
                <input type="number" step="any" value={form.lat} onChange={set("lat")} placeholder="-22.9064" className={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Longitude</label>
                <input type="number" step="any" value={form.lng} onChange={set("lng")} placeholder="-47.0616" className={inp} />
              </div>
            </div>
          </section>

          {/* Foto de capa */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Foto de Capa</h3>
            {form.imagemCapa ? (
              <div className="relative h-36 rounded-xl overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.imagemCapa} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setForm(p => ({ ...p, imagemCapa: "" }))}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all">
                <input type="file" accept="image/*" onChange={handleCapaUpload} className="hidden" />
                {uploadingCapa
                  ? <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                  : <><Upload className="w-6 h-6 text-gray-400 mb-1" /><span className="text-xs text-gray-400">Clique para enviar</span></>}
              </label>
            )}
          </section>

          {/* Galeria */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Galeria de Fotos</h3>
              <label className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 font-medium cursor-pointer">
                <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
                {uploadingGallery ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Adicionar fotos
              </label>
            </div>
            {form.imagens.length === 0 ? (
              <div className="h-16 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center">
                <p className="text-xs text-gray-400">Nenhuma foto na galeria</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {form.imagens.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setForm(p => ({ ...p, imagens: p.imagens.filter((_, j) => j !== i) }))}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="border border-red-200 rounded-lg p-4 space-y-3">
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-2 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" /> Excluir arena
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-red-600 font-medium">Tem certeza? Esta ação é irreversível e apagará todas as quadras, reservas e dados desta arena.</p>
                <div className="flex gap-2">
                  <button onClick={() => { onDelete(); onClose(); }}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" /> Sim, excluir
                  </button>
                  <button onClick={() => setConfirmDelete(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-4 py-2 rounded-lg transition-colors">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="p-5 border-t shrink-0">
          <button onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Salvando..." : "Salvar configurações"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Court edit panel (inline, below tabs) ────────────────────────────────────

function CourtEditPanel({
  court, arenaId, step = 15,
  onSave, onDelete, onClose,
}: {
  court: SubQuadra; arenaId: string; step?: number;
  onSave: (c: SubQuadra) => void; onDelete: () => void; onClose: () => void;
}) {
  const [nome, setNome] = useState(court.nome);
  const [tipoPiso, setTipoPiso] = useState(court.tipoPiso);
  const [cobertura, setCobertura] = useState(court.cobertura);
  const [horarios, setHorarios] = useState<HorariosSemanais>(court.horariosSemanais ?? DEFAULT_HORARIOS_SEMANAIS);
  const [uploading, setUploading] = useState(false);
  const [imagemCapa, setImagemCapa] = useState(court.imagemCapa ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const url = await uploadImage(file); setImagemCapa(url); }
    finally { setUploading(false); }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateCourt(arenaId, court.id, { nome, tipoPiso, cobertura, imagemCapa: imagemCapa || undefined, horariosSemanais: horarios });
      onSave({ ...court, nome, tipoPiso, cobertura, imagemCapa: imagemCapa || undefined, horariosSemanais: horarios });
      onClose();
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm(`Excluir "${court.nome}"?`)) return;
    setDeleting(true);
    try { await deleteCourt(arenaId, court.id); onDelete(); onClose(); }
    finally { setDeleting(false); }
  }

  const inp = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

  return (
    <div className="border border-green-200 bg-green-50 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Editar Quadra</h3>
        <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nome</label>
          <input value={nome} onChange={e => setNome(e.target.value)} className={inp} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Esporte</label>
          <select value={tipoPiso} onChange={e => setTipoPiso(e.target.value)} className={inp}>
            {ESPORTES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Estrutura</label>
        <div className="flex gap-2">
          {COBERTURAS.map(c => (
            <button key={c.value} type="button" onClick={() => setCobertura(c.value)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${cobertura === c.value ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-300"}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Foto da Quadra</label>
        {imagemCapa ? (
          <div className="relative h-24 rounded-lg overflow-hidden border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagemCapa} alt="" className="w-full h-full object-cover" />
            <button onClick={() => setImagemCapa("")} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
          </div>
        ) : (
          <label className="flex items-center justify-center h-16 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-400 transition-colors">
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            {uploading ? <Loader2 className="w-4 h-4 animate-spin text-green-600" /> : <Upload className="w-4 h-4 text-gray-400" />}
          </label>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Horários disponíveis</label>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <HorariosForm horariosSemanais={horarios} step={step} onChange={setHorarios} />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar
        </button>
        <button onClick={handleDelete} disabled={deleting}
          className="flex items-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Excluir
        </button>
      </div>
    </div>
  );
}

// ── New arena form ────────────────────────────────────────────────────────────

const EMPTY_ARENA: ArenaForm = {
  nome: "", descricao: "", telefone: "", precoPorHora: "", mostrarDisponibilidade: false,
  duracaoMinima: "", discretizacaoMinima: "15",
  rua: "", cidade: "", estado: "", cep: "", lat: "", lng: "", imagemCapa: "", imagens: [],
};

function NewArenaPanel({ onCreated, onCancel }: { onCreated: (a: Quadra) => void; onCancel: () => void }) {
  const [form, setForm] = useState<ArenaForm>(EMPTY_ARENA);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (f: keyof ArenaForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [f]: e.target.value }));

  const inp = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

  async function handleSave() {
    if (!form.nome.trim()) { setError("Nome obrigatório"); return; }
    if (!form.cidade.trim() || !form.estado.trim()) { setError("Cidade e estado obrigatórios"); return; }
    setSaving(true); setError("");
    try {
      const payload = {
        nome: form.nome, descricao: form.descricao || form.nome,
        tipoPiso: "futebol", avaliacao: 0,
        imagemCapa: form.imagemCapa || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&h=600&fit=crop",
        imagens: [],
        endereco: { rua: form.rua, cidade: form.cidade, estado: form.estado, cep: form.cep },
        coordenadas: { lat: parseFloat(form.lat) || 0, lng: parseFloat(form.lng) || 0 },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const created = await createQuadra(payload as any);
      onCreated(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar arena");
    } finally { setSaving(false); }
  }

  return (
    <div className="max-w-3xl mx-auto p-3 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6 gap-2">
        <h1 className="text-lg md:text-xl font-bold text-gray-900">Nova Arena</h1>
        <div className="flex gap-2 shrink-0">
          <button onClick={onCancel} className="text-sm text-gray-500 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Criar Arena
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4">{error}</p>}
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nome da Arena *</label>
          <input value={form.nome} onChange={set("nome")} placeholder="Ex: Arena Premium Sports" className={inp} />
        </div>
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <div className="col-span-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Cidade *</label>
            <input value={form.cidade} onChange={set("cidade")} placeholder="Campinas" className={inp} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Estado *</label>
            <input value={form.estado} onChange={set("estado")} placeholder="SP" maxLength={2} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">CEP</label>
            <input value={form.cep} onChange={set("cep")} placeholder="13000-000" className={inp} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Rua / Logradouro</label>
          <input value={form.rua} onChange={set("rua")} placeholder="Rua das Acácias, 123" className={inp} />
        </div>
      </div>
    </div>
  );
}

// ── Agenda Tabs Component ─────────────────────────────────────────────────────

type AgendaTab = "horario" | "quadra" | "recorrente";
type OutlookView = "semanal" | "mensal";

function getWeekDates(baseDate: string): string[] {
  const d = new Date(baseDate + "T12:00:00");
  const day = d.getDay(); // 0=dom
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7)); // go to monday
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    return dd.toISOString().slice(0, 10);
  });
}

function getMonthDates(year: number, month: number): string[][] {
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7; // 0=seg
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: string[][] = [];
  let week: string[] = Array(startDay).fill("");
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push("");
    weeks.push(week);
  }
  return weeks;
}

const MONTH_FULL = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function AgendaTabs({
  arena, courts, selectedDate, onDateChange, onBookingChange,
}: {
  arena: Quadra;
  courts: SubQuadra[];
  selectedDate: string;
  onDateChange: (d: string) => void;
  onBookingChange: () => Promise<unknown>;
}) {
  const step = arena.discretizacaoMinima ?? 15;
  const [tab, setTab] = useState<AgendaTab>("horario");
  const [bookingCell, setBookingCell] = useState<{ courtId: string; hora: string } | null>(null);
  const [bookingForm, setBookingForm] = useState({ nome: "", tel: "", valor: "" });
  const [bookingDuracao, setBookingDuracao] = useState(Math.max(60, arena.duracaoMinima ?? 0));
  const [bookingLoading, setBookingLoading] = useState(false);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
  const [deleteRecConfirm, setDeleteRecConfirm] = useState<{ bookingId: string; grupoId: string } | null>(null);
  const [deleteSerieConfirm, setDeleteSerieConfirm] = useState<string | null>(null); // grupoId aguardando confirmação final
  const [editingBooking, setEditingBooking] = useState<Reserva | null>(null);
  const [editForm, setEditForm] = useState({ nome: "", tel: "", valor: "" });
  const [bookingModal, setBookingModal] = useState<{
    courtId: string; courtName: string; date: string; hora: string;
    mode: "create" | "edit"; booking?: Reserva;
  } | null>(null);
  const [modalHora, setModalHora] = useState<string>("");
  const [draggingBooking, setDraggingBooking] = useState<Reserva | null>(null);
  const [dragOverCell, setDragOverCell] = useState<string | null>(null); // "date_slot"
  const [selectedHora, setSelectedHora] = useState<string | null>(null);

  // Outlook state
  const [outlookView, setOutlookView] = useState<OutlookView>("semanal");
  const [outlookWeekBase, setOutlookWeekBase] = useState<string>(selectedDate);
  const [outlookCourtId, setOutlookCourtId] = useState<string>(courts[0]?.id ?? "");
  const [outlookMonth, setOutlookMonth] = useState(() => {
    const d = new Date(selectedDate + "T12:00:00");
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // Mensalista state
  const [recForm, setRecForm] = useState<{
    quadra_id: string; hora_inicio: string; duracao: number; dias_semana: number[];
    data_inicio: string; nome: string; tel: string; valor: string;
  }>({
    quadra_id: courts[0]?.id ?? "",
    hora_inicio: "",
    duracao: Math.max(60, arena.duracaoMinima ?? 0),
    dias_semana: [],
    data_inicio: todayISO(),
    nome: "",
    tel: "",
    valor: "",
  });
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState("");
  const [recSuccess, setRecSuccess] = useState("");
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

  const dayKey = getDayKey(selectedDate);
  const allBookings = arena.reservas ?? [];
  const minDuracao = arena.duracaoMinima ?? 0;
  const duracaoOptions = DURACAO_OPTIONS.filter(o => o.value >= minDuracao);

  // ── Booking handlers ──
  async function handleAddBooking(courtId: string, horaInicio: string, duracao: number = bookingDuracao) {
    if (!bookingForm.nome.trim()) return;
    setBookingLoading(true);
    setBookingError("");
    setBookingSuccess("");
    try {
      await addBooking(arena.id, {
        quadra_id: courtId,
        data: selectedDate,
        hora_inicio: horaInicio,
        duracao,
        nome_cliente: bookingForm.nome.trim(),
        telefone: bookingForm.tel.trim() || undefined,
        valor: bookingForm.valor ? parseFloat(bookingForm.valor) : undefined,
      });
      await onBookingChange();
      setBookingSuccess(`✓ ${bookingForm.nome.trim()} reservado às ${horaInicio} (${duracao}min)`);
      setBookingCell(null);
      setBookingForm({ nome: "", tel: "", valor: "" });
      setTimeout(() => setBookingSuccess(""), 4000);
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Erro ao reservar");
      setTimeout(() => setBookingError(""), 5000);
    } finally { setBookingLoading(false); }
  }

  async function handleDeleteBooking(bookingId: string) {
    setDeletingBookingId(bookingId);
    try {
      await deleteBooking(arena.id, bookingId);
      await onBookingChange();
    } finally { setDeletingBookingId(null); }
  }

  async function handleAddRecurrent() {
    if (!recForm.nome.trim() || !recForm.hora_inicio || !recForm.quadra_id) {
      setRecError("Preencha todos os campos obrigatórios");
      return;
    }
    if (recForm.dias_semana.length === 0) {
      setRecError("Selecione pelo menos um dia da semana");
      return;
    }
    setRecLoading(true);
    setRecError("");
    setRecSuccess("");
    try {
      // data_fim = 1 ano a partir do início
      const startDate = new Date(recForm.data_inicio + "T12:00:00");
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
      const dataFim = endDate.toISOString().slice(0, 10);

      const result = await addRecurrentBooking(arena.id, {
        quadra_id: recForm.quadra_id,
        hora_inicio: recForm.hora_inicio,
        duracao: recForm.duracao,
        nome_cliente: recForm.nome.trim(),
        telefone: recForm.tel.trim() || undefined,
        valor: recForm.valor ? parseFloat(recForm.valor) : undefined,
        dias_semana: recForm.dias_semana,
        data_inicio: recForm.data_inicio,
        data_fim: dataFim,
      });
      await onBookingChange();

      if (result.conflitos > 0) {
        // Parcial: salvou alguns mas teve conflitos — aviso laranja
        const datas = result.conflitos_datas.map((d: string) => {
          const dt = new Date(d + "T12:00:00");
          return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}`;
        }).join(", ");
        const extra = result.conflitos > 10 ? ` e mais ${result.conflitos - 10}` : "";
        setRecError(`⚠️ ${result.count} horários agendados, mas ${result.conflitos} NÃO foram cadastrados (já ocupados): ${datas}${extra}`);
      } else {
        setRecSuccess(`✓ ${result.count} horários agendados para ${recForm.nome.trim()}`);
        setTimeout(() => setRecSuccess(""), 6000);
      }
      setRecForm(p => ({ ...p, nome: "", tel: "", hora_inicio: "" }));
    } catch (err: unknown) {
      // Erro total (todos conflitaram ou erro de rede)
      const e = err as Error & { conflitos_datas?: string[]; conflitos?: number };
      if (e.conflitos_datas && e.conflitos_datas.length > 0) {
        const datas = e.conflitos_datas.slice(0, 10).map((d: string) => {
          const dt = new Date(d + "T12:00:00");
          return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}`;
        }).join(", ");
        const extra = (e.conflitos ?? 0) > 10 ? ` e mais ${(e.conflitos ?? 0) - 10}` : "";
        setRecError(`❌ Nenhum horário cadastrado — todos já estão ocupados: ${datas}${extra}`);
      } else {
        setRecError(`❌ ${e.message || "Erro ao criar recorrência"}`);
      }
    } finally { setRecLoading(false); }
  }

  async function handleDeleteGroup(grupoId: string) {
    setDeletingGroupId(grupoId);
    try {
      await deleteBookingGroup(arena.id, grupoId);
      await onBookingChange();
    } finally { setDeletingGroupId(null); }
  }

  async function handleDropBooking(targetDate: string, targetSlot: string) {
    if (!draggingBooking) return;
    if (draggingBooking.data === targetDate && draggingBooking.hora_inicio === targetSlot) {
      setDraggingBooking(null);
      setDragOverCell(null);
      return;
    }
    // Optimistic update: mover visualmente antes da API responder
    const oldData = draggingBooking.data;
    const oldHora = draggingBooking.hora_inicio;
    const bookingId = draggingBooking.id;
    // Atualizar reservas localmente
    const updatedReservas = (arena.reservas ?? []).map(r =>
      r.id === bookingId ? { ...r, data: targetDate, hora_inicio: targetSlot } : r
    );
    // Forçar re-render imediato via onBookingChange pattern
    arena.reservas = updatedReservas;
    setDraggingBooking(null);
    setDragOverCell(null);
    // Chamar API em background
    try {
      await updateBooking(arena.id, bookingId, {
        data: targetDate,
        hora_inicio: targetSlot,
      });
      await onBookingChange(); // sync com servidor
    } catch (err) {
      // Reverter optimistic update
      arena.reservas = (arena.reservas ?? []).map(r =>
        r.id === bookingId ? { ...r, data: oldData, hora_inicio: oldHora } : r
      );
      setBookingError(err instanceof Error ? err.message : "Erro ao mover reserva");
      setTimeout(() => setBookingError(""), 5000);
      await onBookingChange(); // re-sync
    }
  }

  async function handleSaveEdit() {
    if (!editingBooking) return;
    setBookingLoading(true);
    try {
      await updateBooking(arena.id, editingBooking.id, {
        nome_cliente: editForm.nome.trim(),
        telefone: editForm.tel.trim() || undefined,
        valor: editForm.valor ? parseFloat(editForm.valor) : undefined,
        duracao: bookingDuracao,
      });
      await onBookingChange();
      setEditingBooking(null);
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Erro ao salvar");
      setTimeout(() => setBookingError(""), 5000);
    } finally { setBookingLoading(false); }
  }

  // ── Outlook booking (from calendar click) ──
  async function handleOutlookBooking(courtId: string, date: string, horaInicio: string) {
    if (!bookingForm.nome.trim()) return;
    setBookingLoading(true);
    setBookingError("");
    try {
      await addBooking(arena.id, {
        quadra_id: courtId,
        data: date,
        hora_inicio: horaInicio,
        duracao: bookingDuracao,
        nome_cliente: bookingForm.nome.trim(),
        telefone: bookingForm.tel.trim() || undefined,
        valor: bookingForm.valor ? parseFloat(bookingForm.valor) : undefined,
      });
      await onBookingChange();
      setBookingSuccess(`✓ ${bookingForm.nome.trim()} reservado`);
      setBookingCell(null);
      setBookingForm({ nome: "", tel: "", valor: "" });
      setTimeout(() => setBookingSuccess(""), 4000);
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Erro ao reservar");
      setTimeout(() => setBookingError(""), 5000);
    } finally { setBookingLoading(false); }
  }

  const inp = "px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

  const tabs: { key: AgendaTab; label: string; icon: React.ReactNode }[] = [
    { key: "horario", label: "Avulso", icon: <Clock className="w-4 h-4" /> },
    { key: "quadra", label: "Calendário", icon: <Calendar className="w-4 h-4" /> },
    { key: "recorrente", label: "Mensalista", icon: <Repeat className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setBookingCell(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? "bg-white text-green-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Feedback messages */}
      {bookingSuccess && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-lg animate-in">
          {bookingSuccess}
        </div>
      )}
      {bookingError && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-lg">
          {bookingError}
        </div>
      )}

      {/* ════════════ TAB: POR HORÁRIO ════════════ */}
      {tab === "horario" && (() => {
        // Collect all available slots for the selected day across all courts
        const allSlotsSet = new Set<string>();
        courts.forEach(c => {
          const slots = c.horariosSemanais?.[dayKey]?.slots ?? [];
          slots.forEach(s => allSlotsSet.add(s));
        });
        const allSlots = Array.from(allSlotsSet).sort();
        const dayBookings = allBookings.filter(r => r.data === selectedDate);

        return (
          <div className="space-y-5">
            {/* Step 1: Dia + Horário */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" /> Selecione dia e horário
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:flex md:items-center md:gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Dia</label>
                  <input type="date" value={selectedDate} onChange={e => { onDateChange(e.target.value); setSelectedHora(null); setBookingCell(null); }}
                    className={`w-full md:w-44 ${inp}`} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Horário</label>
                  <TimeInput
                    value={selectedHora ?? ""}
                    onChange={val => { setSelectedHora(val || null); setBookingCell(null); setBookingForm({ nome: "", tel: "", valor: "" }); }}
                    className="w-full md:w-28"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Duração</label>
                  <select value={bookingDuracao} onChange={e => setBookingDuracao(parseInt(e.target.value))}
                    className={`w-full md:w-28 ${inp}`}>
                    {duracaoOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Quadras disponíveis (só aparece após selecionar horário) */}
            {selectedHora !== null && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-800">
                  Quadras — {selectedHora}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-3">
                  {courts.map(c => {
                    const courtSlots = c.horariosSemanais?.[dayKey]?.slots ?? [];
                    const isUnavailable = !selectedHora || !courtSlots.includes(selectedHora);
                    const booking = dayBookings.find(b => {
                      if (b.quadra_id !== c.id) return false;
                      const occupied = slotsOcupados(b.hora_inicio, b.duracao ?? 60, step);
                      return occupied.includes(selectedHora!);
                    });
                    const isSelected = bookingCell?.courtId === c.id && bookingCell?.hora === selectedHora;

                    if (isUnavailable) {
                      return (
                        <div key={c.id} className="relative w-full md:w-36 h-20 rounded-xl overflow-hidden border border-gray-200 opacity-50 cursor-not-allowed">
                          <div className="absolute inset-0" style={{
                            background: "repeating-linear-gradient(45deg, #f3f4f6, #f3f4f6 4px, #e5e7eb 4px, #e5e7eb 8px)",
                          }} />
                          <div className="relative z-10 flex flex-col items-center justify-center h-full">
                            <span className="text-xs font-semibold text-gray-400">{c.nome}</span>
                            <span className="text-[10px] text-gray-400">Indisponível</span>
                          </div>
                        </div>
                      );
                    }

                    if (booking) {
                      return (
                        <div key={c.id} className="relative w-full md:w-36 h-20 rounded-xl overflow-hidden border border-gray-200">
                          <div className="absolute inset-0" style={{
                            background: "repeating-linear-gradient(45deg, #fef3c7, #fef3c7 4px, #fde68a 4px, #fde68a 8px)",
                          }} />
                          <div className="relative z-10 flex flex-col items-center justify-center h-full px-2">
                            <span className="text-xs font-semibold text-amber-700">{c.nome}</span>
                            <span className="text-[10px] text-amber-600 truncate max-w-full">{booking.nome_cliente}</span>
                            <button onClick={() => handleDeleteBooking(booking.id)}
                              disabled={deletingBookingId === booking.id}
                              className="mt-0.5 text-[10px] text-red-400 hover:text-red-600">
                              {deletingBookingId === booking.id ? "..." : "cancelar"}
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <button key={c.id} onClick={() => { setBookingCell({ courtId: c.id, hora: selectedHora! }); setBookingForm({ nome: "", tel: "", valor: "" }); }}
                        className={`w-full md:w-36 h-20 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${
                          isSelected
                            ? "border-green-500 bg-green-50 ring-2 ring-green-200"
                            : "border-green-200 bg-white hover:border-green-400 hover:bg-green-50"
                        }`}>
                        <span className="text-xs font-semibold text-gray-700">{c.nome}</span>
                        <span className="text-[10px] text-green-600 font-medium mt-0.5">Disponível</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Form nome + telefone (só aparece após selecionar quadra) */}
            {bookingCell && selectedHora !== null && (
              <div className="bg-white rounded-xl border border-green-200 p-4 md:p-5 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">
                  Reservar {courts.find(c => c.id === bookingCell.courtId)?.nome} — {selectedHora}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:items-end gap-3">
                  <div className="sm:col-span-2 md:flex-1 md:min-w-[150px]">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nome do cliente *</label>
                    <input autoFocus value={bookingForm.nome}
                      onChange={e => setBookingForm(p => ({ ...p, nome: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && handleAddBooking(bookingCell.courtId, selectedHora!)}
                      placeholder="João Silva" className={`w-full ${inp}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Telefone</label>
                    <input value={bookingForm.tel}
                      onChange={e => setBookingForm(p => ({ ...p, tel: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && handleAddBooking(bookingCell.courtId, selectedHora!)}
                      placeholder="(11) 99999-9999" className={`w-full ${inp}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Valor (R$)</label>
                    <input value={bookingForm.valor}
                      onChange={e => setBookingForm(p => ({ ...p, valor: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && handleAddBooking(bookingCell.courtId, selectedHora!)}
                      placeholder="150" type="number" step="0.01" className={`w-full ${inp}`} />
                  </div>
                  <div className="flex gap-2 sm:col-span-2 md:col-span-1">
                    <button onClick={() => handleAddBooking(bookingCell.courtId, selectedHora!)} disabled={bookingLoading}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg">
                      {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Reservar
                    </button>
                    <button onClick={() => { setBookingCell(null); setBookingForm({ nome: "", tel: "", valor: "" }); }}
                      className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ════════════ TAB: POR QUADRA (OUTLOOK) ════════════ */}
      {tab === "quadra" && (() => {
        const outlookCourt = courts.find(c => c.id === outlookCourtId) ?? courts[0];
        return (
        <div className="space-y-4">
          {/* Court selector */}
          {courts.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {courts.map(c => (
                <button key={c.id} onClick={() => setOutlookCourtId(c.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    outlookCourtId === c.id
                      ? "bg-green-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  {c.nome}
                </button>
              ))}
            </div>
          )}

          {/* View toggle + navigation */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
              <button onClick={() => setOutlookView("semanal")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${outlookView === "semanal" ? "bg-white text-green-700 shadow-sm" : "text-gray-500"}`}>
                Semanal
              </button>
              <button onClick={() => setOutlookView("mensal")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${outlookView === "mensal" ? "bg-white text-green-700 shadow-sm" : "text-gray-500"}`}>
                Mensal
              </button>
            </div>

            <div className="flex items-center gap-2">
              {outlookView === "semanal" ? (
                <>
                  <button onClick={() => {
                    const d = new Date(outlookWeekBase + "T12:00:00");
                    d.setDate(d.getDate() - 7);
                    setOutlookWeekBase(d.toISOString().slice(0, 10));
                  }} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={() => setOutlookWeekBase(todayISO())}
                    className="text-xs text-green-600 font-medium px-2 py-1 rounded hover:bg-green-50">Hoje</button>
                  <button onClick={() => {
                    const d = new Date(outlookWeekBase + "T12:00:00");
                    d.setDate(d.getDate() + 7);
                    setOutlookWeekBase(d.toISOString().slice(0, 10));
                  }} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => {
                    setOutlookMonth(p => p.month === 0 ? { year: p.year - 1, month: 11 } : { ...p, month: p.month - 1 });
                  }} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                  </button>
                  <span className="text-sm font-semibold text-gray-700 min-w-[140px] text-center">
                    {MONTH_FULL[outlookMonth.month]} {outlookMonth.year}
                  </span>
                  <button onClick={() => {
                    setOutlookMonth(p => p.month === 11 ? { year: p.year + 1, month: 0 } : { ...p, month: p.month + 1 });
                  }} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── Weekly Outlook View ── */}
          {outlookView === "semanal" && outlookCourt && (() => {
            const c = outlookCourt;
            const weekDates = getWeekDates(outlookWeekBase);
            const weekLabel = (() => {
              const f = formatDateLabel(weekDates[0]);
              const l = formatDateLabel(weekDates[6]);
              return `${f.num} ${f.mes} – ${l.num} ${l.mes}`;
            })();
            // Collect slots for the selected court — in 15 min increments
            const allSlotsSet = new Set<string>();
            weekDates.forEach(date => {
              const dk = getDayKey(date);
              (c.horariosSemanais?.[dk]?.slots ?? []).forEach(s => allSlotsSet.add(s));
            });
            const allSlots15 = Array.from(allSlotsSet).sort();

            // Pre-compute which cells to skip (spanned by a booking above)
            const spannedCells = new Set<string>();
            const bookingAtStart = new Map<string, typeof allBookings[0]>();

            for (const date of weekDates) {
              const dateBookings = allBookings.filter(b => b.quadra_id === c.id && b.data === date);
              for (const b of dateBookings) {
                const dur = b.duracao ?? 60;
                const spanRows = Math.max(1, Math.floor(dur / step));
                bookingAtStart.set(`${date}_${b.hora_inicio}`, b);
                // Mark subsequent rows as spanned
                const [hh, mm] = b.hora_inicio.split(":").map(Number);
                const startMin = hh * 60 + mm;
                for (let i = 1; i < spanRows; i++) {
                  const t = startMin + i * step;
                  const spanSlot = `${String(Math.floor(t / 60)).padStart(2,"0")}:${String(t % 60).padStart(2,"0")}`;
                  spannedCells.add(`${date}_${spanSlot}`);
                }
              }
            }

            return (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-2 border-b border-gray-100 text-sm font-semibold text-gray-600">
                  {c.nome} — {weekLabel}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-2 py-2 text-left text-xs font-semibold text-gray-400 w-14 sticky left-0 bg-gray-50 border-r border-gray-100">Hora</th>
                        {weekDates.map(date => {
                          const { dia, num, mes } = formatDateLabel(date);
                          const isToday = date === todayISO();
                          return (
                            <th key={date}
                              className={`px-1 py-1.5 text-center font-semibold border-l border-gray-200 min-w-[100px] ${isToday ? "bg-green-50 text-green-700" : "text-gray-500"}`}>
                              {dia} {num}/{mes}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {allSlots15.map(slot => {
                        const isHour = slot.endsWith(":00");
                        const isHalf = slot.endsWith(":30");
                        const isMain = isHour || isHalf;
                        return (
                        <tr key={slot} className={`hover:bg-gray-50/50 ${isHour ? "border-t border-gray-200" : isHalf ? "border-t border-gray-100" : "border-t border-gray-50"}`}>
                          <td className={`px-2 font-mono sticky left-0 bg-white border-r border-gray-100 ${isMain ? "py-1 font-semibold text-gray-400" : "py-0.5 text-gray-200"}`}>
                            {isMain ? slot : ""}
                          </td>
                          {weekDates.map(date => {
                            const cellKey = `${date}_${slot}`;

                            // Skip if this cell is consumed by a rowSpan above
                            if (spannedCells.has(cellKey)) {
                              // During drag, skip normally (rowSpan handles it)
                              return null;
                            }

                            const dk = getDayKey(date);
                            const courtSlots = c.horariosSemanais?.[dk]?.slots ?? [];
                            const isUnavailable = !courtSlots.includes(slot);

                            // Check if a booking starts at this 30-min row
                            const booking = bookingAtStart.get(cellKey);

                            if (isUnavailable) {
                              return (
                                <td key={date} className="px-0.5 py-0.5 border-l border-gray-100">
                                  <div className="h-5 rounded" style={{
                                    background: "repeating-linear-gradient(45deg, #f9fafb, #f9fafb 3px, #f3f4f6 3px, #f3f4f6 6px)",
                                  }} />
                                </td>
                              );
                            }

                            if (booking) {
                              const dur = booking.duracao ?? 60;
                              const spanRows = Math.max(1, Math.floor(dur / step));
                              const duracaoLabel = DURACAO_OPTIONS.find(o => o.value === dur)?.label ?? `${dur}min`;
                              const isRecorrente = !!booking.recorrencia_grupo_id;
                              const showingDeleteConfirm = deleteRecConfirm?.bookingId === booking.id;

                              return (
                                <td key={date} rowSpan={spanRows} className="px-0.5 py-0.5 border-l border-gray-100 align-top"
                                  onDragOver={e => {
                                    if (draggingBooking && draggingBooking.id !== booking.id) {
                                      e.preventDefault();
                                      e.dataTransfer.dropEffect = "move";
                                    } else if (draggingBooking?.id === booking.id) {
                                      // Allow drop on self to reposition within the slot
                                      e.preventDefault();
                                      e.dataTransfer.dropEffect = "move";
                                      // Calculate which 15-min slot based on Y position
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      const relY = e.clientY - rect.top;
                                      const slotIndex = Math.floor(relY / (rect.height / spanRows));
                                      const [hh, mm] = slot.split(":").map(Number);
                                      const targetMin = hh * 60 + mm + slotIndex * 15;
                                      const targetSlot = `${String(Math.floor(targetMin / 60)).padStart(2,"0")}:${String(targetMin % 60).padStart(2,"0")}`;
                                      setDragOverCell(`${date}_${targetSlot}`);
                                    }
                                  }}
                                  onDragLeave={() => setDragOverCell(null)}
                                  onDrop={e => {
                                    if (!draggingBooking) return;
                                    e.preventDefault();
                                    if (draggingBooking.id === booking.id) {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      const relY = e.clientY - rect.top;
                                      const slotIndex = Math.floor(relY / (rect.height / spanRows));
                                      const [hh, mm] = slot.split(":").map(Number);
                                      const targetMin = hh * 60 + mm + slotIndex * 15;
                                      const targetSlot = `${String(Math.floor(targetMin / 60)).padStart(2,"0")}:${String(targetMin % 60).padStart(2,"0")}`;
                                      handleDropBooking(date, targetSlot);
                                    } else {
                                      handleDropBooking(date, slot);
                                    }
                                  }}>
                                  <div
                                    draggable
                                    onDragStart={(e) => {
                                      setDraggingBooking(booking);
                                      e.dataTransfer.effectAllowed = "move";
                                      e.dataTransfer.setData("text/plain", booking.id);
                                    }}
                                    onDragEnd={() => { setDraggingBooking(null); setDragOverCell(null); }}
                                    className={`h-full rounded-lg flex flex-col items-start justify-center px-2 py-1 cursor-grab active:cursor-grabbing group relative ${
                                    isRecorrente ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                                  } ${draggingBooking?.id === booking.id ? "opacity-50" : ""}`}
                                    style={{ minHeight: `${spanRows * 24}px` }}
                                    onClick={() => {
                                      if (draggingBooking) return;
                                      setEditingBooking(booking);
                                      setEditForm({ nome: booking.nome_cliente, tel: booking.telefone ?? "", valor: booking.valor?.toString() ?? "" });
                                      setBookingDuracao(booking.duracao ?? 60);
                                      setBookingModal({ courtId: c.id, courtName: c.nome, date, hora: booking.hora_inicio, mode: "edit", booking });
                                      setModalHora(booking.hora_inicio);
                                      setDeleteRecConfirm(null);
                                    }}
                                    title={`${booking.nome_cliente} — ${booking.hora_inicio} (${duracaoLabel})${booking.telefone ? ` - ${booking.telefone}` : ""}${booking.valor ? ` - R$${booking.valor}` : ""}\nClique para editar`}>
                                    <span className="truncate text-xs font-semibold w-full">{booking.nome_cliente}</span>
                                    <span className="text-[10px] opacity-70">{booking.hora_inicio} · {duracaoLabel}</span>
                                    {booking.valor != null && <span className="text-[10px] opacity-70">R${booking.valor}</span>}

                                    {/* Botões de editar/excluir no hover */}
                                    {!showingDeleteConfirm && (
                                      <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 absolute top-1 left-1.5 transition-opacity pointer-events-none" />
                                    )}
                                    {!showingDeleteConfirm && (
                                      <button onClick={(e) => {
                                        e.stopPropagation();
                                        if (isRecorrente) {
                                          setDeleteRecConfirm({ bookingId: booking.id, grupoId: booking.recorrencia_grupo_id! });
                                        } else {
                                          handleDeleteBooking(booking.id);
                                        }
                                      }}
                                        disabled={deletingBookingId === booking.id}
                                        className="opacity-0 group-hover:opacity-100 absolute top-1 right-1 p-0.5 hover:text-red-600 transition-opacity">
                                        {deletingBookingId === booking.id
                                          ? <Loader2 className="w-3 h-3 animate-spin" />
                                          : <Trash2 className="w-3 h-3" />}
                                      </button>
                                    )}

                                    {/* Menu de exclusão para recorrente */}
                                    {showingDeleteConfirm && (
                                      <div className="absolute inset-0 bg-white/95 rounded-lg flex flex-col items-center justify-center gap-1 p-1 z-10 border border-red-200"
                                        onClick={e => e.stopPropagation()}>
                                        <span className="text-[10px] font-semibold text-gray-700">Excluir:</span>
                                        <button onClick={() => { handleDeleteBooking(booking.id); setDeleteRecConfirm(null); }}
                                          disabled={deletingBookingId === booking.id}
                                          className="w-full text-[10px] font-medium py-1 rounded bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors">
                                          Só este dia
                                        </button>
                                        <button onClick={() => { setDeleteSerieConfirm(deleteRecConfirm.grupoId); setDeleteRecConfirm(null); }}
                                          className="w-full text-[10px] font-medium py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors">
                                          Série toda
                                        </button>
                                        <button onClick={() => setDeleteRecConfirm(null)}
                                          className="w-full text-[10px] text-gray-400 hover:text-gray-600 py-0.5">
                                          Cancelar
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              );
                            }

                            // Check if this slot is occupied by a booking but not the start (shouldn't happen since we handle spannedCells, but fallback)
                            const occupyingBooking = allBookings.find(b => {
                              if (b.quadra_id !== c.id || b.data !== date) return false;
                              return slotsOcupados(b.hora_inicio, b.duracao ?? 60, step).includes(slot);
                            });
                            if (occupyingBooking && !booking) {
                              // Already handled by rowSpan, skip
                              return null;
                            }

                            const cellDropKey = `${date}_${slot}`;
                            return (
                              <td key={date} className="px-0.5 py-0.5 border-l border-gray-100"
                                onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOverCell(cellDropKey); }}
                                onDragLeave={() => setDragOverCell(null)}
                                onDrop={e => { e.preventDefault(); handleDropBooking(date, slot); }}>
                                <button onClick={() => {
                                  onDateChange(date);
                                  setBookingForm({ nome: "", tel: "", valor: "" });
                                  setBookingDuracao(Math.max(60, minDuracao));
                                  setModalHora(slot);
                                  setBookingModal({ courtId: c.id, courtName: c.nome, date, hora: slot, mode: "create" });
                                }}
                                  className={`w-full h-5 rounded border border-dashed transition-colors ${
                                    dragOverCell === cellDropKey
                                      ? "border-green-400 bg-green-100"
                                      : "border-transparent hover:border-green-300 hover:bg-green-50"
                                  }`} />
                              </td>
                            );
                          })}
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* ── Monthly Outlook View ── */}
          {outlookView === "mensal" && outlookCourt && (() => {
            const c = outlookCourt;
            const monthWeeks = getMonthDates(outlookMonth.year, outlookMonth.month);
            return (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-2 border-b border-gray-100 text-sm font-semibold text-gray-600">
                  {c.nome}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(d => (
                          <th key={d} className="px-2 py-2 text-center text-xs font-semibold text-gray-500">{d}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {monthWeeks.map((week, wi) => (
                        <tr key={wi} className="border-t border-gray-100">
                          {week.map((date, di) => {
                            if (!date) return <td key={di} className="px-2 py-3 bg-gray-50" />;
                            const { num } = formatDateLabel(date);
                            const isToday = date === todayISO();
                            const dayBookings = allBookings.filter(b => b.data === date && b.quadra_id === c.id);
                            const bookingCount = dayBookings.length;

                            return (
                              <td key={di} className={`px-1.5 py-1.5 align-top cursor-pointer hover:bg-green-50 transition-colors ${isToday ? "bg-green-50" : ""}`}
                                onClick={() => {
                                  setOutlookView("semanal");
                                  setOutlookWeekBase(date);
                                  onDateChange(date);
                                }}>
                                <div className={`text-xs font-semibold mb-1 ${isToday ? "text-green-700" : "text-gray-700"}`}>
                                  {num}
                                </div>
                                {bookingCount > 0 && (
                                  <div className="text-[10px] bg-amber-100 text-amber-700 rounded px-1 py-0.5 text-center font-medium">
                                    {bookingCount} reserva{bookingCount > 1 ? "s" : ""}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
        );
      })()}

      {/* ════════════ TAB: RECORRENTE ════════════ */}
      {tab === "recorrente" && (
        <div className="space-y-5">
          {/* Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Repeat className="w-4 h-4 text-green-600" /> Novo Mensalista
            </h3>

            {recError && (
              <div className={`text-sm font-medium rounded-lg px-4 py-3 border ${
                recError.startsWith("⚠️")
                  ? "bg-amber-50 border-amber-300 text-amber-800"
                  : "bg-red-50 border-red-300 text-red-700"
              }`}>
                {recError}
              </div>
            )}
            {recSuccess && <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{recSuccess}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Quadra *</label>
                <select value={recForm.quadra_id} onChange={e => setRecForm(p => ({ ...p, quadra_id: e.target.value }))}
                  className={`w-full ${inp}`}>
                  {courts.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Horário *</label>
                <TimeInput
                  value={recForm.hora_inicio}
                  onChange={val => setRecForm(p => ({ ...p, hora_inicio: val }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Duração</label>
                <select value={recForm.duracao} onChange={e => setRecForm(p => ({ ...p, duracao: parseInt(e.target.value) }))}
                  className={`w-full ${inp}`}>
                  {duracaoOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Dias da semana *</label>
              <div className="grid grid-cols-7 gap-1">
                {(["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] as const).map((label, idx) => (
                  <button key={idx} type="button"
                    onClick={() => setRecForm(p => ({
                      ...p,
                      dias_semana: p.dias_semana.includes(idx)
                        ? p.dias_semana.filter(d => d !== idx)
                        : [...p.dias_semana, idx].sort(),
                    }))}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      recForm.dias_semana.includes(idx)
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-600 border-gray-300"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">A partir de *</label>
              <input type="date" value={recForm.data_inicio} onChange={e => setRecForm(p => ({ ...p, data_inicio: e.target.value }))}
                className={`w-full ${inp}`} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nome do cliente *</label>
                <input value={recForm.nome} onChange={e => setRecForm(p => ({ ...p, nome: e.target.value }))}
                  placeholder="João Silva" className={`w-full ${inp}`} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Telefone</label>
                <input value={recForm.tel} onChange={e => setRecForm(p => ({ ...p, tel: e.target.value }))}
                  placeholder="(11) 99999-9999" className={`w-full ${inp}`} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Valor (R$)</label>
                <input value={recForm.valor} onChange={e => setRecForm(p => ({ ...p, valor: e.target.value }))}
                  placeholder="150" type="number" step="0.01" className={`w-full ${inp}`} />
              </div>
            </div>

            <button onClick={handleAddRecurrent} disabled={recLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
              {recLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Repeat className="w-4 h-4" />}
              Agendar Mensalista
            </button>
          </div>

          {/* Dashboard de Recorrentes */}
          {(() => {
            const groups = new Map<string, { bookings: Reserva[]; recorrencia: string }>();
            allBookings.forEach(b => {
              if (b.recorrencia_grupo_id) {
                if (!groups.has(b.recorrencia_grupo_id)) {
                  groups.set(b.recorrencia_grupo_id, { bookings: [], recorrencia: b.recorrencia || "" });
                }
                groups.get(b.recorrencia_grupo_id)!.bookings.push(b);
              }
            });
            if (groups.size === 0) return (
              <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-8 text-center">
                <Repeat className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Nenhum mensalista cadastrado</p>
              </div>
            );

            const today = todayISO();
            const recLabels: Record<string, string> = { mensalista: "Mensalista", semanal: "Semanal", quinzenal: "Quinzenal", mensal: "Mensal" };
            const DAY_NAMES_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-green-600" />
                    Mensalistas Ativos ({groups.size})
                  </h3>
                </div>
                {Array.from(groups.entries()).map(([grupoId, { bookings, recorrencia }]) => {
                  const sorted = bookings.sort((a, b) => a.data.localeCompare(b.data));
                  const first = sorted[0];
                  const last = sorted[sorted.length - 1];
                  const court = courts.find(c => c.id === first.quadra_id);
                  const futureBookings = sorted.filter(b => b.data >= today);
                  const pastBookings = sorted.filter(b => b.data < today);
                  const nextBooking = futureBookings[0];
                  const progress = sorted.length > 0 ? Math.round((pastBookings.length / sorted.length) * 100) : 0;

                  const formatDate = (d: string) => {
                    const dt = new Date(d + "T12:00:00");
                    return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
                  };
                  const dayName = nextBooking ? DAY_NAMES_SHORT[new Date(nextBooking.data + "T12:00:00").getDay()] : "";

                  return (
                    <div key={grupoId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="p-4">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-4 h-4 text-blue-500" />
                              <span className="font-semibold text-gray-800">{first.nome_cliente}</span>
                              <span className="capitalize text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                                {recLabels[recorrencia] || recorrencia}
                              </span>
                            </div>
                            {first.telefone && (
                              <span className="text-xs text-gray-400 ml-6">{first.telefone}</span>
                            )}
                          </div>
                          <button onClick={() => handleDeleteGroup(grupoId)}
                            disabled={deletingGroupId === grupoId}
                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                            {deletingGroupId === grupoId
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />}
                            Cancelar
                          </button>
                        </div>

                        {/* Info grid */}
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div className="bg-gray-50 rounded-lg px-3 py-2">
                            <p className="text-[10px] text-gray-400 uppercase font-medium">Quadra</p>
                            <p className="text-sm font-semibold text-gray-700 truncate">{court?.nome ?? "—"}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg px-3 py-2">
                            <p className="text-[10px] text-gray-400 uppercase font-medium">Horário</p>
                            <p className="text-sm font-semibold text-gray-700">{first.hora_inicio} ({first.duracao}min)</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg px-3 py-2">
                            <p className="text-[10px] text-gray-400 uppercase font-medium">Próximo</p>
                            <p className="text-sm font-semibold text-gray-700">
                              {nextBooking ? `${dayName} ${new Date(nextBooking.data + "T12:00:00").getDate()}/${new Date(nextBooking.data + "T12:00:00").getMonth() + 1}` : "—"}
                            </p>
                          </div>
                        </div>

                        {/* Period + progress */}
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                          <span>{formatDate(first.data)} → {formatDate(last.data)}</span>
                          <span className="text-gray-300">|</span>
                          <span className="font-medium">{futureBookings.length} restantes de {sorted.length}</span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Modal de Booking (criar/editar) ── */}
      {bookingModal && (() => {
        const { courtName, date, hora, mode, booking } = bookingModal;
        const dateObj = new Date(date + "T12:00:00");
        const dateLabel = `${String(dateObj.getDate()).padStart(2,"0")}/${String(dateObj.getMonth()+1).padStart(2,"0")}/${dateObj.getFullYear()}`;
        const isCreate = mode === "create";
        const form = isCreate ? bookingForm : editForm;
        const setForm = isCreate
          ? (fn: (p: typeof bookingForm) => typeof bookingForm) => setBookingForm(fn)
          : (fn: (p: typeof editForm) => typeof editForm) => setEditForm(fn);

        async function handleSubmit() {
          if (isCreate) {
            await handleOutlookBooking(bookingModal!.courtId, date, modalHora);
            setBookingModal(null);
          } else if (editingBooking) {
            // If hora changed, update it too
            const horaChanged = modalHora !== editingBooking.hora_inicio;
            setBookingLoading(true);
            try {
              await updateBooking(arena.id, editingBooking.id, {
                nome_cliente: editForm.nome.trim(),
                telefone: editForm.tel.trim() || undefined,
                valor: editForm.valor ? parseFloat(editForm.valor) : undefined,
                duracao: bookingDuracao,
                ...(horaChanged ? { hora_inicio: modalHora } : {}),
              });
              await onBookingChange();
              setEditingBooking(null);
              setBookingModal(null);
            } catch (err) {
              setBookingError(err instanceof Error ? err.message : "Erro ao salvar");
              setTimeout(() => setBookingError(""), 5000);
            } finally { setBookingLoading(false); }
          }
        }

        const isPastDate = date < todayISO();

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setBookingModal(null)}
            onKeyDown={e => e.key === "Escape" && setBookingModal(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className={`${isPastDate ? "bg-amber-500" : "bg-green-600"} px-5 py-4 text-white`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{isCreate ? "Nova Reserva" : "Editar Reserva"}</h3>
                  <button onClick={() => setBookingModal(null)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-2 text-green-100 text-sm">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {dateLabel}</span>
                  <span>{courtName}</span>
                </div>
              </div>

              {/* Aviso de data passada */}
              {isPastDate && (
                <div className="mx-5 mt-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-amber-700">
                    Esta data já passou. A reserva será registrada apenas para controle.
                  </span>
                </div>
              )}

              {/* Body */}
              <div className={`px-5 ${isPastDate ? "pt-2" : "pt-4"} pb-4 space-y-4`}>
                {/* Horário de início */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Horário de início</label>
                  <TimeInput
                    value={modalHora}
                    onChange={val => setModalHora(val)}
                    className="w-full"
                  />
                </div>

                {/* Duração */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Duração</label>
                  <div className="flex flex-wrap gap-2">
                    {duracaoOptions.map(opt => (
                      <button key={opt.value}
                        onClick={() => setBookingDuracao(opt.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          bookingDuracao === opt.value
                            ? "bg-green-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nome */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nome *</label>
                  <input autoFocus value={form.nome}
                    onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    placeholder="Nome do cliente"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Telefone</label>
                  <input value={form.tel}
                    onChange={e => setForm(p => ({ ...p, tel: e.target.value }))}
                    placeholder="(00) 00000-0000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>

                {/* Valor */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Valor (R$)</label>
                  <input value={form.valor} type="number" step="0.01"
                    onChange={e => setForm(p => ({ ...p, valor: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    placeholder="0,00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                <button onClick={() => setBookingModal(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleSubmit} disabled={bookingLoading || !form.nome.trim()}
                  className="px-5 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                  {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isCreate ? "Reservar" : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal de confirmação para excluir série toda */}
      {deleteSerieConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDeleteSerieConfirm(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm mx-4 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800">Excluir série toda?</h3>
            <p className="text-sm text-gray-600">
              Todas as reservas deste mensalista serão excluídas permanentemente. Essa ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteSerieConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Cancelar
              </button>
              <button onClick={async () => {
                  const grupoId = deleteSerieConfirm;
                  setDeleteSerieConfirm(null);
                  await handleDeleteGroup(grupoId);
                }}
                disabled={deletingGroupId === deleteSerieConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors">
                {deletingGroupId === deleteSerieConfirm ? "Excluindo..." : "Sim, excluir tudo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

function Dashboard({ user }: { user: User }) {
  const [arenas, setArenas] = useState<Quadra[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedArenaId, setSelectedArenaId] = useState<string | null>(null);
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [showSettings, setShowSettings] = useState(false);
  const [editingCourtId, setEditingCourtId] = useState<string | null>(null);
  const [isNewArena, setIsNewArena] = useState(false);
  const [addingCourt, setAddingCourt] = useState(false);
  const [courtError, setCourtError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    getMinhasQuadras()
      .then(data => {
        setArenas(data);
        if (data.length > 0 && !selectedArenaId) {
          setSelectedArenaId(data[0].id);
          if (data[0].quadrasInternas?.length) setSelectedCourtId(data[0].quadrasInternas[0].id);
        }
      })
      .catch(() => setArenas([]))
      .finally(() => setLoadingList(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedArena = arenas.find(a => a.id === selectedArenaId);
  const courts = selectedArena?.quadrasInternas ?? [];

  function selectArena(a: Quadra) {
    setSelectedArenaId(a.id);
    setIsNewArena(false);
    setEditingCourtId(null);
    const firstCourt = a.quadrasInternas?.[0];
    setSelectedCourtId(firstCourt?.id ?? null);
  }

  async function refreshArena() {
    if (!selectedArenaId) return;
    // Usar endpoint autenticado para garantir que reservas venham sempre
    const all = await getMinhasQuadras();
    const updated = all.find(a => a.id === selectedArenaId);
    if (updated) {
      setArenas(all);
      return updated;
    }
  }

  async function handleAddCourt() {
    if (!selectedArenaId) return;
    setAddingCourt(true);
    setCourtError("");
    try {
      const count = (selectedArena?.quadrasInternas?.length ?? 0) + 1;
      await addCourt(selectedArenaId, { nome: `Quadra ${count}` });
      const updated = await refreshArena();
      const newCourt = updated?.quadrasInternas?.at(-1);
      if (newCourt) setSelectedCourtId(newCourt.id);
    } catch (err) {
      setCourtError(err instanceof Error ? err.message : "Erro ao adicionar quadra");
    } finally { setAddingCourt(false); }
  }

  async function handleDeleteArena() {
    if (!selectedArena) return;
    await deleteQuadra(selectedArena.id);
    const remaining = arenas.filter(a => a.id !== selectedArena.id);
    setArenas(remaining);
    setSelectedArenaId(remaining[0]?.id ?? null);
    setSelectedCourtId(remaining[0]?.quadrasInternas?.[0]?.id ?? null);
    setShowSettings(false);
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Left sidebar: arenas ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col shrink-0
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0 md:w-52 md:z-auto
      `}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <Link href="/" className="text-lg font-black tracking-widest text-green-600">FUTZER</Link>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{user.nome}</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-2.5">
          <button
            onClick={() => { setIsNewArena(true); setSelectedArenaId(null); setSidebarOpen(false); }}
            className="w-full flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Nova Arena
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {loadingList ? (
            <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 text-green-600 animate-spin" /></div>
          ) : (
            <div className="space-y-0.5">
              {arenas.map(a => (
                <button key={a.id} onClick={() => { selectArena(a); setSidebarOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${selectedArenaId === a.id && !isNewArena ? "bg-green-50 text-green-800" : "hover:bg-gray-50 text-gray-700"}`}>
                  <p className="text-sm font-medium truncate">{a.nome}</p>
                  <p className="text-xs text-gray-400">{a.endereco?.cidade}, {a.endereco?.estado}</p>
                </button>
              ))}
              {isNewArena && (
                <div className="px-3 py-2.5 rounded-lg bg-green-50">
                  <p className="text-sm font-medium text-green-700 italic">Nova arena...</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-2.5 border-t border-gray-100">
          <button
            onClick={() => { logout(); window.location.href = "/owner/login"; }}
            className="w-full flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>

      {/* ── Main panel ── */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {isNewArena ? (
          <NewArenaPanel
            onCreated={a => { setArenas(prev => [...prev, a]); selectArena(a); setIsNewArena(false); }}
            onCancel={() => { setIsNewArena(false); }}
          />
        ) : !selectedArena ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden self-start mb-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-3 text-2xl">⚽</div>
            <h2 className="text-lg font-semibold text-gray-700 mb-1">Selecione uma Arena</h2>
            <p className="text-sm text-gray-400 mb-5">ou crie uma nova na lista ao lado</p>
            <button onClick={() => setIsNewArena(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg">
              <Plus className="w-4 h-4" /> Nova Arena
            </button>
          </div>
        ) : (
          <>
            {/* Arena header */}
            <div className="bg-white border-b border-gray-200 px-3 md:px-6 py-3 flex items-center justify-between shrink-0 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg shrink-0">
                  <Menu className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <h1 className="text-base md:text-lg font-bold text-gray-900 truncate">{selectedArena.nome}</h1>
                  <p className="text-xs text-gray-400 truncate">{selectedArena.endereco?.cidade}, {selectedArena.endereco?.estado}</p>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => setShowSettings(true)}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 px-2 md:px-3 py-1.5 rounded-lg transition-colors">
                  <Settings className="w-4 h-4" /> <span className="hidden sm:inline">Configurar</span>
                </button>
              </div>
            </div>

            {/* Courts tabs */}
            <div className="bg-white border-b border-gray-200 px-3 md:px-6 py-2 flex items-center gap-2 overflow-x-auto shrink-0">
              {courts.map(c => (
                <div key={c.id} className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => { setSelectedCourtId(c.id); setEditingCourtId(null); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedCourtId === c.id ? "bg-green-100 text-green-800" : "hover:bg-gray-100 text-gray-600"}`}
                  >
                    {c.imagemCapa ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.imagemCapa} alt="" className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center text-xs">⚽</span>
                    )}
                    {c.nome}
                  </button>
                  <button
                    onClick={() => setEditingCourtId(editingCourtId === c.id ? null : c.id)}
                    className={`p-1 rounded transition-colors ${editingCourtId === c.id ? "text-green-600" : "text-gray-300 hover:text-gray-500"}`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddCourt}
                disabled={addingCourt}
                className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors shrink-0"
              >
                {addingCourt ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Quadra
              </button>
              {courtError && (
                <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded shrink-0">{courtError}</span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-5">
              {/* Court edit panel */}
              {editingCourtId && (() => {
                const c = courts.find(c => c.id === editingCourtId);
                return c ? (
                  <CourtEditPanel
                    key={c.id} court={c} arenaId={selectedArena.id} step={selectedArena.discretizacaoMinima ?? 15}
                    onSave={() => { refreshArena(); }}
                    onDelete={() => { refreshArena(); setSelectedCourtId(null); }}
                    onClose={() => setEditingCourtId(null)}
                  />
                ) : null;
              })()}

              {/* No courts yet */}
              {courts.length === 0 && (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
                  <p className="text-gray-400 mb-3">Nenhuma quadra cadastrada ainda</p>
                  <button onClick={handleAddCourt} disabled={addingCourt}
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
                    {addingCourt ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Adicionar Quadra
                  </button>
                </div>
              )}

              {/* ── Agenda tabs ── */}
              {courts.length > 0 && (
                <AgendaTabs
                  arena={selectedArena}
                  courts={courts}
                  selectedDate={selectedDate}
                  onDateChange={d => setSelectedDate(d)}
                  onBookingChange={refreshArena}
                />
              )}
            </div>
          </>
        )}
      </main>

      {/* Settings panel */}
      {showSettings && selectedArena && (
        <ArenaSettingsPanel
          arena={selectedArena}
          onSave={updated => setArenas(prev => prev.map(a => a.id === updated.id ? updated : a))}
          onDelete={handleDeleteArena}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default function OwnerDashboardPage() {
  return <OwnerGuard>{(user) => <Dashboard user={user} />}</OwnerGuard>;
}
