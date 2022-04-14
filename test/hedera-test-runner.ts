import type { TestFileEvent, TestResult } from '@jest/test-result';
import type { Config } from '@jest/types';
import type { JestEnvironment } from '@jest/environment';
import type Runtime from 'jest-runtime';
import { default as runOnCircus } from 'jest-circus/runner';

export default async function hederaTestRunner(
  globalConfig: Config.GlobalConfig,
  config: Config.ProjectConfig,
  environment: JestEnvironment,
  runtime: Runtime,
  testPath: string,
  sendMessageToJest?: TestFileEvent
): Promise<TestResult> {
  const circusRunResult = await runOnCircus(
    globalConfig,
    config,
    environment,
    runtime,
    testPath,
    sendMessageToJest
  );
  const shouldRerun =
    circusRunResult.testResults.find(
      (result) =>
        result.status === 'failed' &&
        result.failureMessages
          .join('')
          .includes('failed precheck with status TRANSACTION_EXPIRED')
    ) !== undefined;

  if (shouldRerun) {
    return hederaTestRunner(
      globalConfig,
      config,
      environment,
      runtime,
      testPath,
      sendMessageToJest
    );
  }
  return circusRunResult;
}
