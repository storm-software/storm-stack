@0xb0bae18d761b8e6e;

using import "../../core/schemas/reflection.capnp".SerializedType;

struct TypeDefinition {
  file @0 :Text;
  name @1 :Text;  # optional, use empty string if not provided
}

struct CommandEntry {
  file @0 :Text;
  input @1 :TypeDefinition;
  output @2 :Text;
  path @3 :List(Text);
  isVirtual @4 :Bool;
}

struct CommandPayloadArg {
  type @0 :List(SerializedType);
  options @1 :List(Text);
  isNegative @2 :Bool;
}

struct CommandPayload {
  name @0 :Text;
  importPath @1 :Text;
  args @2 :List(CommandPayloadArg);
}

struct CommandTree {
  commandId @0 :Text;
  type @1 :List(SerializedType);
  entry @2 :CommandEntry;
  children @3 :List(ChildCommand);

  struct ChildCommand {
    name @0 :Text;
    value @1 :CommandTreeBranch;
  }
}

struct CommandTreeBranch {
  commandId @0 :Text;
  type @1 :List(SerializedType);
  entry @2 :CommandEntry;
  payload @3 :CommandPayload;
  parent :union {
    root @4 :CommandTree;
    branch @5 :CommandTreeBranch;
  }
  children @6 :List(ChildCommand);

  struct ChildCommand {
    name @0 :Text;
    value @1 :CommandTreeBranch;
  }
}


