import { ApiSession } from "../ApiSession";
import { LiveEntity } from "../live/LiveEntity";

export type ArgumentsForCreate = {
  session: ApiSession
};

export interface CreatableEntity<T extends LiveEntity<R, I>, R = any, I = any> {
  get name(): string;
    
  createVia({ session: ApiSession }: ArgumentsForCreate): Promise<T>
}
