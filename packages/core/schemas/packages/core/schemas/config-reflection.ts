/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import * as $ from "capnp-es";
export const _capnpFileId = BigInt("0x8f6f7e9a0f7b094a");
export class ConfigReflection_TagsReflection extends $.Struct {
  static readonly _capnp = {
    displayName: "TagsReflection",
    id: "af0753b828de1b82",
    size: new $.ObjectSize(8, 4)
  };

  _adoptAlias(value: $.Orphan<$.List<string>>): void {
    $.utils.adopt(value, $.utils.getPointer(0, this));
  }

  _disownAlias(): $.Orphan<$.List<string>> {
    return $.utils.disown(this.alias);
  }

  get alias(): $.List<string> {
    return $.utils.getList(0, $.TextList, this);
  }

  _hasAlias(): boolean {
    return !$.utils.isNull($.utils.getPointer(0, this));
  }

  _initAlias(length: number): $.List<string> {
    return $.utils.initList(0, $.TextList, length, this);
  }

  set alias(value: $.List<string>) {
    $.utils.copyFrom(value, $.utils.getPointer(0, this));
  }

  get title(): string {
    return $.utils.getText(1, this);
  }

  set title(value: string) {
    $.utils.setText(1, value, this);
  }

  get hidden(): boolean {
    return $.utils.getBit(0, this);
  }

  set hidden(value: boolean) {
    $.utils.setBit(0, value, this);
  }

  get readonly(): boolean {
    return $.utils.getBit(1, this);
  }

  set readonly(value: boolean) {
    $.utils.setBit(1, value, this);
  }

  get ignore(): boolean {
    return $.utils.getBit(2, this);
  }

  set ignore(value: boolean) {
    $.utils.setBit(2, value, this);
  }

  get internal(): boolean {
    return $.utils.getBit(3, this);
  }

  set internal(value: boolean) {
    $.utils.setBit(3, value, this);
  }

  _adoptPermission(value: $.Orphan<$.List<string>>): void {
    $.utils.adopt(value, $.utils.getPointer(2, this));
  }

  _disownPermission(): $.Orphan<$.List<string>> {
    return $.utils.disown(this.permission);
  }

  get permission(): $.List<string> {
    return $.utils.getList(2, $.TextList, this);
  }

  _hasPermission(): boolean {
    return !$.utils.isNull($.utils.getPointer(2, this));
  }

  _initPermission(length: number): $.List<string> {
    return $.utils.initList(2, $.TextList, length, this);
  }

  set permission(value: $.List<string>) {
    $.utils.copyFrom(value, $.utils.getPointer(2, this));
  }

  get domain(): string {
    return $.utils.getText(3, this);
  }

  set domain(value: string) {
    $.utils.setText(3, value, this);
  }

  public override toString(): string {
    return `ConfigReflection_TagsReflection_${super.toString()}`;
  }
}
export class ConfigReflection extends $.Struct {
  static readonly TagsReflection = ConfigReflection_TagsReflection;

  public static override readonly _capnp = {
    displayName: "ConfigReflection",
    id: "e1bde72b263ac547",
    size: new $.ObjectSize(8, 4)
  };

  static _Tags: $.ListCtor<ConfigReflection_TagsReflection>;

  get kind(): number {
    return $.utils.getUint8(0, this);
  }

  set kind(value: number) {
    $.utils.setUint8(0, value, this);
  }

  get name(): string {
    return $.utils.getText(0, this);
  }

  set name(value: string) {
    $.utils.setText(0, value, this);
  }

  get description(): string {
    return $.utils.getText(1, this);
  }

  set description(value: string) {
    $.utils.setText(1, value, this);
  }

  get optional(): boolean {
    return $.utils.getBit(8, this);
  }

  set optional(value: boolean) {
    $.utils.setBit(8, value, this);
  }

  _adoptDefault(value: $.Orphan<$.Data>): void {
    $.utils.adopt(value, $.utils.getPointer(2, this));
  }

  _disownDefault(): $.Orphan<$.Data> {
    return $.utils.disown(this.default);
  }

  get default(): $.Data {
    return $.utils.getData(2, this);
  }

  _hasDefault(): boolean {
    return !$.utils.isNull($.utils.getPointer(2, this));
  }

  _initDefault(length: number): $.Data {
    return $.utils.initData(2, length, this);
  }

  set default(value: $.Data) {
    $.utils.copyFrom(value, $.utils.getPointer(2, this));
  }

  get origin(): number {
    return $.utils.getUint8(2, this);
  }

  set origin(value: number) {
    $.utils.setUint8(2, value, this);
  }

  get type(): number {
    return $.utils.getUint8(3, this);
  }

  set type(value: number) {
    $.utils.setUint8(3, value, this);
  }

  _adoptTags(value: $.Orphan<$.List<ConfigReflection_TagsReflection>>): void {
    $.utils.adopt(value, $.utils.getPointer(3, this));
  }

  _disownTags(): $.Orphan<$.List<ConfigReflection_TagsReflection>> {
    return $.utils.disown(this.tags);
  }

  get tags(): $.List<ConfigReflection_TagsReflection> {
    return $.utils.getList(3, ConfigReflection._Tags, this);
  }

  _hasTags(): boolean {
    return !$.utils.isNull($.utils.getPointer(3, this));
  }

  _initTags(length: number): $.List<ConfigReflection_TagsReflection> {
    return $.utils.initList(3, ConfigReflection._Tags, length, this);
  }

  set tags(value: $.List<ConfigReflection_TagsReflection>) {
    $.utils.copyFrom(value, $.utils.getPointer(3, this));
  }

  toString(): string {
    return `ConfigReflection_${super.toString()}`;
  }
}
export class ConfigReflectionManager_Write$Params extends $.Struct {
  static readonly _capnp = {
    displayName: "write$Params",
    id: "ccb5e81d04e8a877",
    size: new $.ObjectSize(0, 1)
  };

  static _Configs: $.ListCtor<ConfigReflection>;

  _adoptConfigs(value: $.Orphan<$.List<ConfigReflection>>): void {
    $.utils.adopt(value, $.utils.getPointer(0, this));
  }

  _disownConfigs(): $.Orphan<$.List<ConfigReflection>> {
    return $.utils.disown(this.configs);
  }

  get configs(): $.List<ConfigReflection> {
    return $.utils.getList(
      0,
      ConfigReflectionManager_Write$Params._Configs,
      this
    );
  }

  _hasConfigs(): boolean {
    return !$.utils.isNull($.utils.getPointer(0, this));
  }

  _initConfigs(length: number): $.List<ConfigReflection> {
    return $.utils.initList(
      0,
      ConfigReflectionManager_Write$Params._Configs,
      length,
      this
    );
  }

  set configs(value: $.List<ConfigReflection>) {
    $.utils.copyFrom(value, $.utils.getPointer(0, this));
  }

  toString(): string {
    return `ConfigReflectionManager_Write$Params_${super.toString()}`;
  }
}
export class ConfigReflectionManager_Write$Results extends $.Struct {
  static readonly _capnp = {
    displayName: "write$Results",
    id: "a10e9d27a010ed8a",
    size: new $.ObjectSize(0, 0)
  };

  toString(): string {
    return `ConfigReflectionManager_Write$Results_${super.toString()}`;
  }
}
export class ConfigReflectionManager_Write$Results$Promise {
  pipeline: $.Pipeline<any, any, ConfigReflectionManager_Write$Results>;

  constructor(
    pipeline: $.Pipeline<any, any, ConfigReflectionManager_Write$Results>
  ) {
    this.pipeline = pipeline;
  }

  async promise(): Promise<ConfigReflectionManager_Write$Results> {
    return this.pipeline.struct();
  }
}
export class ConfigReflectionManager$Client {
  client: $.Client;

  static readonly interfaceId: bigint = BigInt("0x879d1380b5301f7a");

  constructor(client: $.Client) {
    this.client = client;
  }

  static readonly methods: [
    $.Method<
      ConfigReflectionManager_Write$Params,
      ConfigReflectionManager_Write$Results
    >
  ] = [
    {
      ParamsClass: ConfigReflectionManager_Write$Params,
      ResultsClass: ConfigReflectionManager_Write$Results,
      interfaceId: ConfigReflectionManager$Client.interfaceId,
      methodId: 0,
      interfaceName:
        "packages/core/schemas/config-reflection.capnp:ConfigReflectionManager",
      methodName: "write"
    }
  ];

  write(
    paramsFunc?: (params: ConfigReflectionManager_Write$Params) => void
  ): ConfigReflectionManager_Write$Results$Promise {
    const answer = this.client.call({
      method: ConfigReflectionManager$Client.methods[0],
      paramsFunc
    });
    const pipeline = new $.Pipeline(
      ConfigReflectionManager_Write$Results,
      answer
    );

    return new ConfigReflectionManager_Write$Results$Promise(pipeline);
  }
}
$.Registry.register(
  ConfigReflectionManager$Client.interfaceId,
  ConfigReflectionManager$Client
);
export interface ConfigReflectionManager$Server$Target {
  write: (
    params: ConfigReflectionManager_Write$Params,
    results: ConfigReflectionManager_Write$Results
  ) => Promise<void>;
}
export class ConfigReflectionManager$Server extends $.Server {
  public override readonly target: ConfigReflectionManager$Server$Target;

  constructor(target: ConfigReflectionManager$Server$Target) {
    super(target, [
      {
        ...ConfigReflectionManager$Client.methods[0],
        impl: target.write
      }
    ]);
    this.target = target;
  }

  client(): ConfigReflectionManager$Client {
    return new ConfigReflectionManager$Client(this);
  }
}
export class ConfigReflectionManager extends $.Interface {
  static readonly Client = ConfigReflectionManager$Client;

  static readonly Server = ConfigReflectionManager$Server;

  static readonly _capnp = {
    displayName: "ConfigReflectionManager",
    id: "879d1380b5301f7a",
    size: new $.ObjectSize(0, 0)
  };

  toString(): string {
    return `ConfigReflectionManager_${super.toString()}`;
  }
}
ConfigReflection._Tags = $.CompositeList(ConfigReflection_TagsReflection);
ConfigReflectionManager_Write$Params._Configs =
  $.CompositeList(ConfigReflection);
