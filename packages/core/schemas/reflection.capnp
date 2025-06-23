@0xae3c363dcecf2729;

using TypeId = UInt32;

enum ReflectionKind {
  never @0;
  any @1;
  unknown @2;
  void @3;
  object @4;
  string @5;
  number @6;
  boolean @7;
  symbol @8;
  bigint @9;
  null @10;
  undefined @11;
  regexp @12;
  literal @13;
  templateLiteral @14;
  property @15;
  method @16;
  function @17;
  parameter @18;
  promise @19;
  class @20;
  typeParameter @21;
  enum @22;
  union @23;
  intersection @24;
  array @25;
  tuple @26;
  tupleMember @27;
  enumMember @28;
  rest @29;
  objectLiteral @30;
  indexSignature @31;
  propertySignature @32;
  methodSignature @33;
  infer @34;
  callSignature @35;
}

enum ReflectionVisibility {
  public @0;
  protected @1;
  private @2;
}

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

struct DefaultValueReflection {
  value :union {
    undefined @0 :Void;
    boolean @1 :Bool;
    integer @2 :Int32;
    float @3 :Float64;
    string @4 :Text;
  }
}

struct SerializedTypeReference {
  id @0 :TypeId;
}

struct IndexAccessOrigin {
  container @0 :SerializedTypeReference;
  index @1 :SerializedTypeReference;
}

struct EntityOptions {
  struct EntityIndexOptions {
    names @0 :List(Text);
    options @1 :Text; # JSON stringified options
  }

  name @0 :Text;
  description @1 :Text;
  collection @2 :Text;
  database @3 :Text;
  singleTableInheritance @4 :Bool;
  indexes @5 :List(EntityIndexOptions);
}

struct SerializedTypeObjectLiteral {
  typeName @0 :Text;
  typeArguments @1 :List(SerializedTypeReference);
  indexAccessOrigin @2 :IndexAccessOrigin;
  decorators @3 :List(SerializedTypeReference);
  kind @4 :ReflectionKind;
  types @5 :List(SerializedTypeReference);
  tags @6 :TagsReflection;
}

struct SerializedTypeClassType {
  typeName @0 :Text;
  typeArguments @1 :List(SerializedTypeReference);
  indexAccessOrigin @2 :IndexAccessOrigin;
  decorators @3 :List(SerializedTypeReference);
  kind @4 :ReflectionKind;
  name @5 :Text;
  globalObject @6 :Bool;
  classType @7 :Text;
  extendsArguments @8 :List(SerializedTypeReference);
  arguments @9 :List(SerializedTypeReference);
  superClass @10 :SerializedTypeReference;
  types @11 :List(SerializedTypeReference);
  tags @12 :TagsReflection;
}

struct SerializedTypeParameter {
  typeName @0 :Text;
  typeArguments @1 :List(SerializedTypeReference);
  indexAccessOrigin @2 :IndexAccessOrigin;
  decorators @3 :List(SerializedTypeReference);
  kind @4 :ReflectionKind;
  name @5 :Text;
  type @6 :SerializedTypeReference;
  visibility @7 :ReflectionVisibility;
  readonly @8 :Bool;
  optional @9 :Bool;
  default @10 :DefaultValueReflection;
  tags @11 :TagsReflection;
}

struct SerializedTypeMethod {
  typeName @0 :Text;
  typeArguments @1 :List(SerializedTypeReference);
  indexAccessOrigin @2 :IndexAccessOrigin;
  decorators @3 :List(SerializedTypeReference);
  visibility @4 :ReflectionVisibility;
  abstract @5 :Bool;
  optional @6 :Bool;
  readonly @7 :Bool;
  tags @8 :TagsReflection;
  kind @9 :ReflectionKind;
  name @10 :Text;
  parameters @11 :List(SerializedTypeParameter);
  return @12 :SerializedTypeReference;
}

struct SerializedTypeProperty {
  typeName @0 :Text;
  typeArguments @1 :List(SerializedTypeReference);
  indexAccessOrigin @2 :IndexAccessOrigin;
  decorators @3 :List(SerializedTypeReference);
  visibility @4 :ReflectionVisibility;
  abstract @5 :Bool;
  optional @6 :Bool;
  readonly @7 :Bool;
  tags @8 :TagsReflection;
  kind @9 :ReflectionKind;
  name @10 :Text;
  description @11 :Text;
  type @12 :SerializedTypeReference;
  default @13 :DefaultValueReflection;
}

struct SerializedTypeFunction {
  typeName @0 :Text;
  typeArguments @1 :List(SerializedTypeReference);
  indexAccessOrigin @2 :IndexAccessOrigin;
  decorators @3 :List(SerializedTypeReference);
  visibility @4 :ReflectionVisibility;
  abstract @5 :Bool;
  optional @6 :Bool;
  readonly @7 :Bool;
  tags @8 :TagsReflection;
  kind @9 :ReflectionKind;
  name @10 :Text;
  parameters @11 :List(SerializedTypeParameter);
  return @12 :SerializedTypeReference;
}

struct SerializedTypePromise {
  typeName @0 :Text;
  typeArguments @1 :List(SerializedTypeReference);
  indexAccessOrigin @2 :IndexAccessOrigin;
  decorators @3 :List(SerializedTypeReference);
  visibility @4 :ReflectionVisibility;
  abstract @5 :Bool;
}

struct SerializedTypeEnumEntry {
  name @0 :Text;
  value @1 :Text;
}

struct SerializedTypeEnum {
  typeName @0 :Text;
  typeArguments @1 :List(SerializedTypeReference);
  indexAccessOrigin @2 :IndexAccessOrigin;
  decorators @3 :List(SerializedTypeReference);
  kind @4 :ReflectionKind;
  enumEntries @5 :List(SerializedTypeEnumEntry);
  values @6 :List(Text);
  indexType @7 :SerializedTypeReference;
  tags @8 :TagsReflection;
}

struct SerializedTypeUnion {
  typeName @0 :Text;
  typeArguments @1 :List(SerializedTypeReference);
  indexAccessOrigin @2 :IndexAccessOrigin;
  decorators @3 :List(SerializedTypeReference);
  kind @4 :ReflectionKind;
  types @5 :List(SerializedTypeReference);
}

struct SerializedTypeIntersection {
  typeName @0 :Text;
  typeArguments @1 :List(SerializedTypeReference);
  indexAccessOrigin @2 :IndexAccessOrigin;
  decorators @3 :List(SerializedTypeReference);
  kind @4 :ReflectionKind;
  types @5 :List(SerializedTypeReference);
}

struct SerializedTypeArray {
  typeName @0 :Text;
  typeArguments @1 :List(SerializedTypeReference);
  indexAccessOrigin @2 :IndexAccessOrigin;
  decorators @3 :List(SerializedTypeReference);
  kind @4 :ReflectionKind;
  type @5 :SerializedTypeReference;
  tags @6 :TagsReflection;
}

struct SerializedTypeIndexSignature {
  typeName @0 :Text;
  typeArguments @1 :List(SerializedTypeReference);
  indexAccessOrigin @2 :IndexAccessOrigin;
  decorators @3 :List(SerializedTypeReference);
  kind @4 :ReflectionKind;
  index @5 :SerializedTypeReference;
  type @6 :SerializedTypeReference;
}

struct SerializedTypePropertySignature {
  typeName @0 :Text;
  typeArguments @1 :List(SerializedTypeReference);
  indexAccessOrigin @2 :IndexAccessOrigin;
  decorators @3 :List(SerializedTypeReference);
  kind @4 :ReflectionKind;
  name @5 :Text;
  optional @6 :Bool;
  readonly @7 :Bool;
  description @8 :Text;
  default  @9 :DefaultValueReflection;
  type @10 :SerializedTypeReference;
  tags @11 :TagsReflection;
}

struct SerializedTypeMethodSignature {
  typeName @0 :Text;
  typeArguments @1 :List(SerializedTypeReference);
  indexAccessOrigin @2 :IndexAccessOrigin;
  decorators @3 :List(SerializedTypeReference);
  kind @4 :ReflectionKind;
  name @5 :Text;
  optional @6 :Bool;
  parameters @7 :List(SerializedTypeParameter);
  return @8 :SerializedTypeReference;
  tags @9 :TagsReflection;
}

struct SerializedTypeTypeParameter {
  typeName @0 :Text;
  typeArguments @1 :List(SerializedTypeReference);
  indexAccessOrigin @2 :IndexAccessOrigin;
  decorators @3 :List(SerializedTypeReference);
  kind @4 :ReflectionKind;
  name @5 :Text;
}

struct SerializedTypeInfer {
  typeName @0 :Text;
  typeArguments @1 :List(SerializedTypeReference);
  indexAccessOrigin @2 :IndexAccessOrigin;
  decorators @3 :List(SerializedTypeReference);
  kind @4 :ReflectionKind;
}

struct SerializedTypeTupleMember {
  typeName @0 :Text;
  typeArguments @1 :List(SerializedTypeReference);
  indexAccessOrigin @2 :IndexAccessOrigin;
  decorators @3 :List(SerializedTypeReference);
  kind @4 :ReflectionKind;
  type @5 :SerializedTypeReference;
  optional @6 :Bool;
  name @7 :Text;
}

struct SerializedTypeTuple {
  typeName @0 :Text;
  typeArguments @1 :List(SerializedTypeReference);
  indexAccessOrigin @2 :IndexAccessOrigin;
  decorators @3 :List(SerializedTypeReference);
  kind @4 :ReflectionKind;
  types @5 :List(SerializedTypeTupleMember);
}

struct SerializedTypeRest {
  typeName @0 :Text;
  typeArguments @1 :List(SerializedTypeReference);
  indexAccessOrigin @2 :IndexAccessOrigin;
  decorators @3 :List(SerializedTypeReference);
  kind @4 :ReflectionKind;
  type @5 :SerializedTypeReference;
}

struct SimpleSerializedType {
  typeName @0 :Text;
  typeArguments @1 :List(SerializedTypeReference);
  indexAccessOrigin @2 :IndexAccessOrigin;
  decorators @3 :List(SerializedTypeReference);
  kind @4 :ReflectionKind;
  origin @5 :SerializedTypeReference;
}

struct SerializedTypeLiteralSymbol {
  type @0 :Text; # "symbol"
  name @1 :Text;
}

struct SerializedTypeLiteralBigInt {
  type @0 :Text; # "bigint"
  value @1 :Text;
}

struct SerializedTypeLiteralRegex {
  type @0 :Text; # "regex"
  regex @1 :Text;
}

struct SerializedTypeLiteral {
  typeName @0 :Text;
  typeArguments @1 :List(SerializedTypeReference);
  indexAccessOrigin @2 :IndexAccessOrigin;
  decorators @3 :List(SerializedTypeReference);
  kind @4 :ReflectionKind;
  literal :union {
    symbol @5 :SerializedTypeLiteralSymbol;
    string @6 :Text;
    number @7 :Float64;
    boolean @8 :Bool;
    bigint @9 :SerializedTypeLiteralBigInt;
    regex @10 :SerializedTypeLiteralRegex;
  }
}

struct SerializedTypeTemplateLiteral {
  typeName @0 :Text;
  typeArguments @1 :List(SerializedTypeReference);
  indexAccessOrigin @2 :IndexAccessOrigin;
  decorators @3 :List(SerializedTypeReference);
  kind @4 :ReflectionKind;
  types @5 :List(SerializedTypeReference);
}

struct SerializedTypeOther {
  typeName @0 :Text;
  kind @1 :ReflectionKind;
}

struct SerializedType {
  type :union {
    simple @0 :SimpleSerializedType;
    literal @1 :SerializedTypeLiteral;
    templateLiteral @2 :SerializedTypeTemplateLiteral;
    parameter @3 :SerializedTypeParameter;
    function @4 :SerializedTypeFunction;
    method @5 :SerializedTypeMethod;
    property @6 :SerializedTypeProperty;
    promise @7 :SerializedTypePromise;
    classType @8 :SerializedTypeClassType;
    enum @9 :SerializedTypeEnum;
    union @10 :SerializedTypeUnion;
    intersection @11 :SerializedTypeIntersection;
    array @12 :SerializedTypeArray;
    objectLiteral @13 :SerializedTypeObjectLiteral;
    indexSignature @14 :SerializedTypeIndexSignature;
    propertySignature @15 :SerializedTypePropertySignature;
    methodSignature @16 :SerializedTypeMethodSignature;
    typeParameter @17 :SerializedTypeTypeParameter;
    infer @18 :SerializedTypeInfer;
    tuple @19 :SerializedTypeTuple;
    tupleMember @20 :SerializedTypeTupleMember;
    rest @21 :SerializedTypeRest;
    other @22 :SerializedTypeOther; # For any other type that is not explicitly defined
  }
}

struct SerializedTypes {
  types @0 :List(SerializedType);
}
