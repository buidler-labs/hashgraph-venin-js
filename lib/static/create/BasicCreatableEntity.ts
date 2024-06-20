import {
  ArgumentsForCreate,
  CreatableEntity,
} from "../../core/CreatableEntity";
import { HederaEntityId, LiveEntity } from "../../live/LiveEntity";

export abstract class BasicCreatableEntity<
  T extends LiveEntity<R, I, P>,
  R extends HederaEntityId = any,
  I = any,
  P = any
> implements CreatableEntity<T, R>
{
  protected constructor(public readonly name: string) {}

  public abstract createVia({ session }: ArgumentsForCreate): Promise<T>;
}
