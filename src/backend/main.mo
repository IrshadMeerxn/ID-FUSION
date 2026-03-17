import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  public type UserRole = AccessControl.UserRole;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Custom role types for ID Fusion app
  public type IDFusionRole = {
    #admin;
    #general;
    #rto;
    #passport;
    #voter;
  };

  public type UserProfile = {
    name : Text;
    idFusionRole : IDFusionRole;
  };

  public type Card = {
    cardNumber : Text;
    photo : Storage.ExternalBlob;
  };

  public type Person = {
    personId : Text;
    name : Text;
    dateOfBirth : Text;
    address : Text;
    rationCard : ?Card;
    aadhaarCard : ?Card;
    voterID : ?Card;
    panCard : ?Card;
    drivingLicense : ?Card;
    rcCard : ?Card;
    passport : ?Card;
  };

  public type PersonView = {
    #adminView : Person;
    #generalView : {
      personId : Text;
      name : Text;
      dateOfBirth : Text;
      address : Text;
      rationCard : ?Card;
      aadhaarCard : ?Card;
      panCard : ?Card;
    };
    #rtoView : {
      personId : Text;
      name : Text;
      dateOfBirth : Text;
      address : Text;
      drivingLicense : ?Card;
      rcCard : ?Card;
    };
    #passportView : {
      personId : Text;
      name : Text;
      dateOfBirth : Text;
      address : Text;
      passport : ?Card;
    };
    #voterView : {
      personId : Text;
      name : Text;
      dateOfBirth : Text;
      address : Text;
      voterID : ?Card;
    };
  };

  let persons = Map.empty<Text, Person>();
  let uploadedImages = Map.empty<Text, Storage.ExternalBlob>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management — no auth checks (app uses frontend username/password auth)
  public query func getCallerUserProfile() : async ?UserProfile {
    null
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared func saveCallerUserProfile(_profile : UserProfile) : async () {
    // No-op: profiles are managed on the frontend via localStorage
  };

  // Admin functions — no caller auth checks (auth is frontend-only)
  public shared func createPerson(person : Person) : async () {
    if (persons.containsKey(person.personId)) {
      Runtime.trap("Person already exists");
    };
    persons.add(person.personId, person);
  };

  public shared func updatePerson(personId : Text, updatedPerson : Person) : async () {
    if (not persons.containsKey(personId)) {
      Runtime.trap("Person does not exist");
    };
    persons.add(personId, updatedPerson);
  };

  public shared func deletePerson(personId : Text) : async () {
    if (not persons.containsKey(personId)) {
      Runtime.trap("Person does not exist");
    };
    persons.remove(personId);
  };

  public query func listPersons() : async [Person] {
    persons.values().toArray();
  };

  public query func searchPersonsByName(searchTerm : Text) : async [Person] {
    let results = List.empty<Person>();
    for (person in persons.values()) {
      if (person.name.contains(#text searchTerm)) {
        results.add(person);
      };
    };
    results.toArray();
  };

  // Role-based view — caller passes their role; no server-side auth check
  public query func getPerson(personId : Text) : async PersonView {
    switch (persons.get(personId)) {
      case (null) { Runtime.trap("Person does not exist") };
      case (?person) {
        // Return full admin view — role filtering is enforced on the frontend
        #adminView(person)
      };
    };
  };

  // Image upload/retrieval — no auth check
  public shared func uploadImage(key : Text, blob : Storage.ExternalBlob) : async () {
    uploadedImages.add(key, blob);
  };

  public query func getUploadedImage(key : Text) : async ?Storage.ExternalBlob {
    uploadedImages.get(key);
  };
};
