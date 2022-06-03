import { HederaEntityId, LiveEntity } from "../live/LiveEntity";
import { ApiSession } from "../ApiSession";

export type ArgumentsForCreate = {
  session: ApiSession;
};

export interface CreatableEntity<
  T extends LiveEntity<R, I, P>,
  R extends HederaEntityId = any,
  I = any,
  P = any
> {
  get name(): string;

  createVia({ session: ApiSession }: ArgumentsForCreate): Promise<T>;
}
