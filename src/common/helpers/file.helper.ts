import * as fs from 'fs/promises';
import * as path from 'path';

export class FileHelper {
    static async deleteFile(fileUrl: string): Promise<void> {
        if (!fileUrl) return;

        try {
            const relativePath = fileUrl.startsWith('/')
                ? fileUrl.slice(1)
                : fileUrl;
            const fullPath = path.join(process.cwd(), relativePath);

            await fs.access(fullPath);
            await fs.unlink(fullPath);
        } catch (error) {
            console.log(error);
        }
    }
}
