import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Card, Person } from "../api";
import { useCreatePerson, useListPersons, useUpdatePerson, useUploadImage } from "../hooks/useQueries";
import { INDIA_STATES, getCitiesForState } from "../utils/indiaData";
import CardPhotoUpload from "./CardPhotoUpload";

interface CardFormState {
  cardNumber: string;
  frontFile: File | null;
  backFile: File | null;
  frontPreview: string | null;
  backPreview: string | null;
  existingFrontUrl: string | null;
  existingBackUrl: string | null;
}

const EMPTY_CARD: CardFormState = {
  cardNumber: "", frontFile: null, backFile: null,
  frontPreview: null, backPreview: null,
  existingFrontUrl: null, existingBackUrl: null,
};

const CARD_FIELDS: { key: CardKey; label: string }[] = [
  { key: "aadhaarCard", label: "Aadhaar Card" },
  { key: "panCard", label: "PAN Card" },
  { key: "rationCard", label: "Ration Card" },
  { key: "voterID", label: "Voter ID" },
  { key: "drivingLicense", label: "Driving License" },
  { key: "rcCard", label: "RC Card (Vehicle)" },
  { key: "passport", label: "Passport" },
];

type CardKey = "aadhaarCard" | "panCard" | "rationCard" | "voterID" | "drivingLicense" | "rcCard" | "passport";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  person?: Person;
}

function initCardState(card?: Card | null): CardFormState {
  if (!card) return EMPTY_CARD;
  return {
    cardNumber: card.cardNumber,
    frontFile: null, backFile: null,
    frontPreview: card.photoFrontUrl, backPreview: card.photoBackUrl,
    existingFrontUrl: card.photoFrontUrl, existingBackUrl: card.photoBackUrl,
  };
}

function parseAddress(address: string) {
  // Try to parse "door, street, city, state, pincode" format
  const parts = address.split(",").map((p) => p.trim());
  return {
    door: parts[0] || "",
    street: parts[1] || "",
    city: parts[2] || "",
    state: parts[3] || "",
    pincode: parts[4] || "",
  };
}

export default function PersonFormSheet({ open, onOpenChange, mode, person }: Props) {
  const [name, setName] = useState(person?.name ?? "");
  const [personId, setPersonId] = useState(person?.personId ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(person?.dateOfBirth ?? "");
  const [door, setDoor] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const { data: existingPersons } = useListPersons();

  // Auto-generate personId for create mode: PINCODE-BIRTHYEAR-RECORDNO
  useEffect(() => {
    if (mode !== "create") return;
    const year = dateOfBirth ? dateOfBirth.split("-")[0] : "";
    const pin = pincode.length === 6 ? pincode : "";
    const recordNo = String((existingPersons?.length ?? 0) + 1).padStart(3, "0");
    if (pin && year) {
      setPersonId(`${pin}-${year}-${recordNo}`);
    } else {
      setPersonId("");
    }
  }, [pincode, dateOfBirth, existingPersons, mode]);
  const [cards, setCards] = useState<Record<CardKey, CardFormState>>({
    aadhaarCard: initCardState(person?.aadhaarCard), panCard: initCardState(person?.panCard),
    rationCard: initCardState(person?.rationCard), voterID: initCardState(person?.voterID),
    drivingLicense: initCardState(person?.drivingLicense), rcCard: initCardState(person?.rcCard),
    passport: initCardState(person?.passport),
  });
  const [expandedCards, setExpandedCards] = useState<Set<CardKey>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPerson = useCreatePerson();
  const updatePerson = useUpdatePerson();
  const uploadImage = useUploadImage();

  useEffect(() => {
    if (open) {
      setName(person?.name ?? ""); setPersonId(person?.personId ?? "");
      setDateOfBirth(person?.dateOfBirth ?? "");
      const parsed = parseAddress(person?.address ?? "");
      setDoor(parsed.door); setStreet(parsed.street);
      setCity(parsed.city); setState(parsed.state); setPincode(parsed.pincode);
      setCards({
        aadhaarCard: initCardState(person?.aadhaarCard), panCard: initCardState(person?.panCard),
        rationCard: initCardState(person?.rationCard), voterID: initCardState(person?.voterID),
        drivingLicense: initCardState(person?.drivingLicense), rcCard: initCardState(person?.rcCard),
        passport: initCardState(person?.passport),
      });
      setExpandedCards(new Set());
    }
  }, [open, person]);

  const toggleCard = (key: CardKey) => setExpandedCards((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const updateCardNumber = (key: CardKey, value: string) => setCards((p) => ({ ...p, [key]: { ...p[key], cardNumber: value } }));
  const handleFileReady = (key: CardKey, side: "front" | "back", file: File | null, previewUrl: string | null) => {
    setCards((p) => ({
      ...p,
      [key]: {
        ...p[key],
        ...(side === "front" ? { frontFile: file, frontPreview: previewUrl } : { backFile: file, backPreview: previewUrl }),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dateOfBirth.trim() || !door.trim() || !street.trim() || !city || !state || !pincode.trim()) {
      toast.error("All personal info fields are required"); return;
    }
    if (mode === "create" && !personId) {
      toast.error("Enter pincode and date of birth to generate Person ID"); return;
    }
    const address = `${door.trim()}, ${street.trim()}, ${city}, ${state}, ${pincode.trim()}`;
    setIsSubmitting(true);
    try {
      const cardEntries = await Promise.all(CARD_FIELDS.map(async ({ key }) => {
        const state = cards[key];
        if (!state.cardNumber.trim()) return [key, null] as const;
        let photoFrontUrl = state.existingFrontUrl;
        let photoBackUrl = state.existingBackUrl;
        if (state.frontFile) {
          const result = await uploadImage.mutateAsync(state.frontFile);
          photoFrontUrl = result.url;
        }
        if (state.backFile) {
          const result = await uploadImage.mutateAsync(state.backFile);
          photoBackUrl = result.url;
        }
        return [key, { cardNumber: state.cardNumber.trim(), photoFrontUrl, photoBackUrl }] as const;
      }));

      const personData: Person = {
        personId: personId.trim(), name: name.trim(), dateOfBirth: dateOfBirth.trim(), address: address,
        ...Object.fromEntries(cardEntries),
      } as Person;

      if (mode === "create") {
        await createPerson.mutateAsync(personData);
        toast.success(`${name} added successfully`);
      } else if (person) {
        await updatePerson.mutateAsync({ personId: person.personId, person: personData });
        toast.success(`${name} updated successfully`);
      }
      onOpenChange(false);
    } catch {
      toast.error(mode === "create" ? "Failed to add person" : "Failed to update person");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filledCardCount = CARD_FIELDS.filter(({ key }) => cards[key].cardNumber.trim()).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl bg-background border-border p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <SheetTitle className="font-display text-xl">{mode === "create" ? "Add New Person" : `Edit — ${person?.name}`}</SheetTitle>
          <SheetDescription className="text-muted-foreground text-sm">
            {mode === "create" ? "Create a new identity record with associated ID cards." : "Update the identity record and associated ID cards."}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <form id="person-form" onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="p-name" className="text-xs text-muted-foreground uppercase tracking-wider">Full Name <span className="text-destructive">*</span></Label>
                    <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rajesh Kumar" className="bg-card border-border focus:border-primary" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-id" className="text-xs text-muted-foreground uppercase tracking-wider">Person ID</Label>
                    <div className={`h-10 px-3 flex items-center rounded border id-number text-sm ${personId ? "border-primary/30 bg-primary/5 text-primary" : "border-border bg-muted/30 text-muted-foreground"}`}>
                      {personId || (mode === "create" ? "Auto-generated from pincode + DOB" : person?.personId)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-dob" className="text-xs text-muted-foreground uppercase tracking-wider">Date of Birth <span className="text-destructive">*</span></Label>
                    <Input id="p-dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="bg-card border-border focus:border-primary" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-door" className="text-xs text-muted-foreground uppercase tracking-wider">Door / Flat No <span className="text-destructive">*</span></Label>
                    <Input id="p-door" value={door} onChange={(e) => setDoor(e.target.value)} placeholder="e.g. 12B, Flat 3" className="bg-card border-border focus:border-primary" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-street" className="text-xs text-muted-foreground uppercase tracking-wider">Street <span className="text-destructive">*</span></Label>
                    <Input id="p-street" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="e.g. MG Road" className="bg-card border-border focus:border-primary" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">State <span className="text-destructive">*</span></Label>
                    <Select value={state} onValueChange={(v) => { setState(v); setCity(""); }}>
                      <SelectTrigger className="bg-card border-border focus:border-primary">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border max-h-60">
                        {INDIA_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">City <span className="text-destructive">*</span></Label>
                    <Select value={city} onValueChange={setCity} disabled={!state}>
                      <SelectTrigger className="bg-card border-border focus:border-primary">
                        <SelectValue placeholder={state ? "Select city" : "Select state first"} />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border max-h-60">
                        {getCitiesForState(state).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-pin" className="text-xs text-muted-foreground uppercase tracking-wider">Pincode <span className="text-destructive">*</span></Label>
                    <Input id="p-pin" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="e.g. 600001" maxLength={6} className="bg-card border-border focus:border-primary id-number" required />
                  </div>
                </div>
              </section>
              <Separator className="bg-border" />
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Identity Cards</h3>
                  <span className="text-xs text-primary">{filledCardCount} filled</span>
                </div>
                <div className="space-y-2">
                  {CARD_FIELDS.map(({ key, label }) => {
                    const isExpanded = expandedCards.has(key);
                    const state = cards[key];
                    const isFilled = state.cardNumber.trim() || state.frontPreview || state.backPreview;
                    return (
                      <div key={key} className={`border rounded transition-colors ${isFilled ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
                        <button type="button" onClick={() => toggleCard(key)} className="w-full flex items-center justify-between px-4 py-3 text-left">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${isFilled ? "bg-primary" : "bg-muted-foreground/30"}`} />
                            <span className="text-sm font-medium text-foreground">{label}</span>
                            {isFilled && <span className="id-number text-xs text-primary truncate max-w-[120px]">{state.cardNumber}</span>}
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-4">
                            <Separator className="bg-border" />
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Card Number</Label>
                              <Input value={state.cardNumber} onChange={(e) => updateCardNumber(key, e.target.value)} placeholder={`Enter ${label} number`} className="bg-background border-border focus:border-primary id-number" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <CardPhotoUpload label="Front" currentPhotoUrl={state.existingFrontUrl ?? undefined} onFileReady={(file, url) => handleFileReady(key, "front", file, url)} />
                              <CardPhotoUpload label="Back" currentPhotoUrl={state.existingBackUrl ?? undefined} onFileReady={(file, url) => handleFileReady(key, "back", file, url)} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </form>
          </ScrollArea>
        </div>
        <SheetFooter className="px-6 py-4 border-t border-border shrink-0 flex gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border text-muted-foreground hover:text-foreground flex-1" disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" form="person-form" disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1">
            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{mode === "create" ? "Adding..." : "Saving..."}</> : mode === "create" ? "Add Person" : "Save Changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
