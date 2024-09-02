import dbClient from "../utils/db";
import { ObjectId } from 'mongodb';
import promisify from 'util';
import {
  mkdir, writeFile, stat, existsSync, realpath,
  writeFileSync,
} from 'fs';
import { join as joinPath } from 'path';
import uuidv4 from 'uuid';

const VALID_FILE_TYPES = {
  folder: 'folder',
  file: 'file',
  image: 'image',
};
const ROOT_FOLDER_ID = 0;
const DEFAULT_ROOT_FOLDER = 'files_manager';
const mkDirAsync = promisify(mkdir);
const writeFileAsync = promisify(writeFile);
const NULL_ID = Buffer.alloc(24, '0').toString('utf-8');
const isValidId = (id) => {
  const size = 24;
  let i = 0;
  const charRanges = [
    [48, 57], // 0 - 9
    [97, 102], // a - f
    [65, 70], // A - F
  ];
  if (typeof id !== 'string' || id.length !== size) {
    return false;
  }
  while (i < size) {
    const c = id[i];
    const code = c.charCodeAt(0);

    if (!charRanges.some((range) => code >= range[0] && code <= range[1])) {
      return false;
    }
    i += 1;
  }
  return true;
};

export default class FilesController {
  /**
   * uploads a file
   * @param {Request} req 
   * @param {Response} res 
   * @returns file 
   */
  static async postUpload(req, res) {
    const { user } = req;
    const name = req.body ? req.body.name : null;
    const type = req.body ? req.body.type : null;
    const parentId = req.body && req.body.parentId ? req.body.parentId : ROOT_FOLDER_ID;
    const isPublic = req.body && req.body.isPublic ? req.body.isPublic : false;
    const base64Data = req.body && req.body.data ? req.body.data : '';

    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!name) {
      res.status(400).json({ error: 'Missing name' });
      return;
    }
    if (!type || !Object.values(VALID_FILE_TYPES).includes(type)) {
      res.status(400).json({ error: 'Missing type'});
      return;
    }
    if (!req.body.data && type != VALID_FILE_TYPES.folder) {
      res.status(400).json({ error: 'Missing data' });
      return;
    }
    if ((parentId !== ROOT_FOLDER_ID) && (parentId !== ROOT_FOLDER_ID.toString())) {
      const file = await (await dbClient.filesCollection())
        .findOne({
          _id: new ObjectId(isValidId(parentId) ? parentId : NULL_ID),
        });
      if (!file) {
        res.status(400).json({ error: 'Parent not found' });
        return;
      }
      if (file.type !== VALID_FILE_TYPES.folder) {
        res.status(400).json({ error: 'Parent is not a folder' });
        return;
      }
      const userId = user._id.toString();
      const baseDir = `${process.env.FOLDER_PATH} || ''`.trim().length > 0
        ? process.env.FOLDER_PATH.trim()
        : joinPath(tmpdir(), DEFAULT_ROOT_FOLDER);

      const newFile = {
        userId: new ObjectId(userId),
        name,
        type,
        isPublic,
        parentId: (parentId === ROOT_FOLDER_ID) || (parentId === ROOT_FOLDER_ID.toString())
          ? '0'
          : new ObjectId(parentId),
      };
      await mkDirAsync(baseDir, { recursive: true });
      if (type !== VALID_FILE_TYPES.folder) {
        const localPath = joinPath(baseDir, uuidv4());
        await writeFileAsync(localPath, Buffer.from(base64Data, 'base64'));
        newFile.localPath = localPath;
      }
      const insertionInfo = await (await dbClient.filesCollection())
        .insertOne(newFile);
      const fileId = insertionInfo.insertedId.toString();
      if 
    }
}