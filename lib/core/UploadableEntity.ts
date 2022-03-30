import { ApiSession } from "../ApiSession";
import { LiveEntity } from "../live/LiveEntity";

export type ArgumentsForUpload = {
    session: ApiSession,
    args: any[]
};

export interface UploadableEntity<T extends LiveEntity<R, I, P>, R = any, I = any, P = any> {
    get nameOfUpload(): string;

    uploadTo({ session, args }: ArgumentsForUpload): Promise<T>
}
