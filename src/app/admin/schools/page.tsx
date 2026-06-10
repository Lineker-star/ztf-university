'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClientClient } from '@/lib/supabase/client';
import {
  Plus,
  Trash2,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Layers,
  GraduationCap,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Institute {
  id: string;
  code_en: string;
  name_en: string;
}

interface School {
  id: string;
  institute_id: string;
  name_en: string;
  name_fr: string;
  description_en: string;
  description_fr: string;
  icon: string;
  quote_en: string;
  quote_fr: string;
  display_order: number;
  is_active: boolean;
}

interface Field {
  id: string;
  school_id: string;
  name_en: string;
  name_fr: string;
  description_en: string;
  description_fr: string;
  is_active: boolean;
  display_order: number;
  parent_field_id?: string | null;
}

type SchoolFormData = Omit<School, 'id'>;

const EMPTY_SCHOOL: SchoolFormData = {
  institute_id: '',
  name_en: '',
  name_fr: '',
  description_en: '',
  description_fr: '',
  icon: '📚',
  quote_en: '',
  quote_fr: '',
  display_order: 0,
  is_active: true,
};

const SCHOOL_ICONS = ['📚', '🔬', '💊', '⚖️', '💼', '🌱', '🎓', '🏥', '🔧', '🌿'];

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-[#C9A84C]' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SchoolsPage() {
  const supabase = createClientClient();

  const [activeTab, setActiveTab] = useState<'schools' | 'specializations'>('schools');

  // Data
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [expandedInstitutes, setExpandedInstitutes] = useState<Set<string>>(new Set());
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [deleteSchoolId, setDeleteSchoolId] = useState<string | null>(null);
  const [deleteFieldId, setDeleteFieldId] = useState<string | null>(null);

  // School modal
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [schoolForm, setSchoolForm] = useState<SchoolFormData>(EMPTY_SCHOOL);
  const [savingSchool, setSavingSchool] = useState(false);

  // Fields manager
  const [managingFieldsForSchool, setManagingFieldsForSchool] = useState<string | null>(null);
  const [newFieldEN, setNewFieldEN] = useState('');
  const [newFieldFR, setNewFieldFR] = useState('');
  const [bulkFieldsText, setBulkFieldsText] = useState('');
  const [addingField, setAddingField] = useState(false);

  // Specializations tab
  const [selectedFieldForSpec, setSelectedFieldForSpec] = useState<string | null>(null);
  const [newSpecEN, setNewSpecEN] = useState('');
  const [newSpecFR, setNewSpecFR] = useState('');

  // ── Load ────────────────────────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [instRes, schoolRes, fieldRes] = await Promise.all([
      supabase.from('cms_institutes').select('id, code_en, name_en').order('display_order'),
      supabase.from('cms_schools').select('*').order('display_order'),
      supabase.from('cms_fields').select('*').order('display_order'),
    ]);
    if (instRes.error) setError(instRes.error.message);
    else setInstitutes(instRes.data ?? []);
    if (schoolRes.error) setError(schoolRes.error.message);
    else {
      setSchools(schoolRes.data ?? []);
      // Expand all institutes by default
      const ids = new Set((schoolRes.data ?? []).map((s: School) => s.institute_id));
      setExpandedInstitutes(ids);
    }
    if (fieldRes.error) setError(fieldRes.error.message);
    else setFields(fieldRes.data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── School modal helpers ────────────────────────────────────────────────────

  function openAddSchool() {
    setEditingSchool(null);
    setSchoolForm({ ...EMPTY_SCHOOL, institute_id: institutes[0]?.id ?? '' });
    setShowSchoolModal(true);
  }

  function openEditSchool(school: School) {
    setEditingSchool(school);
    setSchoolForm({
      institute_id: school.institute_id,
      name_en: school.name_en,
      name_fr: school.name_fr,
      description_en: school.description_en ?? '',
      description_fr: school.description_fr ?? '',
      icon: school.icon ?? '📚',
      quote_en: school.quote_en ?? '',
      quote_fr: school.quote_fr ?? '',
      display_order: school.display_order ?? 0,
      is_active: school.is_active ?? true,
    });
    setShowSchoolModal(true);
  }

  function setSchoolField<K extends keyof SchoolFormData>(key: K, value: SchoolFormData[K]) {
    setSchoolForm(prev => ({ ...prev, [key]: value }));
  }

  async function saveSchool() {
    if (!schoolForm.name_en.trim() || !schoolForm.institute_id) {
      setError('Name EN and Institute are required.');
      return;
    }
    setSavingSchool(true);
    if (editingSchool) {
      const { error: err } = await supabase
        .from('cms_schools')
        .update(schoolForm)
        .eq('id', editingSchool.id);
      if (err) { setError(err.message); setSavingSchool(false); return; }
    } else {
      const { error: err } = await supabase.from('cms_schools').insert([schoolForm]);
      if (err) { setError(err.message); setSavingSchool(false); return; }
    }
    setSavingSchool(false);
    setShowSchoolModal(false);
    loadAll();
  }

  // ── School toggle ───────────────────────────────────────────────────────────

  async function toggleSchoolActive(school: School) {
    await supabase
      .from('cms_schools')
      .update({ is_active: !school.is_active })
      .eq('id', school.id);
    setSchools(prev => prev.map(s => s.id === school.id ? { ...s, is_active: !s.is_active } : s));
  }

  // ── School delete ───────────────────────────────────────────────────────────

  async function deleteSchool(id: string) {
    const { error: err } = await supabase.from('cms_schools').delete().eq('id', id);
    if (err) { setError(err.message); return; }
    setDeleteSchoolId(null);
    loadAll();
  }

  // ── Field add ───────────────────────────────────────────────────────────────

  async function addField(schoolId: string) {
    if (!newFieldEN.trim()) return;
    setAddingField(true);
    const { error: err } = await supabase.from('cms_fields').insert([{
      school_id: schoolId,
      name_en: newFieldEN.trim(),
      name_fr: newFieldFR.trim() || newFieldEN.trim(),
      description_en: '',
      description_fr: '',
      is_active: true,
      display_order: fields.filter(f => f.school_id === schoolId).length,
      parent_field_id: null,
    }]);
    if (err) { setError(err.message); }
    else {
      setNewFieldEN('');
      setNewFieldFR('');
      loadAll();
    }
    setAddingField(false);
  }

  async function addBulkFields(schoolId: string) {
    if (!bulkFieldsText.trim()) return;
    const lines = bulkFieldsText.split('\n').map(l => l.trim()).filter(Boolean);
    const rows = lines.map((line, i) => {
      const parts = line.split(':').map(p => p.trim());
      return {
        school_id: schoolId,
        name_en: parts[0],
        name_fr: parts[1] || parts[0],
        description_en: '',
        description_fr: '',
        is_active: true,
        display_order: fields.filter(f => f.school_id === schoolId).length + i,
        parent_field_id: null,
      };
    });
    const { error: err } = await supabase.from('cms_fields').insert(rows);
    if (err) { setError(err.message); return; }
    setBulkFieldsText('');
    loadAll();
  }

  // ── Field toggle / delete ───────────────────────────────────────────────────

  async function toggleFieldActive(field: Field) {
    await supabase.from('cms_fields').update({ is_active: !field.is_active }).eq('id', field.id);
    setFields(prev => prev.map(f => f.id === field.id ? { ...f, is_active: !f.is_active } : f));
  }

  async function deleteField(id: string) {
    const { error: err } = await supabase.from('cms_fields').delete().eq('id', id);
    if (err) { setError(err.message); return; }
    setDeleteFieldId(null);
    loadAll();
  }

  // ── Specialization add ──────────────────────────────────────────────────────

  async function addSpec(parentFieldId: string) {
    if (!newSpecEN.trim()) return;
    // Check if parent_field_id column exists by trying insert
    const { error: err } = await supabase.from('cms_fields').insert([{
      school_id: fields.find(f => f.id === parentFieldId)?.school_id,
      name_en: newSpecEN.trim(),
      name_fr: newSpecFR.trim() || newSpecEN.trim(),
      description_en: '',
      description_fr: '',
      is_active: true,
      display_order: 0,
      parent_field_id: parentFieldId,
    }]);
    if (err) { setError(err.message); return; }
    setNewSpecEN('');
    setNewSpecFR('');
    loadAll();
  }

  // ── Grouped data ────────────────────────────────────────────────────────────

  const groupedSchools = institutes.map(inst => ({
    institute: inst,
    schools: schools.filter(s => s.institute_id === inst.id),
  }));

  const rootFields = fields.filter(f => !f.parent_field_id);
  const hasParentFieldId = fields.some(f => 'parent_field_id' in f);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A1628]">Schools &amp; Fields Manager</h1>
        <p className="text-sm text-gray-500 mt-1">Manage schools and their fields of study</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <X className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white border border-gray-100 rounded-2xl p-1 shadow-sm w-fit">
        {(['schools', 'specializations'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition capitalize ${
              activeTab === tab
                ? 'bg-[#0A1628] text-white'
                : 'text-gray-500 hover:text-[#0A1628]'
            }`}
          >
            {tab === 'schools' ? (
              <span className="flex items-center gap-2"><GraduationCap className="w-4 h-4" />Schools</span>
            ) : (
              <span className="flex items-center gap-2"><Layers className="w-4 h-4" />Specializations</span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB 1: Schools ───────────────────────────────────────────────────── */}
      {activeTab === 'schools' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#0A1628]" />
              <span className="font-bold text-[#0A1628]">Schools</span>
              <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">
                {schools.length}
              </span>
            </div>
            <button
              onClick={openAddSchool}
              className="flex items-center gap-1.5 bg-[#0A1628] text-white font-bold px-4 py-2 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition text-sm"
            >
              <Plus className="w-4 h-4" />
              Add School
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
              Loading schools…
            </div>
          ) : groupedSchools.every(g => g.schools.length === 0) ? (
            <div className="text-center py-16 px-6">
              <div className="text-4xl mb-3">🎓</div>
              <p className="text-gray-500 text-sm">No schools yet. Click &quot;Add School&quot; to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {groupedSchools.filter(g => g.schools.length > 0).map(({ institute, schools: instSchools }) => (
                <div key={institute.id}>
                  {/* Institute accordion header */}
                  <button
                    onClick={() => setExpandedInstitutes(prev => {
                      const next = new Set(prev);
                      next.has(institute.id) ? next.delete(institute.id) : next.add(institute.id);
                      return next;
                    })}
                    className="w-full flex items-center gap-3 px-6 py-3 bg-gray-50 hover:bg-gray-100 transition text-left"
                  >
                    {expandedInstitutes.has(institute.id)
                      ? <ChevronDown className="w-4 h-4 text-gray-400" />
                      : <ChevronRight className="w-4 h-4 text-gray-400" />
                    }
                    <span className="font-bold text-[#0A1628] text-sm">{institute.code_en}</span>
                    <span className="text-gray-500 text-sm">—</span>
                    <span className="text-gray-600 text-sm">{institute.name_en}</span>
                    <span className="ml-auto bg-[#0A1628]/10 text-[#0A1628] text-xs font-semibold px-2 py-0.5 rounded-full">
                      {instSchools.length} school{instSchools.length !== 1 ? 's' : ''}
                    </span>
                  </button>

                  {/* Schools list */}
                  {expandedInstitutes.has(institute.id) && (
                    <div className="divide-y divide-gray-50">
                      {instSchools.map(school => {
                        const schoolFields = fields.filter(f => f.school_id === school.id && !f.parent_field_id);
                        const isManaging = managingFieldsForSchool === school.id;
                        return (
                          <div key={school.id}>
                            {/* School row */}
                            <div className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition">
                              {/* Icon */}
                              <span className="text-xl w-9 h-9 flex items-center justify-center bg-amber-50 rounded-lg flex-shrink-0">
                                {school.icon || '📚'}
                              </span>

                              {/* Names */}
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-[#0A1628] text-sm truncate">{school.name_en}</div>
                                <div className="text-gray-400 text-xs truncate">{school.name_fr}</div>
                              </div>

                              {/* Fields count */}
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                                {schoolFields.length} field{schoolFields.length !== 1 ? 's' : ''}
                              </span>

                              {/* Active toggle */}
                              <Toggle checked={school.is_active} onChange={() => toggleSchoolActive(school)} />

                              {/* Actions */}
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                  onClick={() => setManagingFieldsForSchool(isManaging ? null : school.id)}
                                  className={`border font-bold px-3 py-1.5 rounded-xl text-xs transition ${
                                    isManaging
                                      ? 'border-[#C9A84C] text-[#C9A84C] bg-amber-50'
                                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                  }`}
                                >
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    Fields ({schoolFields.length})
                                  </span>
                                </button>
                                <button
                                  onClick={() => openEditSchool(school)}
                                  className="border border-gray-200 text-gray-600 font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-gray-50 transition"
                                >
                                  Edit
                                </button>
                                {deleteSchoolId === school.id ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => deleteSchool(school.id)}
                                      className="bg-red-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-red-700 transition"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => setDeleteSchoolId(null)}
                                      className="border border-gray-200 text-gray-500 px-2 py-1.5 rounded-xl text-xs hover:bg-gray-50 transition"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteSchoolId(school.id)}
                                    className="bg-red-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-red-700 transition"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Inline Fields Manager */}
                            {isManaging && (
                              <div className="mx-6 mb-4 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-white">
                                  <BookOpen className="w-4 h-4 text-[#0A1628]" />
                                  <span className="font-semibold text-[#0A1628] text-sm">
                                    Fields for {school.name_en}
                                  </span>
                                  <button
                                    onClick={() => setManagingFieldsForSchool(null)}
                                    className="ml-auto text-gray-400 hover:text-gray-600"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Existing fields */}
                                {schoolFields.length === 0 ? (
                                  <p className="text-gray-400 text-sm text-center py-6">No fields yet</p>
                                ) : (
                                  <ul className="divide-y divide-gray-200">
                                    {schoolFields.map(field => (
                                      <li key={field.id} className="flex items-center gap-3 px-4 py-2.5">
                                        <div className="flex-1 min-w-0">
                                          <span className="text-sm text-[#0A1628] font-medium">{field.name_en}</span>
                                          {field.name_fr && field.name_fr !== field.name_en && (
                                            <span className="text-gray-400 text-xs ml-2">/ {field.name_fr}</span>
                                          )}
                                        </div>
                                        <Toggle checked={field.is_active} onChange={() => toggleFieldActive(field)} />
                                        {deleteFieldId === field.id ? (
                                          <div className="flex items-center gap-1">
                                            <button
                                              onClick={() => deleteField(field.id)}
                                              className="bg-red-600 text-white font-bold px-2.5 py-1 rounded-lg text-xs hover:bg-red-700 transition"
                                            >
                                              Confirm
                                            </button>
                                            <button
                                              onClick={() => setDeleteFieldId(null)}
                                              className="border border-gray-200 px-1.5 py-1 rounded-lg text-xs text-gray-500 hover:bg-gray-100 transition"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => setDeleteFieldId(field.id)}
                                            className="bg-red-600 text-white font-bold px-2.5 py-1 rounded-lg text-xs hover:bg-red-700 transition"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                )}

                                {/* Quick-add field */}
                                <div className="px-4 py-3 border-t border-gray-200 bg-white">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Add Field
                                  </p>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={newFieldEN}
                                      onChange={e => setNewFieldEN(e.target.value)}
                                      placeholder="Name EN"
                                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#C9A84C] outline-none flex-1"
                                      onKeyDown={e => e.key === 'Enter' && addField(school.id)}
                                    />
                                    <input
                                      type="text"
                                      value={newFieldFR}
                                      onChange={e => setNewFieldFR(e.target.value)}
                                      placeholder="Name FR"
                                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#C9A84C] outline-none flex-1"
                                      onKeyDown={e => e.key === 'Enter' && addField(school.id)}
                                    />
                                    <button
                                      onClick={() => addField(school.id)}
                                      disabled={addingField || !newFieldEN.trim()}
                                      className="flex items-center gap-1.5 bg-[#0A1628] text-white font-bold px-3 py-2 rounded-xl text-sm hover:bg-[#C9A84C] hover:text-[#0A1628] transition disabled:opacity-50"
                                    >
                                      <Check className="w-4 h-4" />
                                      Add
                                    </button>
                                  </div>
                                </div>

                                {/* Bulk add */}
                                <div className="px-4 py-3 border-t border-gray-200">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Bulk Add
                                    <span className="normal-case font-normal ml-1 text-gray-400">
                                      (one per line: &quot;EN name: FR name&quot; or just &quot;EN name&quot;)
                                    </span>
                                  </p>
                                  <textarea
                                    rows={3}
                                    value={bulkFieldsText}
                                    onChange={e => setBulkFieldsText(e.target.value)}
                                    placeholder={"Software Engineering: Génie Logiciel\nCivil Engineering\nElectrical Engineering: Génie Électrique"}
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#C9A84C] outline-none w-full resize-none mb-2"
                                  />
                                  <button
                                    onClick={() => addBulkFields(school.id)}
                                    disabled={!bulkFieldsText.trim()}
                                    className="flex items-center gap-1.5 bg-[#0A1628] text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#C9A84C] hover:text-[#0A1628] transition disabled:opacity-50"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Add All
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: Specializations ────────────────────────────────────────────── */}
      {activeTab === 'specializations' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
            <Layers className="w-5 h-5 text-[#0A1628]" />
            <span className="font-bold text-[#0A1628]">Specializations</span>
          </div>

          {!hasParentFieldId ? (
            <div className="text-center py-16 px-6">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-gray-600 text-sm font-medium">Specializations require <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">parent_field_id</code> column in <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">cms_fields</code></p>
              <p className="text-gray-400 text-xs mt-2">Add the column and run a migration, then refresh this page.</p>
            </div>
          ) : rootFields.length === 0 ? (
            <div className="text-center py-16 px-6">
              <p className="text-gray-500 text-sm">No fields found. Add fields in the Schools tab first.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {rootFields.map(field => {
                const specs = fields.filter(f => f.parent_field_id === field.id);
                const isExpanded = expandedFields.has(field.id);
                const school = schools.find(s => s.id === field.school_id);
                return (
                  <div key={field.id}>
                    <button
                      onClick={() => {
                        setExpandedFields(prev => {
                          const next = new Set(prev);
                          next.has(field.id) ? next.delete(field.id) : next.add(field.id);
                          return next;
                        });
                        setSelectedFieldForSpec(field.id);
                      }}
                      className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition text-left"
                    >
                      {isExpanded
                        ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-[#0A1628] text-sm">{field.name_en}</span>
                        {school && <span className="text-gray-400 text-xs ml-2">({school.name_en})</span>}
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {specs.length} spec{specs.length !== 1 ? 's' : ''}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="mx-6 mb-4 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                        {specs.length === 0 ? (
                          <p className="text-gray-400 text-sm text-center py-4">No specializations yet</p>
                        ) : (
                          <ul className="divide-y divide-gray-200">
                            {specs.map(spec => (
                              <li key={spec.id} className="flex items-center gap-3 px-4 py-2.5">
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm text-[#0A1628]">{spec.name_en}</span>
                                  {spec.name_fr && spec.name_fr !== spec.name_en && (
                                    <span className="text-gray-400 text-xs ml-2">/ {spec.name_fr}</span>
                                  )}
                                </div>
                                <Toggle checked={spec.is_active} onChange={() => toggleFieldActive(spec)} />
                                <button
                                  onClick={() => deleteField(spec.id)}
                                  className="bg-red-600 text-white font-bold px-2.5 py-1 rounded-lg text-xs hover:bg-red-700 transition"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Add specialization */}
                        {selectedFieldForSpec === field.id && (
                          <div className="px-4 py-3 border-t border-gray-200 bg-white">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                              Add Specialization
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newSpecEN}
                                onChange={e => setNewSpecEN(e.target.value)}
                                placeholder="Name EN"
                                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#C9A84C] outline-none flex-1"
                              />
                              <input
                                type="text"
                                value={newSpecFR}
                                onChange={e => setNewSpecFR(e.target.value)}
                                placeholder="Name FR"
                                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#C9A84C] outline-none flex-1"
                              />
                              <button
                                onClick={() => addSpec(field.id)}
                                disabled={!newSpecEN.trim()}
                                className="flex items-center gap-1.5 bg-[#0A1628] text-white font-bold px-3 py-2 rounded-xl text-sm hover:bg-[#C9A84C] hover:text-[#0A1628] transition disabled:opacity-50"
                              >
                                <Plus className="w-4 h-4" />
                                Add
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── School Modal ──────────────────────────────────────────────────────── */}
      {showSchoolModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-[#0A1628] text-lg">
                {editingSchool ? 'Edit School' : 'Add School'}
              </h3>
              <button onClick={() => setShowSchoolModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 overflow-y-auto space-y-5 flex-1">
              {/* Institute */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Parent Institute
                </label>
                <select
                  value={schoolForm.institute_id}
                  onChange={e => setSchoolField('institute_id', e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full"
                >
                  <option value="">Select institute…</option>
                  {institutes.map(inst => (
                    <option key={inst.id} value={inst.id}>
                      {inst.code_en} — {inst.name_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Name EN
                  </label>
                  <input
                    type="text"
                    value={schoolForm.name_en}
                    onChange={e => setSchoolField('name_en', e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Name FR
                  </label>
                  <input
                    type="text"
                    value={schoolForm.name_fr}
                    onChange={e => setSchoolField('name_fr', e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Description EN
                  </label>
                  <textarea
                    rows={3}
                    value={schoolForm.description_en}
                    onChange={e => setSchoolField('description_en', e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Description FR
                  </label>
                  <textarea
                    rows={3}
                    value={schoolForm.description_fr}
                    onChange={e => setSchoolField('description_fr', e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full resize-none"
                  />
                </div>
              </div>

              {/* Icon */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Icon
                </label>
                <input
                  type="text"
                  value={schoolForm.icon}
                  onChange={e => setSchoolField('icon', e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full mb-2"
                  placeholder="Paste an emoji or select below"
                />
                <div className="flex flex-wrap gap-2">
                  {SCHOOL_ICONS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSchoolField('icon', emoji)}
                      className={`w-10 h-10 text-xl flex items-center justify-center rounded-xl border-2 transition ${
                        schoolForm.icon === emoji
                          ? 'border-[#C9A84C] bg-amber-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quotes */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Quote EN
                  </label>
                  <textarea
                    rows={2}
                    value={schoolForm.quote_en}
                    onChange={e => setSchoolField('quote_en', e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Quote FR
                  </label>
                  <textarea
                    rows={2}
                    value={schoolForm.quote_fr}
                    onChange={e => setSchoolField('quote_fr', e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full resize-none"
                  />
                </div>
              </div>

              {/* Display Order + Active */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={schoolForm.display_order}
                    onChange={e => setSchoolField('display_order', parseInt(e.target.value) || 0)}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full"
                  />
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 self-end">
                  <span className="text-sm font-medium text-gray-700">Is Active</span>
                  <Toggle checked={schoolForm.is_active} onChange={v => setSchoolField('is_active', v)} />
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={saveSchool}
                disabled={savingSchool}
                className="flex items-center gap-2 bg-[#0A1628] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition disabled:opacity-50"
              >
                {savingSchool ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving…
                  </span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save School
                  </>
                )}
              </button>
              <button
                onClick={() => setShowSchoolModal(false)}
                className="border border-gray-200 text-gray-600 font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
