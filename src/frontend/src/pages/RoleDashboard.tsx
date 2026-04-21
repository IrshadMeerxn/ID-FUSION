import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ChevronLeft, MapPin, Search, User, Users, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { IDFusionRole } from "../api";
import AppHeader from "../components/AppHeader";
import IDCardDisplay from "../components/IDCardDisplay";
import { useGetPerson, useSearchPersons } from "../hooks/useQueries";
import { INDIA_STATES, getCitiesForState } from "../utils/indiaData";
import { ROLE_BG_COLORS, ROLE_COLORS, ROLE_LABELS } from "../utils/roleUtils";

interface Props { profile: { name: string; idFusionRole: IDFusionRole } }
type ViewState = "list" | "detail";

type PersonView = ReturnType<typeof import("../hooks/useQueries").useGetPerson> extends { data: infer D } ? NonNullable<D> : never;

function RoleCardSection({ view }: { view: any }) {
  if (view.__kind__ === "voterView") {
    const d = view.voterView;
    return <div className="space-y-4"><PersonMetaInfo name={d.name} dob={d.dateOfBirth} address={d.address} personId={d.personId} /><IDCardDisplay title="Voter ID" card={d.voterID} accentColor="text-orange-400" /></div>;
  }
  if (view.__kind__ === "passportView") {
    const d = view.passportView;
    return <div className="space-y-4"><PersonMetaInfo name={d.name} dob={d.dateOfBirth} address={d.address} personId={d.personId} /><IDCardDisplay title="Passport" card={d.passport} accentColor="text-purple-400" /></div>;
  }
  if (view.__kind__ === "rtoView") {
    const d = view.rtoView;
    return <div className="space-y-4"><PersonMetaInfo name={d.name} dob={d.dateOfBirth} address={d.address} personId={d.personId} /><IDCardDisplay title="Driving License" card={d.drivingLicense} accentColor="text-emerald-400" /><IDCardDisplay title="RC Card (Vehicle)" card={d.rcCard} accentColor="text-emerald-400" /></div>;
  }
  if (view.__kind__ === "generalView") {
    const d = view.generalView;
    return <div className="space-y-4"><PersonMetaInfo name={d.name} dob={d.dateOfBirth} address={d.address} personId={d.personId} /><IDCardDisplay title="Aadhaar Card" card={d.aadhaarCard} accentColor="text-primary" /><IDCardDisplay title="PAN Card" card={d.panCard} accentColor="text-primary" /><IDCardDisplay title="Ration Card" card={d.rationCard} accentColor="text-primary" /></div>;
  }
  if (view.__kind__ === "adminView") {
    const d = view.adminView;
    return <div className="space-y-4"><PersonMetaInfo name={d.name} dob={d.dateOfBirth} address={d.address} personId={d.personId} /><IDCardDisplay title="Aadhaar Card" card={d.aadhaarCard} /><IDCardDisplay title="PAN Card" card={d.panCard} /><IDCardDisplay title="Ration Card" card={d.rationCard} /><IDCardDisplay title="Voter ID" card={d.voterID} /><IDCardDisplay title="Driving License" card={d.drivingLicense} /><IDCardDisplay title="RC Card" card={d.rcCard} /><IDCardDisplay title="Passport" card={d.passport} /></div>;
  }
  return null;
}

function PersonMetaInfo({ name, dob, address, personId }: { name: string; dob: string; address: string; personId: string }) {
  return (
    <div className="bg-card border border-border rounded p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20">
          <span className="font-display font-bold text-lg text-primary">{name.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <h2 className="font-display font-semibold text-lg text-foreground">{name}</h2>
          <p className="id-number text-xs text-muted-foreground">{personId}</p>
        </div>
      </div>
      <Separator className="bg-border" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="flex items-start gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4 mt-0.5 shrink-0" />
          <div><p className="text-[10px] uppercase tracking-wider mb-0.5">Date of Birth</p><p className="text-foreground">{dob}</p></div>
        </div>
        <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
          <div><p className="text-[10px] uppercase tracking-wider mb-0.5">Address</p><p className="text-foreground text-xs leading-relaxed">{address}</p></div>
        </div>
      </div>
    </div>
  );
}

function PersonDetailView({ personId, onBack, role }: { personId: string; onBack: () => void; role: IDFusionRole }) {
  const { data: personView, isLoading } = useGetPerson(personId, role);
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground hover:bg-muted gap-1"><ChevronLeft className="w-4 h-4" />Back</Button>
        <span className="text-muted-foreground text-sm">/</span>
        <span className="text-sm text-foreground">Identity Record</span>
      </div>
      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-32 w-full rounded" /><Skeleton className="h-24 w-full rounded" /><Skeleton className="h-24 w-full rounded" /></div>
      ) : personView ? <RoleCardSection view={personView} /> : (
        <div className="text-center py-12 text-muted-foreground"><p>Record not found or not accessible.</p></div>
      )}
    </div>
  );
}

const ROLE_ACCESS_LABEL: Record<IDFusionRole, string> = {
  general: "Aadhaar · PAN · Ration Card",
  rto: "Driving License · RC Card",
  passport: "Passport",
  voter: "Voter ID",
  admin: "All Documents",
};

export default function RoleDashboard({ profile }: Props) {
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [view, setView] = useState<ViewState>("list");
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const { data: allPersons, isLoading } = useSearchPersons(search);

  const persons = allPersons?.filter((p) => {
    const matchesState = !filterState || p.address.includes(filterState);
    const matchesCity = !filterCity || p.address.includes(filterCity);
    return matchesState && matchesCity;
  });

  const role = profile.idFusionRole;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader profile={profile} />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-medium mb-6 ${ROLE_BG_COLORS[role]}`}>
          <span className={ROLE_COLORS[role]}>{ROLE_LABELS[role]}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{ROLE_ACCESS_LABEL[role]}</span>
        </div>
        <AnimatePresence mode="wait">
          {view === "list" ? (
            <motion.div key="list" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground">Search Records</h1>
                  <p className="text-sm text-muted-foreground mt-1">View identity information for registered persons</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border focus:border-primary" />
                  {search && <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
                </div>
                <Select value={filterState} onValueChange={(v) => { setFilterState(v === "_all" ? "" : v); setFilterCity(""); }}>
                  <SelectTrigger className="w-full sm:w-44 bg-card border-border">
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border max-h-60">
                    <SelectItem value="_all">All States</SelectItem>
                    {INDIA_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterCity} onValueChange={(v) => setFilterCity(v === "_all" ? "" : v)} disabled={!filterState}>
                  <SelectTrigger className="w-full sm:w-44 bg-card border-border">
                    <SelectValue placeholder={filterState ? "All Cities" : "Select state first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border max-h-60">
                    <SelectItem value="_all">All Cities</SelectItem>
                    {getCitiesForState(filterState).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                {(filterState || filterCity) && (
                  <Button variant="ghost" size="sm" onClick={() => { setFilterState(""); setFilterCity(""); }} className="text-muted-foreground hover:text-foreground shrink-0">
                    <X className="w-3.5 h-3.5 mr-1" />Clear
                  </Button>
                )}
              </div>
              {isLoading ? (
                <div className="space-y-3">{["sk1","sk2","sk3"].map((k) => <Skeleton key={k} className="h-16 w-full rounded" />)}</div>
              ) : !persons || persons.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 gap-4">
                  <Users className="w-10 h-10 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">{search ? "No persons found matching your search" : "No records available"}</p>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  {persons.map((person, i) => (
                    <motion.button key={person.personId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} onClick={() => { setSelectedPersonId(person.personId); setView("detail"); }} className="w-full bg-card border border-border rounded p-4 flex items-center justify-between gap-4 text-left card-glow-hover hover:border-primary/30 transition-colors group">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 border border-primary/20 shrink-0"><User className="w-4 h-4 text-primary" /></div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{person.name}</p>
                          <p className="id-number text-xs text-muted-foreground">{person.personId}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-primary/20 text-primary text-[10px] shrink-0 group-hover:bg-primary/10">View</Badge>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="detail" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
              {selectedPersonId && <PersonDetailView personId={selectedPersonId} onBack={() => { setView("list"); setSelectedPersonId(null); }} role={role} />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
