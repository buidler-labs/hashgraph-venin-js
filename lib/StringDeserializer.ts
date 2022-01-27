export interface StringDeserializer<T> {
    deserialize(state: string): T;
}