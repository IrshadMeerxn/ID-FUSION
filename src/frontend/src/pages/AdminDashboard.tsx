import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ChevronLeft, ChevronRight, Edit2, Eye, EyeOff, Loader2, MapPin, Plus, Save, Search, Shield, Trash2, Users, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Credential, IDFusionRole, Person } from "../api";
import AppHeader from "../components/AppHeader";
import IDCardDisplay from "../components/IDCardDisplay";
import PersonFormSheet from "../components/PersonFormSheet";
import { useCreateCredential, useDeleteCredential, useDeletePerson, useGetPerson, useListCredentials, useListPersons, useUpdateCredential } from "../hooks/useQueries";

interface Props { profile: { name: string; idFusionRole: IDFusionRole } }

type NonAdminRole = Exclude<IDFusionRole, "admin">;
const ROLE_CONFIGS: Array<{ key: NonAdminRole; label: string; icon: string; color: string; prefix: string }> = [
  { key: "general", label: "General Login", icon: "👤", color: "text-primary", prefix: "gen_" },
  { key: "rto", label: "RTO Login", icon: "🚗", color: "text-emerald-400", prefix: "rto_" },
  { key: "passport", label: "Passport Login", icon: "✈️", color: "text-purple-400", prefix: "pas_" },
  { key: "voter", label: "Voter Login", icon: "🗳️", color: "text-orange-400", prefix: "vot_" },
];

type NewRow = { username: string; password: string; show: boolean };

function RoleCredentialsCard({ cfg }: { cfg: (typeof ROLE_CONFIGS)[number] }) {
  const { data: allCreds = [], isLoading } = useListCredentials();
  const creds = allCreds.filter((c) => c.role === cfg.key);
  const createCred = useCreateCredential();
  const updateCred = useUpdateCredential();
  const deleteCred = useDeleteCredential();
  const [newRow, setNewRow] = useState<NewRow>({ username: "", password: "", show: false });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<NewRow>({ username: "", password: "", show: false });

  // Strip prefix for display
  const displayName = (username: string) =>
    username.startsWith(cfg.prefix) ? username.slice(cfg.prefix.length) : username;

  const handleAdd = async () => {
    if (!newRow.username.trim() || !newRow.password.trim()) { toast.error("Username and password are required"); return; }
    try {
      await createCred.mutateAsync({ username: newRow.username.trim(), password: newRow.password, role: cfg.key });
      setNewRow({ username: "", password: "", show: false });
      toast.success(`Credential added for ${cfg.label}`);
    } catch (e: any) { toast.error(e.message || "Failed to add credential"); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteCred.mutateAsync(id); toast.success("Credential removed"); }
    catch (e: any) { toast.error(e.message || "Failed to remove credential"); }
  };

  const startEdit = (c: Credential) => { setEditingId(c.id); setEditRow({ username: displayName(c.username), password: "", show: false }); };

  const handleSaveEdit = async () => {
    if (!editingId || !editRow.username.trim() || !editRow.password.trim()) { toast.error("Username and password are required"); return; }
    try {
      await updateCred.mutateAsync({ id: editingId, username: `${cfg.prefix}${editRow.username.trim()}`, password: editRow.password });
      setEditingId(null); toast.success("Credential updated");
    } catch (e: any) { toast.error(e.message || "Failed to update credential"); }
  };

  if (isLoading) return <Skeleton className="h-32 w-full rounded" />;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{cfg.icon}</span>
        <span className={`font-display font-semibold text-sm ${cfg.color}`}>{cfg.label}</span>
        <span className="ml-auto text-xs text-muted-foreground">{creds.length} user{creds.length !== 1 ? "s" : ""}</span>
      </div>
      {creds.length > 0 && (
        <div className="space-y-2 mb-4">
          <AnimatePresence>
            {creds.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                {editingId === c.id ? (
                  <div className="flex items-center gap-2 p-2 rounded bg-background border border-primary/30">
                    <div className="flex items-center flex-1 bg-transparent border border-input rounded overflow-hidden h-8">
                      <span className="px-2 text-xs text-primary font-mono bg-primary/10 border-r border-input h-full flex items-center">{cfg.prefix}</span>
                      <Input type="text" value={editRow.username} onChange={(e) => setEditRow((r) => ({ ...r, username: e.target.value }))} placeholder="username" className="h-8 text-xs border-0 bg-transparent focus-visible:ring-0 flex-1" />
                    </div>
                    <div className="relative flex-1">
                      <Input type={editRow.show ? "text" : "password"} value={editRow.password} onChange={(e) => setEditRow((r) => ({ ...r, password: e.target.value }))} placeholder="New password" className="h-8 text-xs pr-8 bg-transparent border-input" />
                      <button type="button" onClick={() => setEditRow((r) => ({ ...r, show: !r.show }))} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" tabIndex={-1}>
                        {editRow.show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                    <Button size="sm" onClick={handleSaveEdit} disabled={updateCred.isPending} className="h-8 px-2 bg-primary text-primary-foreground hover:bg-primary/90"><Save className="w-3 h-3" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8 px-2 text-muted-foreground"><X className="w-3 h-3" /></Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded bg-background/50 border border-border/60 group">
                    <span className="text-xs font-mono text-primary">{cfg.prefix}</span>
                    <span className="text-xs font-medium text-foreground flex-1 truncate">{displayName(c.username)}</span>
                    <span className="text-xs text-muted-foreground flex-1 font-mono tracking-widest">{"•".repeat(8)}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(c)} className="h-6 px-1.5 text-muted-foreground hover:text-primary"><Edit2 className="w-3 h-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(c.id)} disabled={deleteCred.isPending} className="h-6 px-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      <div className="flex items-center gap-2 p-2 rounded border border-dashed border-border bg-background/30">
        <div className="flex items-center flex-1 bg-transparent border border-input rounded overflow-hidden h-8">
          <span className="px-2 text-xs text-primary font-mono bg-primary/10 border-r border-input h-full flex items-center">{cfg.prefix}</span>
          <Input type="text" value={newRow.username} onChange={(e) => setNewRow((r) => ({ ...r, username: e.target.value }))} placeholder="username" autoComplete="off" className="h-8 text-xs border-0 bg-transparent focus-visible:ring-0 flex-1" onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
        </div>
        <div className="relative flex-1">
          <Input type={newRow.show ? "text" : "password"} value={newRow.password} onChange={(e) => setNewRow((r) => ({ ...r, password: e.target.value }))} placeholder="Password" autoComplete="new-password" className="h-8 text-xs pr-8 bg-transparent border-input focus:border-primary" onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
          <button type="button" onClick={() => setNewRow((r) => ({ ...r, show: !r.show }))} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
            {newRow.show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
        </div>
        <Button size="sm" onClick={handleAdd} disabled={createCred.isPending} className="h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
          <Plus className="w-3 h-3 mr-1" />Add
        </Button>
      </div>
    </motion.div>
  );
}

function PersonDetailPanel({ person, onBack, onEdit }: { person: Person; onBack: () => void; onEdit: () => void }) {
  const { data: fullPerson, isLoading } = useGetPerson(person.personId, "admin");
  const p = fullPerson?.__kind__ === "adminView" ? fullPerson.adminView : person;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground gap-1">
          <ChevronLeft className="w-4 h-4" />Back
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm text-foreground">{person.name}</span>
        <Button variant="outline" size="sm" onClick={onEdit} className="ml-auto border-primary/30 text-primary hover:bg-primary/10">
          <Edit2 className="w-3.5 h-3.5 mr-1.5" />Edit
        </Button>
      </div>
      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-32 w-full" /><Skeleton className="h-24 w-full" /></div>
      ) : (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20">
                <span className="font-display font-bold text-lg text-primary">{p.name.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h2 className="font-display font-semibold text-lg text-foreground">{p.name}</h2>
                <p className="id-number text-xs text-muted-foreground">{p.personId}</p>
              </div>
            </div>
            <Separator className="bg-border" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 mt-0.5 shrink-0" />
                <div><p className="text-[10px] uppercase tracking-wider mb-0.5">Date of Birth</p><p className="text-foreground">{p.dateOfBirth}</p></div>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <div><p className="text-[10px] uppercase tracking-wider mb-0.5">Address</p><p className="text-foreground text-xs leading-relaxed">{p.address}</p></div>
              </div>
            </div>
          </div>
          <IDCardDisplay title="Aadhaar Card" card={p.aadhaarCard} />
          <IDCardDisplay title="PAN Card" card={p.panCard} />
          <IDCardDisplay title="Ration Card" card={p.rationCard} />
          <IDCardDisplay title="Voter ID" card={p.voterID} accentColor="text-orange-400" />
          <IDCardDisplay title="Driving License" card={p.drivingLicense} accentColor="text-emerald-400" />
          <IDCardDisplay title="RC Card" card={p.rcCard} accentColor="text-emerald-400" />
          <IDCardDisplay title="Passport" card={p.passport} accentColor="text-purple-400" />
        </div>
      )}
    </div>
  );
}

function ManageLoginsTab() {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="font-display text-lg font-semibold text-foreground">Role Login Credentials</h2>
        <p className="text-sm text-muted-foreground mt-1">Add multiple usernames and passwords for each role.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ROLE_CONFIGS.map((cfg) => <RoleCredentialsCard key={cfg.key} cfg={cfg} />)}
      </div>
      <div className="mt-6 p-4 rounded-lg bg-accent/5 border border-accent/20">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-accent">Admin Account</span>
        </div>
        <p className="text-xs text-muted-foreground">Admin credentials are fixed and cannot be changed here.</p>
      </div>
    </div>
  );
}

export default function AdminDashboard({ profile }: Props) {
  const [search, setSearch] = useState("");
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [viewingPerson, setViewingPerson] = useState<Person | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Person | null>(null);

  const { data: persons, isLoading } = useListPersons();
  const deletePerson = useDeletePerson();

  const filteredPersons = useMemo(() => {
    if (!persons) return [];
    if (!search.trim()) return persons;
    const q = search.toLowerCase();
    return persons.filter((p) => p.name.toLowerCase().includes(q) || p.personId.toLowerCase().includes(q));
  }, [persons, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await deletePerson.mutateAsync(deleteTarget.personId); toast.success(`${deleteTarget.name} has been removed`); setDeleteTarget(null); }
    catch { toast.error("Failed to delete person"); }
  };

  const cardCount = (p: Person) => [p.aadhaarCard, p.panCard, p.rationCard, p.voterID, p.drivingLicense, p.rcCard, p.passport].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader profile={profile} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <Tabs defaultValue="records">
          <TabsList className="mb-6 bg-card border border-border">
            <TabsTrigger value="records" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Users className="w-3.5 h-3.5 mr-1.5" />Identity Records</TabsTrigger>
            <TabsTrigger value="logins" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Shield className="w-3.5 h-3.5 mr-1.5" />Manage Logins</TabsTrigger>
          </TabsList>
          <TabsContent value="records">
            <AnimatePresence mode="wait">
            {viewingPerson ? (
              <motion.div key="detail" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                <PersonDetailPanel
                  person={viewingPerson}
                  onBack={() => setViewingPerson(null)}
                  onEdit={() => { setEditingPerson(viewingPerson); setViewingPerson(null); }}
                />
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">Identity Records</h1>
                <p className="text-sm text-muted-foreground mt-1">{persons?.length ?? 0} records in system</p>
              </div>
              <Button onClick={() => setIsAddOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"><Plus className="w-4 h-4" />Add Person</Button>
            </div>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by name or ID…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border focus:border-primary" />
              {search && <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
            </div>
            {isLoading ? (
              <div className="space-y-3">{["sk1","sk2","sk3"].map((k) => <Skeleton key={k} className="h-20 w-full rounded" />)}</div>
            ) : filteredPersons.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 gap-4">
                <Users className="w-10 h-10 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">{search ? "No persons match your search" : "No identity records yet. Add the first person."}</p>
                {!search && <Button variant="outline" onClick={() => setIsAddOpen(true)} className="border-primary/30 text-primary hover:bg-primary/10"><Plus className="w-4 h-4 mr-2" />Add First Person</Button>}
              </motion.div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {filteredPersons.map((person, i) => (
                    <motion.div key={person.personId} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ delay: i * 0.03 }}
                      className="bg-card border border-border rounded p-4 flex items-center justify-between gap-4 card-glow-hover group cursor-pointer"
                      onClick={() => setViewingPerson(person)}>
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 border border-primary/20 shrink-0">
                          <span className="font-display font-bold text-sm text-primary">{person.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{person.name}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="id-number text-xs text-muted-foreground">{person.personId}</span>
                            <Badge variant="outline" className="text-[10px] border-primary/20 text-primary hidden sm:inline-flex">{cardCount(person)} cards</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditingPerson(person); }} className="h-8 px-3 text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit2 className="w-3.5 h-3.5 mr-1" /><span className="text-xs hidden sm:inline">Edit</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteTarget(person); }} className="h-8 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3.5 h-3.5" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-display">Delete Record</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">This will permanently remove <strong className="text-foreground">{person.name}</strong>'s identity record. This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete} disabled={deletePerson.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                {deletePerson.isPending ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Deleting…</> : "Delete Record"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <ChevronRight className="w-4 h-4 text-primary" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
              </motion.div>
            )}
            </AnimatePresence>
          </TabsContent>
          <TabsContent value="logins"><ManageLoginsTab /></TabsContent>
        </Tabs>
      </main>
      <PersonFormSheet open={isAddOpen} onOpenChange={setIsAddOpen} mode="create" />
      {editingPerson && <PersonFormSheet open={!!editingPerson} onOpenChange={(open) => { if (!open) setEditingPerson(null); }} mode="edit" person={editingPerson} />}
    </div>
  );
}
