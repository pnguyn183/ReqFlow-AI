import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  ClipboardCheck,
  Clock3,
  Database,
  Download,
  FileCode2,
  FileDown,
  FileText,
  GitBranch,
  History,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Network,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  UserRound,
  Users,
  WandSparkles,
  X,
  XCircle
} from "lucide-react";
import { api, ApiError, downloadDocument, session, SessionUser } from "./lib/api";

type ViewKey = "overview" | "requirements" | "analysis" | "backlog" | "documents" | "models" | "traceability" | "changes" | "assistant" | "admin";

type Requirement = {
  id: number;
  code: string;
  title: string;
  description: string;
  requirement_type: string;
  category: string;
  priority: string;
  status: string;
  owner: string;
  project: string;
  business_value: number;
  complexity: number;
  rice_score: number;
  version: number;
  updated_at: string;
};

type ToastState = { message: string; tone: "success" | "danger" } | null;

const NAVIGATION: { key: ViewKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "requirements", label: "Requirements", icon: Database },
  { key: "analysis", label: "Analysis studio", icon: Sparkles },
  { key: "backlog", label: "Backlog", icon: ListChecks },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "models", label: "Process models", icon: GitBranch },
  { key: "traceability", label: "Traceability", icon: Network },
  { key: "changes", label: "Change control", icon: History },
  { key: "assistant", label: "AI assistant", icon: Bot },
  { key: "admin", label: "Administration", icon: ShieldCheck }
];

const VIEW_TITLES: Record<ViewKey, string> = {
  overview: "Workspace overview",
  requirements: "Requirement repository",
  analysis: "Analysis studio",
  backlog: "Product backlog",
  documents: "Documentation center",
  models: "Process modeling",
  traceability: "Traceability matrix",
  changes: "Change management",
  assistant: "AI assistant",
  admin: "Administration"
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function humanize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (match: string) => match.toUpperCase());
}

function StatusPill({ value }: { value: string }) {
  return <span className={`pill pill-${value.toLowerCase().replace(/ /g, "-")}`}>{value}</span>;
}

function EmptyState({ icon: Icon, title }: { icon: typeof FileText; title: string }) {
  return (
    <div className="empty-state">
      <Icon size={28} />
      <strong>{title}</strong>
    </div>
  );
}

function PageHeader({ title, eyebrow, actions }: { title: string; eyebrow: string; actions?: ReactNode }) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

function Login({ onAuthenticated }: { onAuthenticated: (user: SessionUser) => void }) {
  const [username, setUsername] = useState("analyst");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await api<{ access_token: string; user: SessionUser }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });
      session.setToken(result.access_token);
      onAuthenticated(result.user);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-screen">
      <section className="login-brand">
        <div className="brand-mark"><FileCode2 size={24} /></div>
        <div>
          <span className="brand-name">ReqFlow AI</span>
          <span className="brand-subtitle">Requirement Intelligence</span>
        </div>
      </section>
      <form className="login-form" onSubmit={submit}>
        <div className="login-heading">
          <span className="eyebrow">Secure workspace</span>
          <h1>Sign in</h1>
        </div>
        <label>
          Username
          <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
        </label>
        {error && <div className="form-error"><AlertTriangle size={16} />{error}</div>}
        <button className="button primary wide" disabled={loading}>
          {loading ? <RefreshCw className="spin" size={17} /> : <ArrowRight size={17} />}
          Continue
        </button>
        <div className="demo-accounts">
          <button type="button" onClick={() => { setUsername("analyst"); setPassword("demo123"); }}>Analyst</button>
          <button type="button" onClick={() => { setUsername("owner"); setPassword("demo123"); }}>Product owner</button>
          <button type="button" onClick={() => { setUsername("admin"); setPassword("admin123"); }}>Admin</button>
        </div>
      </form>
      <footer className="login-footer">Version 1.0 · Hoang Phuc Nguyen · IT Business Analyst</footer>
    </main>
  );
}

function OverviewView() {
  const [data, setData] = useState<any>(null);

  useEffect(() => { api<any>("/dashboard/summary").then(setData); }, []);
  if (!data) return <Loading />;
  const cards = [
    { label: "Requirements", value: data.cards.requirements, detail: `${data.cards.approved} approved`, icon: Database, tone: "ink" },
    { label: "User stories", value: data.cards.user_stories, detail: "Ready for delivery", icon: ListChecks, tone: "green" },
    { label: "Trace coverage", value: `${data.cards.traceability}%`, detail: "Goal 95%", icon: Network, tone: "cyan" },
    { label: "Quality score", value: data.cards.quality_score, detail: "AI assessment", icon: Sparkles, tone: "amber" },
    { label: "Pending changes", value: data.cards.pending_changes, detail: "Awaiting decision", icon: History, tone: "red" }
  ];

  return (
    <>
      <PageHeader title="Workspace overview" eyebrow="ReqFlow AI / Product workspace" />
      <section className="metric-grid">
        {cards.map(({ label, value, detail, icon: Icon, tone }) => (
          <article className="metric-card" key={label}>
            <div className={`metric-icon ${tone}`}><Icon size={19} /></div>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{detail}</small>
          </article>
        ))}
      </section>
      <section className="overview-grid">
        <div className="content-panel distribution-panel">
          <div className="panel-title"><div><span className="eyebrow">Portfolio</span><h2>Requirement status</h2></div><BarChart3 size={19} /></div>
          <div className="distribution-list">
            {Object.entries(data.status_counts as Record<string, number>).map(([status, count]) => {
              const width = Math.max(10, (count / data.cards.requirements) * 100);
              return <div className="distribution-row" key={status}><span>{status}</span><div className="bar-track"><i style={{ width: `${width}%` }} /></div><strong>{count}</strong></div>;
            })}
          </div>
          <div className="priority-strip">
            {Object.entries(data.priority_counts as Record<string, number>).map(([priority, count]) => <div key={priority}><span>{priority}</span><strong>{count}</strong></div>)}
          </div>
        </div>
        <div className="content-panel activity-panel">
          <div className="panel-title"><div><span className="eyebrow">Audit</span><h2>Recent activity</h2></div><Activity size={19} /></div>
          <div className="activity-list">
            {data.activity.length ? data.activity.map((item: any, index: number) => (
              <div className="activity-item" key={`${item.created_at}-${index}`}><div className="activity-dot" /><div><strong>{item.actor}</strong><span>{humanize(item.action)} · {item.entity}</span></div><time>{formatDate(item.created_at)}</time></div>
            )) : <EmptyState icon={Activity} title="No activity yet" />}
          </div>
        </div>
      </section>
      <section className="content-panel recent-panel">
        <div className="panel-title"><div><span className="eyebrow">Repository</span><h2>Recently updated</h2></div><Database size={19} /></div>
        <RequirementTable requirements={data.recent_requirements} compact />
      </section>
    </>
  );
}

function RequirementTable({ requirements, compact = false, onSelect }: { requirements: Requirement[]; compact?: boolean; onSelect?: (requirement: Requirement) => void }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>Requirement</th><th>Category</th><th>Priority</th><th>Status</th>{!compact && <><th>Owner</th><th>Version</th></>}</tr></thead>
        <tbody>
          {requirements.map((requirement) => (
            <tr key={requirement.id} onClick={() => onSelect?.(requirement)} className={onSelect ? "clickable" : ""}>
              <td><code>{requirement.code}</code></td>
              <td><strong>{requirement.title}</strong><small>{requirement.description}</small></td>
              <td>{requirement.category}</td>
              <td><StatusPill value={requirement.priority} /></td>
              <td><StatusPill value={requirement.status} /></td>
              {!compact && <><td>{requirement.owner}</td><td>v{requirement.version}.0</td></>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RequirementsView({ notify }: { notify: (message: string, tone?: "success" | "danger") => void }) {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Requirement | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    api<Requirement[]>(`/requirements?${params}`).then(setRequirements);
  }, [search, status, revision]);

  return (
    <>
      <PageHeader title="Requirement repository" eyebrow={`${requirements.length} active records`} actions={<><label className="file-button"><Upload size={16} />Import CSV<input type="file" accept=".csv" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; const body = new FormData(); body.append("file", file); try { const result = await api<{ created: number }>("/requirements/import", { method: "POST", body }); notify(`${result.created} requirements imported`); setRevision((value) => value + 1); } catch (error) { notify(error instanceof Error ? error.message : "Import failed", "danger"); } }} /></label><button className="button primary" onClick={() => setShowCreate(true)}><Plus size={16} />New requirement</button></>} />
      <div className="toolbar">
        <div className="search-field"><Search size={17} /><input placeholder="Search ID, title, description" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option>Draft</option><option>In Review</option><option>Approved</option></select>
        <button className="icon-button" title="Refresh" onClick={() => setRevision((value) => value + 1)}><RefreshCw size={17} /></button>
      </div>
      <section className="content-panel repository-panel">
        {requirements.length ? <RequirementTable requirements={requirements} onSelect={setSelected} /> : <EmptyState icon={Database} title="No matching requirements" />}
      </section>
      {selected && <RequirementDrawer requirement={selected} onClose={() => setSelected(null)} notify={notify} onUpdated={() => setRevision((value) => value + 1)} />}
      {showCreate && <RequirementModal onClose={() => setShowCreate(false)} onCreated={(requirement) => { setShowCreate(false); setRevision((value) => value + 1); setSelected(requirement); notify(`${requirement.code} created`); }} notify={notify} />}
    </>
  );
}

function RequirementDrawer({ requirement, onClose, notify, onUpdated }: { requirement: Requirement; onClose: () => void; notify: (message: string, tone?: "success" | "danger") => void; onUpdated: () => void }) {
  const [detail, setDetail] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [tab, setTab] = useState("detail");
  useEffect(() => { api<any>(`/requirements/${requirement.id}`).then(setDetail); api<any[]>(`/requirements/${requirement.id}/history`).then(setHistory); }, [requirement.id]);
  if (!detail) return null;
  return (
    <div className="drawer-backdrop" onMouseDown={onClose}>
      <aside className="drawer" onMouseDown={(event) => event.stopPropagation()}>
        <div className="drawer-header"><div><code>{detail.code}</code><h2>{detail.title}</h2></div><button className="icon-button" title="Close" onClick={onClose}><X size={18} /></button></div>
        <div className="segmented"><button className={tab === "detail" ? "active" : ""} onClick={() => setTab("detail")}>Details</button><button className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}>History</button><button className={tab === "stories" ? "active" : ""} onClick={() => setTab("stories")}>Stories</button></div>
        {tab === "detail" && <div className="drawer-content"><div className="detail-badges"><StatusPill value={detail.status} /><StatusPill value={detail.priority} /><StatusPill value={detail.requirement_type} /></div><p className="requirement-copy">{detail.description}</p><dl className="detail-grid"><div><dt>Category</dt><dd>{detail.category}</dd></div><div><dt>Owner</dt><dd>{detail.owner}</dd></div><div><dt>Business value</dt><dd>{detail.business_value}/10</dd></div><div><dt>Complexity</dt><dd>{detail.complexity}/10</dd></div><div><dt>RICE score</dt><dd>{detail.rice_score}</dd></div><div><dt>Version</dt><dd>v{detail.version}.0</dd></div></dl><div className="quality-block"><span>Quality score</span><strong>{detail.analysis.quality_score}</strong><div className="bar-track"><i style={{ width: `${detail.analysis.quality_score}%` }} /></div></div></div>}
        {tab === "history" && <div className="drawer-content timeline">{history.map((item) => <div className="timeline-item" key={item.id}><CircleDot size={16} /><div><strong>Version {item.version}.0</strong><span>{item.change_summary}</span><small>{item.created_by} · {formatDate(item.created_at)}</small></div></div>)}</div>}
        {tab === "stories" && <div className="drawer-content story-stack">{detail.stories.length ? detail.stories.map((story: any) => <article className="story-row" key={story.id}><span>US-{String(story.id).padStart(3, "0")}</span><strong>{story.title}</strong><p>As a {story.persona}, I want {story.goal}, so that {story.benefit}.</p></article>) : <EmptyState icon={ListChecks} title="No user story linked" />}</div>}
        <div className="drawer-footer"><button className="button secondary" onClick={async () => { try { await api(`/change-requests`, { method: "POST", body: JSON.stringify({ requirement_id: requirement.id, summary: "Review requested from repository", reason: "Requirement needs an updated stakeholder review", impact: "Medium" }) }); notify("Change request submitted"); onUpdated(); } catch (error) { notify(error instanceof Error ? error.message : "Request failed", "danger"); } }}><History size={16} />Request change</button><button className="button primary" onClick={async () => { try { await api(`/requirements/${requirement.id}/user-stories`, { method: "POST" }); notify("User story generated"); setDetail(await api(`/requirements/${requirement.id}`)); } catch (error) { notify(error instanceof Error ? error.message : "Generation failed", "danger"); } }}><WandSparkles size={16} />Generate story</button></div>
      </aside>
    </div>
  );
}

function RequirementModal({ onClose, onCreated, notify }: { onClose: () => void; onCreated: (requirement: Requirement) => void; notify: (message: string, tone?: "success" | "danger") => void }) {
  const [form, setForm] = useState({ title: "", description: "", requirement_type: "functional", category: "Requirements", priority: "Should", status: "Draft", owner: "Hoang Phuc Nguyen", business_value: 7, complexity: 4 });
  async function submit(event: FormEvent) {
    event.preventDefault();
    try { onCreated(await api<Requirement>("/requirements", { method: "POST", body: JSON.stringify(form) })); }
    catch (error) { notify(error instanceof Error ? error.message : "Unable to create requirement", "danger"); }
  }
  return <div className="modal-backdrop" onMouseDown={onClose}><form className="modal" onSubmit={submit} onMouseDown={(event) => event.stopPropagation()}><div className="modal-header"><div><span className="eyebrow">Intake</span><h2>New requirement</h2></div><button type="button" className="icon-button" onClick={onClose}><X size={18} /></button></div><div className="form-grid"><label className="span-2">Title<input required minLength={3} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label><label className="span-2">Description<textarea required minLength={10} rows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><label>Type<select value={form.requirement_type} onChange={(event) => setForm({ ...form, requirement_type: event.target.value })}><option value="functional">Functional</option><option value="non-functional">Non-functional</option></select></label><label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>Requirements</option><option>Workflow</option><option>Security</option><option>Reporting</option><option>Performance</option></select></label><label>Priority<select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option>Must</option><option>Should</option><option>Could</option><option>Won't</option></select></label><label>Owner<input value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} /></label><label>Business value<input type="number" min="1" max="10" value={form.business_value} onChange={(event) => setForm({ ...form, business_value: Number(event.target.value) })} /></label><label>Complexity<input type="number" min="1" max="10" value={form.complexity} onChange={(event) => setForm({ ...form, complexity: Number(event.target.value) })} /></label></div><div className="modal-footer"><button type="button" className="button ghost" onClick={onClose}>Cancel</button><button className="button primary"><Plus size={16} />Create requirement</button></div></form></div>;
}

function AnalysisView({ notify }: { notify: (message: string, tone?: "success" | "danger") => void }) {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => { api<Requirement[]>("/requirements").then((items) => { setRequirements(items); if (items.length) setSelectedId(items[0].id); }); }, []);
  const selected = requirements.find((item) => item.id === selectedId);
  async function analyze() { setLoading(true); try { const result = await api<any>(`/requirements/${selectedId}/analyze`, { method: "POST" }); setAnalysis(result); notify(`Analysis completed with ${result.provider}`); } catch (error) { notify(error instanceof Error ? error.message : "Analysis failed", "danger"); } finally { setLoading(false); } }
  return <><PageHeader title="Analysis studio" eyebrow="Functional · Non-functional · Stakeholder" actions={<button className="button primary" onClick={analyze} disabled={!selected || loading}>{loading ? <RefreshCw className="spin" size={16} /> : <Sparkles size={16} />}Analyze requirement</button>} /><div className="analysis-layout"><aside className="selection-rail"><div className="search-field"><Search size={16} /><input placeholder="Find requirement" /></div>{requirements.map((item) => <button key={item.id} className={item.id === selectedId ? "selected" : ""} onClick={() => { setSelectedId(item.id); setAnalysis(null); }}><code>{item.code}</code><span>{item.title}</span><StatusPill value={item.status} /></button>)}</aside><section className="analysis-workspace">{selected ? <><div className="analysis-source"><div><code>{selected.code}</code><h2>{selected.title}</h2></div><StatusPill value={selected.requirement_type} /><p>{selected.description}</p></div>{analysis ? <div className="analysis-results"><div className="score-panel"><div className="score-ring" style={{ "--score": analysis.quality_score } as React.CSSProperties}><strong>{analysis.quality_score}</strong></div><div><span className="eyebrow">Quality score</span><h3>{analysis.quality_score >= 80 ? "Ready for refinement" : "Needs clarification"}</h3><small>{humanize(analysis.provider)} analysis</small></div></div><AnalysisList title="Functional requirements" icon={ClipboardCheck} items={analysis.functional_requirements} /><AnalysisList title="Quality attributes" icon={ShieldCheck} items={analysis.non_functional_requirements.length ? analysis.non_functional_requirements : ["No explicit quality attribute detected"]} /><AnalysisList title="Stakeholders" icon={Users} items={analysis.stakeholders} /><AnalysisList title="Ambiguities" icon={AlertTriangle} items={analysis.ambiguities.length ? analysis.ambiguities : ["No material ambiguity detected"]} tone="warning" /><AnalysisList title="Missing requirements" icon={Target} items={analysis.missing_requirements} tone="warning" /></div> : <div className="analysis-pending"><Sparkles size={30} /><strong>{selected.code} is ready</strong></div>}</> : <EmptyState icon={Sparkles} title="Select a requirement" />}</section></div></>;
}

function AnalysisList({ title, icon: Icon, items, tone = "default" }: { title: string; icon: typeof ShieldCheck; items: string[]; tone?: string }) {
  return <div className={`analysis-group ${tone}`}><div className="analysis-group-title"><Icon size={17} /><strong>{title}</strong><span>{items.length}</span></div><ul>{items.map((item, index) => <li key={`${item}-${index}`}><Check size={14} />{item}</li>)}</ul></div>;
}

function BacklogView({ notify }: { notify: (message: string, tone?: "success" | "danger") => void }) {
  const [tab, setTab] = useState("stories");
  const [stories, setStories] = useState<any[]>([]);
  const [matrix, setMatrix] = useState<any>(null);
  useEffect(() => { api<any[]>("/user-stories").then(setStories); api<any>("/prioritization/matrix").then(setMatrix); }, []);
  const columns = ["Backlog", "Sprint 1", "Ready"];
  return <><PageHeader title="Product backlog" eyebrow="User stories · MoSCoW · RICE" actions={<div className="segmented"><button className={tab === "stories" ? "active" : ""} onClick={() => setTab("stories")}>Stories</button><button className={tab === "priority" ? "active" : ""} onClick={() => setTab("priority")}>Prioritization</button></div>} />{tab === "stories" ? <section className="kanban">{columns.map((column) => { const items = stories.filter((story) => story.sprint === column || (column === "Ready" && story.status === "Ready" && story.sprint !== "Sprint 1")); return <div className="kanban-column" key={column}><div className="column-title"><strong>{column}</strong><span>{items.length}</span></div>{items.map((story) => <article className="story-card" key={`${column}-${story.id}`}><div><code>US-{String(story.id).padStart(3, "0")}</code><span>{story.story_points} pts</span></div><h3>{story.title}</h3><p>As a {story.persona}, I want {story.goal}.</p><footer><StatusPill value={story.requirement_code} /><span>{story.acceptance_criteria.length} criteria</span></footer></article>)}</div>; })}</section> : matrix ? <section className="priority-layout"><div className="content-panel ranking-panel"><div className="panel-title"><div><span className="eyebrow">RICE</span><h2>Priority ranking</h2></div><button className="icon-button" title="Recalculate" onClick={async () => { await api("/prioritization/recalculate", { method: "POST" }); setMatrix(await api("/prioritization/matrix")); notify("RICE scores recalculated"); }}><RefreshCw size={17} /></button></div><div className="ranking-list">{matrix.ranked.map((item: Requirement, index: number) => <div key={item.id}><span className="rank">{index + 1}</span><div><strong>{item.title}</strong><small>{item.code} · {item.priority}</small></div><b>{item.rice_score}</b></div>)}</div></div><div className="matrix-grid">{Object.entries(matrix.quadrants as Record<string, Requirement[]>).map(([name, items]) => <div className={`matrix-quadrant quadrant-${name.toLowerCase().replace(/ /g, "-")}`} key={name}><div><strong>{name}</strong><span>{items.length}</span></div>{items.map((item) => <button key={item.id} title={item.description}>{item.code}<small>{item.title}</small></button>)}</div>)}</div></section> : <Loading />}</>;
}

function DocumentsView({ notify }: { notify: (message: string, tone?: "success" | "danger") => void }) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [generating, setGenerating] = useState("");
  const load = () => api<any[]>("/documents").then(setDocuments);
  useEffect(() => { void load(); }, []);
  async function generate(type: string) { setGenerating(type); try { await api("/documents/generate", { method: "POST", body: JSON.stringify({ document_type: type, requirement_ids: [] }) }); await load(); notify(`${type} generated`); } catch (error) { notify(error instanceof Error ? error.message : "Generation failed", "danger"); } finally { setGenerating(""); } }
  const generators = [{ type: "BRD", label: "Business requirements", icon: FileText }, { type: "SRS", label: "System specification", icon: FileCode2 }, { type: "BACKLOG", label: "Product backlog", icon: ListChecks }];
  return <><PageHeader title="Documentation center" eyebrow="Controlled document generation" /><section className="generator-strip">{generators.map(({ type, label, icon: Icon }) => <button key={type} onClick={() => generate(type)} disabled={!!generating}><Icon size={21} /><div><strong>{type}</strong><span>{label}</span></div>{generating === type ? <RefreshCw className="spin" size={17} /> : <Plus size={17} />}</button>)}</section><section className="content-panel documents-panel"><div className="panel-title"><div><span className="eyebrow">Library</span><h2>Generated documents</h2></div><FileDown size={19} /></div>{documents.length ? <div className="document-list">{documents.map((document) => <div className="document-row" key={document.id}><div className={`document-icon type-${document.document_type.toLowerCase()}`}><FileText size={20} /></div><div><strong>{document.name}</strong><span>{document.document_type} · {document.requirement_count} requirements · {formatDate(document.created_at)}</span></div><StatusPill value={document.status} /><div className="document-actions"><button className="icon-button" title="Export PDF" onClick={() => downloadDocument(document.id, "pdf", document.name)}><FileDown size={17} /></button><button className="icon-button" title="Export DOCX" onClick={() => downloadDocument(document.id, "docx", document.name)}><Download size={17} /></button></div></div>)}</div> : <EmptyState icon={FileText} title="No generated documents" />}</section></>;
}

function ModelsView({ notify }: { notify: (message: string, tone?: "success" | "danger") => void }) {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [requirementId, setRequirementId] = useState(1);
  const [modelType, setModelType] = useState("BPMN");
  const [result, setResult] = useState<any>(null);
  useEffect(() => { api<Requirement[]>("/requirements").then((items) => { setRequirements(items); if (items.length) setRequirementId(items[0].id); }); }, []);
  async function generate() { try { const value = await api<any>("/process-models/generate", { method: "POST", body: JSON.stringify({ model_type: modelType, requirement_id: requirementId }) }); setResult(value); notify(`${modelType} model generated`); } catch (error) { notify(error instanceof Error ? error.message : "Model generation failed", "danger"); } }
  return <><PageHeader title="Process modeling" eyebrow="Use case · BPMN · ERD" actions={<button className="button primary" onClick={generate}><WandSparkles size={16} />Generate model</button>} /><div className="model-toolbar"><div className="segmented">{["USE_CASE", "BPMN", "ERD"].map((type) => <button key={type} className={modelType === type ? "active" : ""} onClick={() => { setModelType(type); setResult(null); }}>{type.replace("_", " ")}</button>)}</div><select value={requirementId} onChange={(event) => { setRequirementId(Number(event.target.value)); setResult(null); }}>{requirements.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.title}</option>)}</select></div><section className="model-canvas">{result ? <ModelResult result={result} /> : <div className="canvas-empty"><GitBranch size={32} /><strong>{modelType.replace("_", " ")} canvas</strong></div>}</section></>;
}

function ModelResult({ result }: { result: any }) {
  const model = result.model;
  if (result.model_type === "BPMN") return <div className="bpmn-flow"><h2>{model.title}</h2><div className="flow-row">{model.nodes.map((node: any, index: number) => <div className="flow-node-wrap" key={node.id}><div className={`flow-node ${node.type}`}><span>{node.type}</span><strong>{node.label}</strong></div>{index < model.nodes.length - 1 && <ArrowRight size={18} />}</div>)}</div></div>;
  if (result.model_type === "USE_CASE") return <div className="use-case"><h2>{model.title}</h2><div className="actor"><UserRound size={24} /><strong>{model.actor}</strong></div><div className="use-case-flow">{model.main_flow.map((step: string, index: number) => <div key={step}><span>{index + 1}</span>{step}</div>)}</div><aside><strong>Alternate flows</strong>{model.alternate_flows.map((flow: string) => <p key={flow}>{flow}</p>)}</aside></div>;
  return <div className="erd-model"><h2>{model.title}</h2><div className="entity-grid">{model.entities.map((entity: any) => <div className="entity" key={entity.name}><strong>{entity.name}</strong>{entity.fields.map((field: string) => <span key={field}>{field}</span>)}</div>)}</div><div className="relations">{model.relationships.map((relationship: string) => <span key={relationship}>{relationship}</span>)}</div></div>;
}

function TraceabilityView() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { api<any>("/traceability").then(setData); }, []);
  if (!data) return <Loading />;
  return <><PageHeader title="Traceability matrix" eyebrow="Goal → Requirement → Story → Task → Test" actions={<div className="coverage-badge"><Target size={17} /><strong>{data.coverage}%</strong><span>coverage</span></div>} /><section className="trace-summary"><div><span>Covered links</span><strong>{data.rows.length - data.gaps.length}</strong></div><div><span>Coverage gaps</span><strong>{data.gaps.length}</strong></div><div><span>Total chains</span><strong>{data.rows.length}</strong></div></section><section className="content-panel trace-panel"><div className="table-wrap"><table><thead><tr><th>Business goal</th><th>Requirement</th><th>User story</th><th>Task</th><th>Test case</th><th>Coverage</th></tr></thead><tbody>{data.rows.map((row: any) => <tr key={row.id}><td><Target size={15} />{row.business_goal}</td><td><code>{row.requirement_code}</code><small>{row.requirement_title}</small></td><td>{row.user_story}</td><td>{row.task}</td><td>{row.test_case}</td><td><StatusPill value={row.coverage_status} /></td></tr>)}</tbody></table></div></section></>;
}

function ChangesView({ user, notify }: { user: SessionUser; notify: (message: string, tone?: "success" | "danger") => void }) {
  const [changes, setChanges] = useState<any[]>([]);
  const load = () => api<any[]>("/change-requests").then(setChanges);
  useEffect(() => { void load(); }, []);
  const canApprove = ["admin", "product_owner", "project_manager"].includes(user.role);
  async function decide(id: number, decision: string) { try { await api(`/change-requests/${id}/decision`, { method: "POST", body: JSON.stringify({ decision }) }); await load(); notify(`Change ${decision.toLowerCase()}`); } catch (error) { notify(error instanceof Error ? error.message : "Decision failed", "danger"); } }
  const counts = { Pending: changes.filter((item) => item.status === "Pending").length, Approved: changes.filter((item) => item.status === "Approved").length, Rejected: changes.filter((item) => item.status === "Rejected").length };
  return <><PageHeader title="Change management" eyebrow="Versioned approval workflow" /><section className="change-summary">{Object.entries(counts).map(([label, count]) => <div key={label}><StatusPill value={label} /><strong>{count}</strong></div>)}</section><section className="change-list">{changes.map((change) => <article className="change-row" key={change.id}><div className="change-id"><span>CR-{String(change.id).padStart(3, "0")}</span><StatusPill value={change.impact} /></div><div className="change-main"><div><code>{change.requirement_code}</code><h3>{change.summary}</h3></div><p>{change.reason}</p><footer><span>Requested by {change.requested_by}</span><span>{formatDate(change.created_at)}</span>{change.reviewed_by && <span>Reviewed by {change.reviewed_by}</span>}</footer></div><StatusPill value={change.status} />{change.status === "Pending" && canApprove && <div className="decision-actions"><button className="icon-button approve" title="Approve" onClick={() => decide(change.id, "Approved")}><CheckCircle2 size={18} /></button><button className="icon-button reject" title="Reject" onClick={() => decide(change.id, "Rejected")}><XCircle size={18} /></button></div>}</article>)}</section></>;
}

function AssistantView() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string; provider?: string }[]>([{ role: "assistant", text: "The workspace is loaded. Ask about scope, ambiguity, stakeholders, acceptance criteria, or traceability." }]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => { api<any[]>("/assistant/suggestions").then(setSuggestions); }, []);
  async function send(text = question) { if (!text.trim() || loading) return; setMessages((items) => [...items, { role: "user", text }]); setQuestion(""); setLoading(true); try { const result = await api<any>("/assistant/chat", { method: "POST", body: JSON.stringify({ question: text }) }); setMessages((items) => [...items, { role: "assistant", text: result.answer, provider: result.provider }]); } catch (error) { setMessages((items) => [...items, { role: "assistant", text: error instanceof Error ? error.message : "Assistant unavailable" }]); } finally { setLoading(false); } }
  return <><PageHeader title="AI assistant" eyebrow="Workspace requirement intelligence" /><div className="assistant-layout"><section className="chat-panel"><div className="chat-messages">{messages.map((message, index) => <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}><div>{message.role === "assistant" ? <Bot size={17} /> : <UserRound size={17} />}</div><p>{message.text}</p>{message.provider && <span>{message.provider}</span>}</div>)}{loading && <div className="chat-message assistant"><div><Bot size={17} /></div><p className="typing"><i /><i /><i /></p></div>}</div><form className="chat-composer" onSubmit={(event) => { event.preventDefault(); send(); }}><textarea rows={2} placeholder="Ask ReqFlow AI" value={question} onChange={(event) => setQuestion(event.target.value)} /><button className="icon-button send" title="Send" disabled={!question.trim() || loading}><Send size={18} /></button></form></section><aside className="suggestion-panel"><div className="panel-title"><div><span className="eyebrow">Quality review</span><h2>Suggested actions</h2></div><Sparkles size={18} /></div><div className="suggestion-list">{suggestions.map((item) => <button key={item.requirement_id} onClick={() => send(`Review missing requirements for ${item.code}: ${item.title}`)}><div><code>{item.code}</code><span>{item.quality_score}</span></div><strong>{item.issue}</strong><small>{item.action}</small></button>)}</div><div className="quick-prompts"><button onClick={() => send("Which requirements have the largest traceability gaps?")}>Traceability gaps</button><button onClick={() => send("Suggest measurable acceptance criteria")}>Acceptance criteria</button><button onClick={() => send("Which stakeholders should review this scope?")}>Stakeholder review</button></div></aside></div></>;
}

function AdminView() {
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [denied, setDenied] = useState(false);
  useEffect(() => { api<any[]>("/admin/users").then(setUsers).catch((error) => { if (error instanceof ApiError && error.status === 403) setDenied(true); }); api<any[]>("/audit-logs?limit=20").then(setLogs); }, []);
  return <><PageHeader title="Administration" eyebrow="Access control · Audit logging" />{denied ? <section className="access-denied"><ShieldCheck size={32} /><h2>Administrator access required</h2></section> : <section className="admin-grid"><div className="content-panel"><div className="panel-title"><div><span className="eyebrow">RBAC</span><h2>Workspace users</h2></div><Users size={18} /></div><div className="user-list">{users.map((item) => <div key={item.id}><div className="avatar small">{item.full_name.split(" ").map((part: string) => part[0]).slice(-2).join("")}</div><div><strong>{item.full_name}</strong><span>@{item.username}</span></div><StatusPill value={humanize(item.role)} /><span className="active-state"><i />Active</span></div>)}</div></div><div className="content-panel"><div className="panel-title"><div><span className="eyebrow">Evidence</span><h2>Audit log</h2></div><Activity size={18} /></div><div className="audit-list">{logs.map((log) => <div key={log.id}><Clock3 size={15} /><div><strong>{log.actor} · {humanize(log.action)}</strong><span>{log.entity_type} {log.entity_id} {log.detail}</span></div><time>{formatDate(log.created_at)}</time></div>)}</div></div></section>}</>;
}

function Loading() {
  return <div className="loading"><RefreshCw className="spin" size={22} /><span>Loading workspace</span></div>;
}

function App() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checking, setChecking] = useState(Boolean(session.getToken()));
  const [view, setView] = useState<ViewKey>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (!session.getToken()) return;
    api<SessionUser>("/auth/me").then(setUser).catch(() => session.clear()).finally(() => setChecking(false));
  }, []);

  function notify(message: string, tone: "success" | "danger" = "success") {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 3200);
  }

  const viewContent = useMemo(() => {
    if (!user) return null;
    if (view === "overview") return <OverviewView />;
    if (view === "requirements") return <RequirementsView notify={notify} />;
    if (view === "analysis") return <AnalysisView notify={notify} />;
    if (view === "backlog") return <BacklogView notify={notify} />;
    if (view === "documents") return <DocumentsView notify={notify} />;
    if (view === "models") return <ModelsView notify={notify} />;
    if (view === "traceability") return <TraceabilityView />;
    if (view === "changes") return <ChangesView user={user} notify={notify} />;
    if (view === "assistant") return <AssistantView />;
    return <AdminView />;
  }, [view, user]);

  if (checking) return <Loading />;
  if (!user) return <Login onAuthenticated={setUser} />;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand"><div className="brand-mark"><FileCode2 size={21} /></div><div><strong>ReqFlow AI</strong><span>Requirement Intelligence</span></div><button className="mobile-close" onClick={() => setSidebarOpen(false)}><X size={18} /></button></div>
        <nav>{NAVIGATION.map(({ key, label, icon: Icon }) => <button key={key} className={view === key ? "active" : ""} onClick={() => { setView(key); setSidebarOpen(false); }}><Icon size={18} /><span>{label}</span>{key === "changes" && <i className="nav-alert" />}</button>)}</nav>
        <div className="sidebar-footer"><div className="avatar">{user.full_name.split(" ").map((part) => part[0]).slice(-2).join("")}</div><div><strong>{user.full_name}</strong><span>{humanize(user.role)}</span></div><button title="Sign out" onClick={() => { session.clear(); setUser(null); }}><LogOut size={17} /></button></div>
      </aside>
      {sidebarOpen && <div className="sidebar-scrim" onClick={() => setSidebarOpen(false)} />}
      <main className="main-area">
        <header className="topbar"><button className="mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={19} /></button><div><span>ReqFlow AI</span><ChevronDown size={14} /><strong>{VIEW_TITLES[view]}</strong></div><div className="topbar-actions"><button title="AI assistant" onClick={() => setView("assistant")}><Bot size={18} /></button><div className="system-status"><i />Operational</div></div></header>
        <div className="page-content">{viewContent}</div>
      </main>
      {toast && <div className={`toast ${toast.tone}`}>{toast.tone === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}{toast.message}</div>}
    </div>
  );
}

export default App;
