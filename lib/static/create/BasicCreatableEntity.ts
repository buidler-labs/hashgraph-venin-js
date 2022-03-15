import { ArgumentsForCreate, CreatableEntity } from "../../core/CreatableEntity";
import { LiveEntity } from "../../live/LiveEntity";

export abstract class BasicCreatableEntity<T extends LiveEntity<R, I>, R = any, I = any> implements CreatableEntity<T, R> {
  protected constructor(public readonly name: string) {}
  
  public abstract createVia({ session: ApiSession }: ArgumentsForCreate): Promise<T>;
}
