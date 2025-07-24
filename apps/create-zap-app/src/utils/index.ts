import { type ExecOptions, exec } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { Effect } from 'effect';
import { execa } from 'execa';
import fs from 'fs-extra';

const execAsync = promisify(exec);

export function ensureDirEffect(procedurePath: string) {
  return Effect.tryPromise(() => fs.ensureDir(path.dirname(procedurePath)));
}

export function writeFileEffect(
  procedurePath: string,
  procedureContent: string
) {
  return Effect.tryPromise(() => fs.writeFile(procedurePath, procedureContent));
}

export function fetchEffect(url: string) {
  return Effect.tryPromise(() => fetch(url));
}

export function toArrayBufferEffect(response: Response) {
  return Effect.tryPromise(() => response.arrayBuffer());
}

export function writeFileFromBuffer(filePath: string, buffer: Buffer) {
  return Effect.tryPromise(() => fs.writeFile(filePath, buffer));
}

export function removeFileEffect(filePath: string) {
  return Effect.tryPromise(() => fs.remove(filePath));
}

export function execaEffect(command: string, args: string[]) {
  return Effect.tryPromise(() => execa(command, args));
}

export function readdirEffect(dirPath: string) {
  return Effect.tryPromise(() => fs.readdir(dirPath));
}

export function moveSyncEffect(
  srcPath: string,
  destPath: string,
  options?: fs.MoveOptions
) {
  return Effect.try(() => fs.moveSync(srcPath, destPath, options));
}

export function joinPathEffect(...paths: string[]) {
  return Effect.try(() => path.join(...paths));
}

export function existsSyncEffect(filePath: string) {
  return Effect.try(() => fs.existsSync(filePath));
}

export function readJsonEffect(filePath: string, options?: fs.JsonReadOptions) {
  return Effect.tryPromise(() => fs.readJson(filePath, options));
}

export function writeJsonEffect(
  filePath: string,
  data: unknown,
  options?: fs.JsonWriteOptions
) {
  return Effect.tryPromise(() => fs.writeJson(filePath, data, options));
}

export function execAsyncEffect(command: string, options: ExecOptions) {
  return Effect.tryPromise(() => execAsync(command, options));
}

export function readFileEffect(filePath: string, encoding: BufferEncoding) {
  return Effect.tryPromise(() => fs.readFile(filePath, encoding));
}
