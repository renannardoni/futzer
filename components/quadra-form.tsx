'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createQuadra, updateQuadra, uploadImage, type Quadra } from '@/lib/api';
import { ArrowLeft, Save, Loader2, Upload, X, Link as LinkIcon, ImageIcon } from 'lucide-react';

type FormData = {
  nome: string;
  descricao: string;
  tipoPiso: string;
  precoPorHora: string;
  avaliacao: string;
  imagemCapa: string;
  telefone: string;
  rua: string;
  cidade: string;
  estado: string;
  cep: string;
  lat: string;
  lng: string;
};

interface QuadraFormProps {
  quadra?: Quadra;
  mode: 'criar' | 'editar';
}

const tiposPiso = [
  { value: 'society', label: 'Society' },
  { value: 'grama', label: 'Grama Natural' },
  { value: 'salao', label: 'Salão / Futsal' },
  { value: 'quadra', label: 'Quadra' },
  { value: 'campo', label: 'Campo' },
  { value: 'areia', label: 'Areia' },
];

export function QuadraForm({ quadra, mode }: QuadraFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [urlMode, setUrlMode] = useState(!!(quadra?.imagemCapa && (quadra.imagemCapa.includes('unsplash') || quadra.imagemCapa.startsWith('https'))) && !quadra.imagemCapa.includes('localhost'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    nome: quadra?.nome ?? '',
    descricao: quadra?.descricao ?? '',
    tipoPiso: quadra?.tipoPiso ?? 'society',
    precoPorHora: quadra?.precoPorHora?.toString() ?? '',
    avaliacao: quadra?.avaliacao?.toString() ?? '0',
    imagemCapa: quadra?.imagemCapa ?? '',
    telefone: quadra?.telefone ?? '',
    rua: quadra?.endereco?.rua ?? '',
    cidade: quadra?.endereco?.cidade ?? '',
    estado: quadra?.endereco?.estado ?? '',
    cep: quadra?.endereco?.cep ?? '',
    lat: quadra?.coordenadas?.lat?.toString() ?? '',
    lng: quadra?.coordenadas?.lng?.toString() ?? '',
  });

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Selecione um arquivo de imagem (JPEG, PNG ou WebP).');
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm(prev => ({ ...prev, imagemCapa: url }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Erro no upload');
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const clearImage = () => {
    setForm(prev => ({ ...prev, imagemCapa: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const precoNum = form.precoPorHora ? parseFloat(form.precoPorHora) : null;
    const avaliacaoNum = parseFloat(form.avaliacao);
    const latNum = parseFloat(form.lat);
    const lngNum = parseFloat(form.lng);

    if (precoNum !== null && (isNaN(precoNum) || precoNum <= 0)) { setError('Preço por hora inválido.'); return; }
    if (isNaN(avaliacaoNum) || avaliacaoNum < 0 || avaliacaoNum > 5) { setError('Avaliação deve ser entre 0 e 5.'); return; }

    const payload = {
      nome: form.nome,
      descricao: form.descricao,
      tipoPiso: form.tipoPiso,
      precoPorHora: precoNum,
      avaliacao: avaliacaoNum,
      imagemCapa: form.imagemCapa || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&h=600&fit=crop',
      telefone: form.telefone.trim() || null,
      endereco: { rua: form.rua, cidade: form.cidade, estado: form.estado, cep: form.cep },
      coordenadas: { lat: isNaN(latNum) ? 0 : latNum, lng: isNaN(lngNum) ? 0 : lngNum },
    };

    setSaving(true);
    try {
      if (mode === 'criar') {
        await createQuadra(payload);
      } else if (quadra) {
        await updateQuadra(quadra.id, payload);
      }
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar quadra');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6AB945] focus:border-transparent text-sm";
  const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  const previewUrl = form.imagemCapa && !form.imagemCapa.includes('example.com') && !form.imagemCapa.includes('placeholder.com')
    ? form.imagemCapa
    : null;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">
              {mode === 'criar' ? 'Nova Quadra' : `Editar: ${quadra?.nome}`}
            </h1>
          </div>
          <button
            form="quadra-form"
            type="submit"
            disabled={saving || uploading}
            className="flex items-center gap-2 bg-[#6AB945] hover:bg-[#5aa835] disabled:opacity-60 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form id="quadra-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Informações básicas */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Informações Básicas</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelCls}>Nome da Quadra *</label>
                <input required value={form.nome} onChange={set('nome')} placeholder="Ex: Arena Premium Sports" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Descrição *</label>
                <textarea required value={form.descricao} onChange={set('descricao')} rows={3} placeholder="Descreva a quadra..." className={inputCls + ' resize-none'} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Tipo de Piso *</label>
                  <select required value={form.tipoPiso} onChange={set('tipoPiso')} className={inputCls}>
                    {tiposPiso.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Preço por Hora (R$)</label>
                  <input type="number" min="1" step="0.01" value={form.precoPorHora} onChange={set('precoPorHora')} placeholder="120.00 (opcional)" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Avaliação (0–5)</label>
                  <input type="number" min="0" max="5" step="0.1" value={form.avaliacao} onChange={set('avaliacao')} placeholder="4.5" className={inputCls} />
                </div>
              </div>
              <div className="mt-4">
                <label className={labelCls}>Telefone de contato</label>
                <input type="tel" value={form.telefone} onChange={set('telefone')} placeholder="(11) 99999-9999 (opcional)" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Foto de Capa */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800 dark:text-white">Foto de Capa</h2>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setUrlMode(false)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                    !urlMode ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setUrlMode(true)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                    urlMode ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  URL
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              {/* Left: upload area or URL input */}
              <div>
                {!urlMode ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                        dragOver
                          ? 'border-[#6AB945] bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:border-[#6AB945] hover:bg-green-50 dark:hover:bg-green-900/10'
                      }`}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-8 h-8 text-[#6AB945] animate-spin mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">Enviando...</p>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mb-3">
                            <Upload className="w-5 h-5 text-[#6AB945]" />
                          </div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Arraste ou clique para enviar</p>
                          <p className="text-xs text-gray-400 mt-1">JPEG, PNG ou WebP — máx. 5MB</p>
                        </>
                      )}
                    </label>
                    {uploadError && (
                      <p className="text-xs text-red-500 mt-2">{uploadError}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className={labelCls}>URL da imagem</label>
                    <input
                      type="url"
                      value={form.imagemCapa}
                      onChange={set('imagemCapa')}
                      placeholder="https://..."
                      className={inputCls}
                    />
                    <p className="text-xs text-gray-400 mt-1">Cole o link de uma imagem pública</p>
                  </div>
                )}
              </div>

              {/* Right: preview */}
              <div>
                <p className={labelCls}>Preview</p>
                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700">
                  {previewUrl ? (
                    <>
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="w-full h-full object-cover"
                        unoptimized={previewUrl.includes('localhost')}
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                        title="Remover imagem"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                      <p className="text-xs text-gray-400">Sem imagem selecionada</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Endereço</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelCls}>Rua / Logradouro *</label>
                <input required value={form.rua} onChange={set('rua')} placeholder="Rua das Acácias, 123" className={inputCls} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className={labelCls}>Cidade *</label>
                  <input required value={form.cidade} onChange={set('cidade')} placeholder="São Paulo" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Estado *</label>
                  <input required value={form.estado} onChange={set('estado')} placeholder="SP" maxLength={2} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>CEP</label>
                  <input value={form.cep} onChange={set('cep')} placeholder="01234-567" className={inputCls} />
                </div>
              </div>
            </div>
          </div>

          {/* Coordenadas */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-1">Coordenadas (para o mapa)</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Você pode obter no{' '}
              <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="text-[#6AB945] hover:underline">
                Google Maps
              </a>{' '}
              clicando com botão direito no local
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Latitude</label>
                <input type="number" step="any" value={form.lat} onChange={set('lat')} placeholder="-23.5505" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Longitude</label>
                <input type="number" step="any" value={form.lng} onChange={set('lng')} placeholder="-46.6333" className={inputCls} />
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
