
@0x8f6f7e9a0f7b094a;

# Cap'n Proto schema for configuration reflection
# This schema defines the structure for reflecting configuration settings
struct ConfigReflection {
  kind @0 :UInt8;
  name @1 :Text;
  description @2 :Text;
  optional @3 :Bool;
  default @4 :Data;
  origin @5 :UInt8;
  type @6 :UInt8;
  tags @7 :List(TagsReflection);

  struct TagsReflection {
    alias @0 :List(Text);
    title @1 :Text;
    hidden @2 :Bool;
    readonly @3 :Bool;
    ignore @4 :Bool;
    internal @5 :Bool;
    permission @6 :List(Text);
    domain @7 :Text;
  }
}

# Interface for managing configuration reflection
interface ConfigReflectionManager {
  write @0 (configs :List(ConfigReflection)) -> ();
}
