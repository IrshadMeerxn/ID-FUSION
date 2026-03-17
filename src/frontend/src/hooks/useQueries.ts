import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../api";
import type { IDFusionRole, Person } from "../api";

// ── Persons ───────────────────────────────────────────────────────────────────

export function useListPersons(search?: string) {
  return useQuery<Person[]>({
    queryKey: ["persons", search ?? ""],
    queryFn: () => api.listPersons(search),
  });
}

export function useSearchPersons(searchTerm: string) {
  return useQuery<Person[]>({
    queryKey: ["persons", searchTerm],
    queryFn: () => api.listPersons(searchTerm || undefined),
  });
}

export function useGetPerson(personId: string | null, role?: IDFusionRole) {
  return useQuery({
    queryKey: ["person", personId, role],
    queryFn: async () => {
      if (!personId) return null;
      const person = await api.getPerson(personId);
      return filterPersonByRole(person, role);
    },
    enabled: !!personId,
  });
}

export function useCreatePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (person: Person) => api.createPerson(person),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["persons"] }),
  });
}

export function useUpdatePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ personId, person }: { personId: string; person: Partial<Person> }) =>
      api.updatePerson(personId, person),
    onSuccess: (_, { personId }) => {
      qc.invalidateQueries({ queryKey: ["persons"] });
      qc.invalidateQueries({ queryKey: ["person", personId] });
    },
  });
}

export function useDeletePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (personId: string) => api.deletePerson(personId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["persons"] }),
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => api.uploadImage(file),
  });
}

// ── Credentials ───────────────────────────────────────────────────────────────

export function useListCredentials() {
  return useQuery({ queryKey: ["credentials"], queryFn: api.listCredentials });
}

export function useCreateCredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ username, password, role }: { username: string; password: string; role: IDFusionRole }) =>
      api.createCredential(username, password, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["credentials"] }),
  });
}

export function useUpdateCredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, username, password }: { id: string; username: string; password: string }) =>
      api.updateCredential(id, username, password),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["credentials"] }),
  });
}

export function useDeleteCredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCredential(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["credentials"] }),
  });
}

// ── Role filtering (frontend) ─────────────────────────────────────────────────

function filterPersonByRole(person: Person, role?: IDFusionRole) {
  if (!role || role === "admin") return { __kind__: "adminView" as const, adminView: person };
  if (role === "general") return {
    __kind__: "generalView" as const,
    generalView: { personId: person.personId, name: person.name, dateOfBirth: person.dateOfBirth, address: person.address, rationCard: person.rationCard, aadhaarCard: person.aadhaarCard, panCard: person.panCard },
  };
  if (role === "rto") return {
    __kind__: "rtoView" as const,
    rtoView: { personId: person.personId, name: person.name, dateOfBirth: person.dateOfBirth, address: person.address, drivingLicense: person.drivingLicense, rcCard: person.rcCard },
  };
  if (role === "passport") return {
    __kind__: "passportView" as const,
    passportView: { personId: person.personId, name: person.name, dateOfBirth: person.dateOfBirth, address: person.address, passport: person.passport },
  };
  if (role === "voter") return {
    __kind__: "voterView" as const,
    voterView: { personId: person.personId, name: person.name, dateOfBirth: person.dateOfBirth, address: person.address, voterID: person.voterID },
  };
  return { __kind__: "adminView" as const, adminView: person };
}
