import { ApiSession } from "../ApiSession";
import { LiveEntity } from "../live/LiveEntity";

export type ArgumentsForUpload = {
    session: ApiSession,
    args: any[]
};

export interface UploadableEntity<T extends LiveEntity<R, I>, R = any, I = any> {
    get nameOfUpload(): string;

    uploadTo({ session, args }: ArgumentsForUpload): Promise<T>
}
