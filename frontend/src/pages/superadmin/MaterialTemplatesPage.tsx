import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@api/client';
import { Layers, ChevronDown, ChevronRight, Plus, Edit2, Sparkles, Package, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface TemplateMaterial {
  name: string; unit: string; defaultQty: number;
  estimatedCost: number; wastagePercent: number; notes?: string;
}
interface TemplateGroup { name: string; materials: TemplateMaterial[]; }
interface Template {
  id: string; categorySlug: string; categoryName: string;
  description?: string; estimatedLaborMinutes: number;
  estimatedOverheadPercent: number; groups: TemplateGroup[];
}

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function MaterialTemplatesPage() {
  const qc = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ['material-templates'],
    queryFn: () => apiClient.get('/material-templates').then(r => r.data.data),
  });

  const seedMutation = useMutation({
    mutationFn: () => apiClient.post('/material-templates/seed'),
    onSuccess: () => { toast.success('Default templates loaded'); qc.invalidateQueries({ queryKey: ['material-templates'] }); },
    onError: () => toast.error('Seed failed'),
  });

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const totalMaterials = (t: Template) => t.groups.reduce((s, g) => s + g.materials.length, 0);
  const estimatedBaseCost = (t: Template) =>
    t.groups.reduce((s, g) =>
      s + g.materials.reduce((ms, m) =>
        ms + m.defaultQty * m.estimatedCost * (1 + m.wastagePercent / 100), 0), 0);

  if (isLoading) return (
    <div className="flex items-center justify-center py-20 text-gray-400 text-sm font-sans">
      Loading templates…
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 font-sans">Material Templates</h1>
          <p className="text-sm text-gray-500 font-sans mt-0.5">
            Category-based smart material presets — auto-loaded when creating a product
          </p>
        </div>
        <button
          onClick={() => seedMutation.mutate()}
          disabled={seedMutation.isPending}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium font-sans rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <Zap size={14} />
          {seedMutation.isPending ? 'Loading…' : 'Load Defaults'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Templates', value: templates.length, icon: Layers },
          { label: 'Total Materials', value: templates.reduce((s, t) => s + totalMaterials(t), 0), icon: Package },
          { label: 'Avg Base Cost', value: templates.length ? fmt(templates.reduce((s, t) => s + estimatedBaseCost(t), 0) / templates.length) : '—', icon: Sparkles },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <stat.icon size={18} className="text-indigo-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 font-sans">{stat.value}</p>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider font-sans">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl py-16 text-center">
          <Layers size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-sans mb-4">No templates yet.</p>
          <button
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-sans rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Load Default Templates
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map(template => {
            const isOpen = expandedId === template.id;
            const baseCost = estimatedBaseCost(template);

            return (
              <div key={template.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {/* Template header */}
                <button
                  onClick={() => setExpandedId(isOpen ? null : template.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                    <Layers size={16} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 font-sans text-sm">{template.categoryName}</p>
                      <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-sans">
                        {totalMaterials(template)} materials
                      </span>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-sans">
                        {template.groups.length} groups
                      </span>
                    </div>
                    {template.description && (
                      <p className="text-xs text-gray-400 font-sans mt-0.5 truncate">{template.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-6 text-right mr-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 font-sans">{fmt(baseCost)}</p>
                      <p className="text-[10px] text-gray-400 font-sans">est. base cost</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 font-sans">{template.estimatedLaborMinutes} min</p>
                      <p className="text-[10px] text-gray-400 font-sans">labour time</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 font-sans">{template.estimatedOverheadPercent}%</p>
                      <p className="text-[10px] text-gray-400 font-sans">overhead</p>
                    </div>
                  </div>
                  <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.18 }}>
                    <ChevronRight size={16} className="text-gray-400" />
                  </motion.div>
                </button>

                {/* Template body */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="border-t border-gray-100 px-5 py-4 space-y-3">
                        {template.groups.map((group, gi) => {
                          const gKey = `${template.id}-${gi}`;
                          const gOpen = expandedGroups.has(gKey);
                          const groupCost = group.materials.reduce(
                            (s, m) => s + m.defaultQty * m.estimatedCost * (1 + m.wastagePercent / 100), 0
                          );

                          return (
                            <div key={gi} className="border border-gray-100 rounded-lg overflow-hidden">
                              <button
                                onClick={() => toggleGroup(gKey)}
                                className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                              >
                                <div className="flex items-center gap-2">
                                  {gOpen ? <ChevronDown size={13} className="text-gray-500" /> : <ChevronRight size={13} className="text-gray-500" />}
                                  <span className="text-xs font-semibold text-gray-700 font-sans uppercase tracking-wide">{group.name}</span>
                                  <span className="text-[10px] text-gray-400 font-sans">{group.materials.length} items</span>
                                </div>
                                <span className="text-xs font-semibold text-gray-600 font-sans">{fmt(groupCost)}</span>
                              </button>

                              {gOpen && (
                                <div className="divide-y divide-gray-50">
                                  {group.materials.map((mat, mi) => (
                                    <div key={mi} className="flex items-center px-4 py-2.5 hover:bg-gray-50 transition-colors">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-800 font-sans font-medium">{mat.name}</p>
                                        {mat.notes && <p className="text-[11px] text-gray-400 font-sans">{mat.notes}</p>}
                                      </div>
                                      <div className="flex items-center gap-6 text-xs font-sans text-right">
                                        <div className="text-gray-500">
                                          <span className="font-medium text-gray-700">{mat.defaultQty}</span> {mat.unit}
                                        </div>
                                        <div className="text-gray-500">
                                          <span className="font-medium text-gray-700">{fmt(mat.estimatedCost)}</span>/{mat.unit}
                                        </div>
                                        <div className="text-amber-600 font-medium w-12 text-right">
                                          {mat.wastagePercent}% waste
                                        </div>
                                        <div className="text-indigo-600 font-semibold w-16 text-right">
                                          {fmt(mat.defaultQty * mat.estimatedCost * (1 + mat.wastagePercent / 100))}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
