import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useNostrKeys, useNostrPublish, useSafeExport, type ScrubReport } from '../hooks/useNostr';
import { getSlotMeta } from '../slotMeta';
import type { SlotData } from '../types';

const TEMPLATES = [
  { id: 'homelab', label: 'Homelab', color: 'var(--rc-cyan)', desc: 'Self-hosted, privacy-first' },
  { id: 'ops', label: 'Ops', color: 'var(--rc-yellow)', desc: 'Lean productivity' },
  { id: 'researcher', label: 'Researcher', color: 'var(--rc-magenta)', desc: 'Deep analysis' },
  { id: 'smart-home', label: 'Smart Home', color: 'var(--rc-green)', desc: 'Automation-focused' },
  { id: 'creator', label: 'Creator', color: 'var(--rc-red)', desc: 'Content & social' },
];

type Step = 'identity' | 'configure' | 'review' | 'publishing' | 'done';

export function PublishDialog({ onClose }: { onClose: () => void }) {
  const [loadoutName, setLoadoutName] = useState('');
  const [template, setTemplate] = useState('ops');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [scrubReport, setScrubReport] = useState<ScrubReport | null>(null);
  const [scrubbedJson, setScrubbedJson] = useState<string>('');
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<{ event_id: string; relays_sent: number } | null>(null);
  const [nsecInput, setNsecInput] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [publishMode, setPublishMode] = useState<'loadout' | 'slot'>('loadout');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [slotValidationError, setSlotValidationError] = useState<string | null>(null);
  const [agentSlots, setAgentSlots] = useState<SlotData[]>([]);

  // Fetch actual slots from the agent
  useEffect(() => {
    invoke<SlotData[]>('get_slots', { agentId: null })
      .then(setAgentSlots)
      .catch(() => {});
  }, []);

  const { keys, generate, importKey, refresh } = useNostrKeys();
  const { publish, publishing } = useNostrPublish();
  const { exportSafe, exporting } = useSafeExport();

  // Start on identity step if no keys, otherwise skip to configure
  const [step, setStep] = useState<Step>(keys.has_keys ? 'configure' : 'identity');

  const tags = tagInput
    .split(/[,\s]+/)
    .map((t) => t.replace(/^#/, '').trim())
    .filter(Boolean);

  const handleReview = async () => {
    try {
      const [loadout, report] = await exportSafe(template, description, [...tags, template]);

      if (publishMode === 'slot') {
        if (!selectedSlot) {
          setSlotValidationError('Select a slot to publish');
          return;
        }
        // Extract the selected slot from the loadout
        const parsed = typeof loadout === 'string' ? JSON.parse(loadout) : loadout;
        const slots = parsed.slots || {};
        const slotData = slots[selectedSlot];
        if (!slotData) {
          setSlotValidationError(`Slot "${selectedSlot}" not found in your loadout`);
          return;
        }
        // Count items (sub_components or items array)
        const items = slotData.items || slotData.sub_components || [];
        if (items.length < 2) {
          setSlotValidationError(`This slot has ${items.length} item${items.length === 1 ? '' : 's'}. Minimum 2 required.`);
          return;
        }
        // Publish just the slot content
        const slotPublish = {
          meta: { ...parsed.meta, slot_type: selectedSlot },
          slot: slotData,
        };
        setScrubbedJson(JSON.stringify(slotPublish, null, 2));
      } else {
        setScrubbedJson(JSON.stringify(loadout, null, 2));
      }

      setScrubReport(report);
      setStep('review');
    } catch (err) {
      setPublishError(String(err));
    }
  };

  const handlePublish = async () => {
    if (!keys.has_keys) {
      await generate();
    }
    setStep('publishing');
    setPublishError(null);
    try {
      const result = await publish(
        scrubbedJson,
        loadoutName || (publishMode === 'slot' ? `${selectedSlot} slot` : 'My Loadout'),
        [...tags, template, ...(publishMode === 'slot' ? [selectedSlot] : [])],
        undefined,
        undefined,
        publishMode,
        publishMode === 'slot' ? selectedSlot : undefined,
      );
      setPublishResult(result);
      setStep('done');
    } catch (err) {
      setPublishError(String(err));
      setStep('review');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-[560px] max-h-[80vh] overflow-y-auto rounded-lg border p-6"
        style={{
          background: 'var(--rc-bg)',
          borderColor: 'var(--rc-cyan)',
          boxShadow: '0 0 30px var(--rc-cyan-dim)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--rc-text)' }}>
            {step === 'identity' && 'Your Identity'}
            {step === 'configure' && (publishMode === 'slot' ? 'Publish Slot' : 'Publish Loadout')}
            {step === 'review' && 'Review & Confirm'}
            {step === 'publishing' && 'Publishing...'}
            {step === 'done' && 'Published!'}
          </h2>
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 rounded border transition-all hover:opacity-80"
            style={{ borderColor: 'var(--rc-border)', color: 'var(--rc-text-muted)' }}
          >
            ✕
          </button>
        </div>

        {/* Step: Identity (first-time only) */}
        {step === 'identity' && (
          <div className="space-y-4">
            <div
              className="p-4 rounded border text-xs leading-relaxed"
              style={{
                borderColor: 'var(--rc-cyan)',
                background: 'var(--rc-overlay-accent)',
                color: 'var(--rc-text-dim)',
              }}
            >
              <p className="mb-3">
                Your loadout will be signed with a <strong style={{ color: 'var(--rc-text)' }}>Nostr keypair</strong> so others
                can verify it's yours. This is your publishing identity. It stays with your loadouts.
              </p>
              <p style={{ color: 'var(--rc-text-muted)' }}>
                You can update your identity anytime in <strong>Settings</strong>.
              </p>
            </div>

            {/* Generated key preview */}
            {keys.has_keys ? (
              <div
                className="p-3 rounded border text-xs font-mono"
                style={{
                  borderColor: 'var(--rc-green)',
                  background: 'rgba(0,255,100,0.03)',
                  color: 'var(--rc-green)',
                }}
              >
                ✓ {keys.npub_short}
              </div>
            ) : (
              <div
                className="p-3 rounded border text-xs"
                style={{
                  borderColor: 'var(--rc-border)',
                  background: 'var(--rc-overlay-subtle)',
                  color: 'var(--rc-text-muted)',
                }}
              >
                A fresh identity will be created for you. Or import an existing one below.
              </div>
            )}

            {/* Import existing key */}
            <div>
              <label className="text-[10px] uppercase tracking-wider block mb-2" style={{ color: 'var(--rc-text-muted)' }}>
                Already on Nostr? Import your key
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={nsecInput}
                  onChange={(e) => { setNsecInput(e.target.value); setImportError(null); }}
                  placeholder="nsec1..."
                  className="flex-1 px-3 py-2 rounded text-xs border outline-none font-mono"
                  style={{
                    background: 'var(--rc-overlay-subtle)',
                    borderColor: 'var(--rc-border)',
                    color: 'var(--rc-text)',
                  }}
                />
                <button
                  onClick={async () => {
                    try {
                      await importKey(nsecInput.trim());
                      setNsecInput('');
                      setImportError(null);
                    } catch {
                      setImportError('Invalid nsec key');
                    }
                  }}
                  disabled={!nsecInput.trim()}
                  className="px-4 py-2 rounded text-xs font-semibold border transition-all hover:opacity-80 disabled:opacity-40"
                  style={{ borderColor: 'var(--rc-cyan)', color: 'var(--rc-cyan)' }}
                >
                  Import
                </button>
              </div>
              {importError && (
                <div className="text-[10px] mt-1" style={{ color: 'var(--rc-red)' }}>{importError}</div>
              )}
            </div>

            {/* Or stay anon */}
            <div className="text-[10px] text-center" style={{ color: 'var(--rc-text-muted)' }}>
              No Nostr account? No problem. Publish anonymously with a generated key.
              <br />Add a display name, avatar, and NIP-05 verification later in Settings.
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded text-xs font-semibold uppercase tracking-wider border transition-all hover:opacity-80"
                style={{ borderColor: 'var(--rc-border)', color: 'var(--rc-text-dim)' }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!keys.has_keys) {
                    await generate();
                    await refresh();
                  }
                  setStep('configure');
                }}
                className="flex-1 py-2.5 rounded text-xs font-semibold uppercase tracking-wider border transition-all hover:opacity-80"
                style={{
                  borderColor: 'var(--rc-cyan)',
                  color: 'var(--rc-bg)',
                  background: 'var(--rc-cyan)',
                }}
              >
                {keys.has_keys ? 'Continue →' : 'Generate & Continue →'}
              </button>
            </div>
          </div>
        )}

        {/* Step: Configure */}
        {step === 'configure' && (
          <div className="space-y-4">
            {/* PII warning */}
            <div
              className="p-3 rounded border text-xs"
              style={{
                borderColor: 'var(--rc-magenta)',
                background: 'rgba(255,0,170,0.05)',
                color: 'var(--rc-text-dim)',
              }}
            >
              <span style={{ color: 'var(--rc-magenta)' }}>⚠ Privacy:</span> Your loadout will be scrubbed of phone numbers, emails, IP addresses, API keys, file paths, and other PII before publishing. You'll review the scrubbed version before it goes live.
            </div>

            {/* Publish mode toggle */}
            <div>
              <label className="text-[10px] uppercase tracking-wider block mb-2" style={{ color: 'var(--rc-text-muted)' }}>
                What to publish
              </label>
              <div className="flex gap-2">
                {(['loadout', 'slot'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => { setPublishMode(mode); setSlotValidationError(null); }}
                    className="flex-1 py-2 rounded border text-xs font-semibold transition-all"
                    style={{
                      borderColor: publishMode === mode ? 'var(--rc-cyan)' : 'var(--rc-border)',
                      background: publishMode === mode ? 'rgba(0,240,255,0.1)' : 'transparent',
                      color: publishMode === mode ? 'var(--rc-cyan)' : 'var(--rc-text-dim)',
                    }}
                  >
                    {mode === 'loadout' ? '📦 Full Loadout' : '🧩 Single Slot'}
                  </button>
                ))}
              </div>
            </div>

            {/* Slot picker (only when publishing a slot) */}
            {publishMode === 'slot' && (
              <div>
                <label className="text-[10px] uppercase tracking-wider block mb-2" style={{ color: 'var(--rc-text-muted)' }}>
                  Select Slot
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {agentSlots.map((s) => {
                    const meta = getSlotMeta(s.id);
                    const itemCount = s.subComponents?.length || 0;
                    return (
                      <button
                        key={s.id}
                        onClick={() => { setSelectedSlot(s.id); setSlotValidationError(null); }}
                        className="p-2 rounded border text-center transition-all"
                        style={{
                          borderColor: selectedSlot === s.id ? meta.color : 'var(--rc-border)',
                          background: selectedSlot === s.id ? `${meta.color}1a` : 'transparent',
                          opacity: itemCount < 2 ? 0.4 : 1,
                        }}
                        disabled={itemCount < 2}
                        title={itemCount < 2 ? `${itemCount} item${itemCount === 1 ? '' : 's'} (min 2)` : `${itemCount} items`}
                      >
                        <div className="text-base">{meta.emoji}</div>
                        <div className="text-[10px] mt-0.5" style={{ color: selectedSlot === s.id ? meta.color : 'var(--rc-text-dim)' }}>
                          {meta.label}
                        </div>
                        <div className="text-[9px]" style={{ color: 'var(--rc-text-muted)' }}>
                          {itemCount} item{itemCount !== 1 ? 's' : ''}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {slotValidationError && (
                  <div className="text-[10px] mt-1 px-1" style={{ color: 'var(--rc-red)' }}>{slotValidationError}</div>
                )}
                <div className="text-[10px] mt-1 px-1" style={{ color: 'var(--rc-text-muted)' }}>
                  Minimum 2 items required per slot
                </div>
              </div>
            )}

            {/* Loadout name */}
            <div>
              <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--rc-text-muted)' }}>
                {publishMode === 'slot' ? 'Slot Name' : 'Loadout Name'}
              </label>
              <input
                type="text"
                value={loadoutName}
                onChange={(e) => setLoadoutName(e.target.value)}
                placeholder="e.g. Nighthawk, Mercury, Athena..."
                className="w-full px-3 py-2 rounded text-xs border outline-none"
                style={{
                  background: 'var(--rc-overlay-subtle)',
                  borderColor: 'var(--rc-border)',
                  color: 'var(--rc-text)',
                }}
              />
            </div>

            {/* Template */}
            <div>
              <label className="text-[10px] uppercase tracking-wider block mb-2" style={{ color: 'var(--rc-text-muted)' }}>
                Template
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className="p-2 rounded border text-left transition-all"
                    style={{
                      borderColor: template === t.id ? t.color : 'var(--rc-border)',
                      background: template === t.id ? `${t.color}1a` : 'transparent',
                    }}
                  >
                    <div className="text-xs font-semibold" style={{ color: template === t.id ? t.color : 'var(--rc-text-dim)' }}>
                      {t.label}
                    </div>
                    <div className="text-[10px]" style={{ color: 'var(--rc-text-muted)' }}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--rc-text-muted)' }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What makes your loadout unique?"
                rows={3}
                className="w-full px-3 py-2 rounded text-xs border outline-none resize-none"
                style={{
                  background: 'var(--rc-overlay-subtle)',
                  borderColor: 'var(--rc-border)',
                  color: 'var(--rc-text)',
                }}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--rc-text-muted)' }}>
                Tags (comma or space separated)
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="privacy, local-first, voice"
                className="w-full px-3 py-2 rounded text-xs border outline-none"
                style={{
                  background: 'var(--rc-overlay-subtle)',
                  borderColor: 'var(--rc-border)',
                  color: 'var(--rc-text)',
                }}
              />
              {tags.length > 0 && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="text-[9px] px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--rc-overlay-active)', color: 'var(--rc-cyan)' }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {publishError && (
              <div className="text-xs p-2 rounded" style={{ color: 'var(--rc-red)', background: 'rgba(255,50,50,0.05)' }}>
                {publishError}
              </div>
            )}

            <button
              onClick={handleReview}
              disabled={exporting || !loadoutName.trim() || (publishMode === 'slot' && !selectedSlot)}
              className="w-full py-2.5 rounded text-xs font-semibold uppercase tracking-wider border transition-all hover:opacity-80 disabled:opacity-40"
              style={{
                borderColor: 'var(--rc-cyan)',
                color: 'var(--rc-cyan)',
                background: 'var(--rc-overlay-active)',
              }}
            >
              {exporting ? 'Scrubbing PII...' : 'Review Before Publishing'}
            </button>
          </div>
        )}

        {/* Step: Review */}
        {step === 'review' && scrubReport && (
          <div className="space-y-4">
            {/* Scrub report */}
            <div
              className="p-3 rounded border text-xs"
              style={{
                borderColor: 'var(--rc-green)',
                background: 'rgba(0,255,100,0.03)',
              }}
            >
              <div className="font-semibold mb-1" style={{ color: 'var(--rc-green)' }}>
                PII Scrub Complete: {scrubReport.scrubbed_fields.length} fields cleaned
              </div>
              {scrubReport.scrubbed_fields.length > 0 && (
                <ul className="space-y-0.5 mt-2" style={{ color: 'var(--rc-text-muted)' }}>
                  {scrubReport.scrubbed_fields.slice(0, 10).map((f) => (
                    <li key={f} className="font-mono text-[10px]">✓ {f}</li>
                  ))}
                  {scrubReport.scrubbed_fields.length > 10 && (
                    <li className="text-[10px]">...and {scrubReport.scrubbed_fields.length - 10} more</li>
                  )}
                </ul>
              )}
            </div>

            {/* Warnings */}
            {scrubReport.warnings.length > 0 && (
              <div
                className="p-3 rounded border text-xs"
                style={{
                  borderColor: 'var(--rc-red)',
                  background: 'rgba(255,50,50,0.05)',
                  color: 'var(--rc-red)',
                }}
              >
                <div className="font-semibold mb-1">⚠ Warnings</div>
                {scrubReport.warnings.map((w, i) => (
                  <div key={i} className="text-[10px] mt-1">{w}</div>
                ))}
              </div>
            )}

            {/* Preview */}
            <div>
              <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--rc-text-muted)' }}>
                Scrubbed Loadout Preview
              </label>
              <pre
                className="p-3 rounded border text-[10px] font-mono overflow-auto max-h-60"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  borderColor: 'var(--rc-border)',
                  color: 'var(--rc-text-dim)',
                }}
              >
                {scrubbedJson}
              </pre>
            </div>

            {publishError && (
              <div className="text-xs p-2 rounded" style={{ color: 'var(--rc-red)', background: 'rgba(255,50,50,0.05)' }}>
                {publishError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('configure')}
                className="flex-1 py-2 rounded text-xs font-semibold uppercase tracking-wider border transition-all hover:opacity-80"
                style={{ borderColor: 'var(--rc-border)', color: 'var(--rc-text-dim)' }}
              >
                Back
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex-1 py-2 rounded text-xs font-semibold uppercase tracking-wider border transition-all hover:opacity-80"
                style={{
                  borderColor: 'var(--rc-cyan)',
                  color: 'var(--rc-bg)',
                  background: 'var(--rc-cyan)',
                }}
              >
                {publishing ? 'Signing & Publishing...' : 'Publish to Nostr'}
              </button>
            </div>
          </div>
        )}

        {/* Step: Publishing */}
        {step === 'publishing' && (
          <div className="text-center py-8">
            <div className="text-2xl mb-3 animate-pulse" style={{ color: 'var(--rc-cyan)' }}>⬡</div>
            <div className="text-xs" style={{ color: 'var(--rc-text-muted)' }}>
              Signing event and broadcasting to relays...
            </div>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && publishResult && (
          <div className="text-center py-6 space-y-4">
            <div className="text-3xl" style={{ color: 'var(--rc-green)' }}>✓</div>
            <div className="text-sm font-bold" style={{ color: 'var(--rc-text)' }}>
              Loadout Published
            </div>
            <div className="text-[10px] font-mono p-2 rounded" style={{
              background: 'var(--rc-overlay-subtle)',
              color: 'var(--rc-text-muted)',
            }}>
              Event: {publishResult.event_id.slice(0, 16)}...
            </div>
            <div className="text-xs" style={{ color: 'var(--rc-text-dim)' }}>
              Sent to {publishResult.relays_sent} relay{publishResult.relays_sent !== 1 ? 's' : ''}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded text-xs font-semibold uppercase tracking-wider border transition-all hover:opacity-80"
              style={{
                borderColor: 'var(--rc-cyan)',
                color: 'var(--rc-cyan)',
                background: 'var(--rc-overlay-active)',
              }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
