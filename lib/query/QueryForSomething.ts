import { Client } from "@hashgraph/sdk";

export abstract class QueryForSomething<T> {
    public abstract queryOn(client: Client): Promise<T>;
}