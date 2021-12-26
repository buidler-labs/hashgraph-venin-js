import {
    expect, describe, it,
} from '@jest/globals';

import { Json } from '../lib/static/Json';

describe('Json', () => {
    it("given a JSON object that has keys starting with the underscore (_) character, creating an instance should error out", async () => {
        expect(() => new Json({ _a: 0 })).toThrow();
    });

    it("given a JSON object that has reserved keys, creating an instance should error out", async () => {
        expect(() => new Json({ id: 0 })).toThrow();
    });

    it("given a valid JSON object that obeys the Json class-creation constraints, creating an instance should work", async () => {
        expect(() => new Json({ a: 1, b: { c: 2 } })).not.toThrow();
    });
});