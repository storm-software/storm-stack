import { TsServerBuildExecutorSchema } from "./schema";
import executor from "./executor";

const options: TsServerBuildExecutorSchema = {};

describe("TsServerBuild Executor", () => {
  it("can run", async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});
