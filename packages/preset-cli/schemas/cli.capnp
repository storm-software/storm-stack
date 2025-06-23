@0xb0bae18d761b8e6e;

using import "../../core/schemas/reflection.capnp".SerializedType;

struct TypeDefinition {
  file @0 :Text;
  name @1 :Text;
}

struct CommandEntryTypeDefinition {
  title @0 :Text;
  description @1 :Text;
  file @2 :Text;
  input @3 :TypeDefinition;
  output @4 :Text;
  path @5 :List(Text);
  isVirtual @6 :Bool;
}

struct CommandPayload {
  import @0 :TypeDefinition;
  type @1 :List(SerializedType);
  args @2 :List(CommandPayloadArg);

  struct CommandPayloadArg {
    name @0 :Text;
    isNegativeOf @1 :Text;
    skipNegative @2 :Bool;
  }
}

struct CommandRoot {
  description @0 :Text;
  entry @1 :CommandEntryTypeDefinition;
  commands @2 :List(Command);
}

struct Command {
  id @0 :Text;
  name @1 :Text;
  title @2 :Text;
  type @3 :List(SerializedType);
  entry @4 :CommandEntryTypeDefinition;
  payload @5 :CommandPayload;
  parent @6 :Text;
  children @7 :List(Text);
}


