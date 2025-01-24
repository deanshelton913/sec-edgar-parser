declare module "uuencode" {
  export function decode(str: string | Buffer): Buffer;
  export function encode(str: string | Buffer): Buffer;
}
